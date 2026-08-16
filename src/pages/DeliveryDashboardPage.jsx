import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, MapPin, Phone, CheckCircle, Clock, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DeliveryDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned"); // 'assigned' | 'delivered'
  const [updating, setUpdating] = useState({});
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/delivery/login");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/delivery/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as delivered?")) return;
    
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/delivery/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark as delivered");
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered', delivered_at: new Date() } : o));
      alert("Order marked as delivered!");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const assignedOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const displayOrders = activeTab === "assigned" ? assignedOrders : deliveredOrders;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand-orange text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <h1 className="font-serif font-bold text-xl">Delivery Portal</h1>
          </div>
          <button 
            onClick={() => { logout(); navigate('/delivery/login'); }}
            className="flex items-center gap-1.5 text-orange-100 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Pending</p>
              <p className="text-2xl font-bold text-brand-orange">{assignedOrders.length}</p>
            </div>
            <div className="w-px bg-gray-100"></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{deliveredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "assigned" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Assigned ({assignedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "delivered" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Delivered ({deliveredOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading orders...</div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No {activeTab} orders found.</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayOrders.map(order => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 font-medium">ORDER ID</span>
                      <p className="font-bold text-gray-900">#{order.order_number || order.id}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 font-medium">AMOUNT TO COLLECT</span>
                      <p className="font-bold text-brand-orange text-lg">
                        ₹{(order.payment_method === 'COD' || order.payment_method === 'cod') 
                          ? (Number(order.total) - Number(order.advance_paid || 0)).toFixed(2) 
                          : '0.00 (Paid)'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">{order.address?.name || order.user_name}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {order.address?.line1 || order.address?.address_line1}, {(order.address?.line2 || order.address?.address_line2) ? `${order.address.line2 || order.address.address_line2}, ` : ''}{order.address?.city}, {order.address?.state} {order.address?.pincode}
                        </p>
                        {order.address?.google_map_link && (
                          <a 
                            href={order.address.google_map_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-2 hover:underline"
                          >
                            <Navigation className="w-3 h-3" />
                            Open in Google Maps
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${order.address?.mobile || order.address?.phone || order.user_phone || order.phone}`} className="font-bold text-gray-900 hover:text-brand-orange transition-colors">
                        {order.address?.mobile || order.address?.phone || order.user_phone || order.phone}
                      </a>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 flex items-center gap-2 border-t border-gray-100">
                    <Package className="w-4 h-4" />
                    <span>{order.items?.length || 0} items in this package</span>
                  </div>

                  {/* Actions */}
                  {activeTab === "assigned" ? (
                    <div className="p-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleDeliver(order.id)}
                        disabled={updating[order.id]}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        {updating[order.id] ? (
                          "Updating..."
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Mark as Delivered
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-t border-gray-100 bg-emerald-50/50">
                      <p className="text-center text-sm font-bold text-emerald-700 flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Delivered on {new Date(order.delivered_at || order.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
