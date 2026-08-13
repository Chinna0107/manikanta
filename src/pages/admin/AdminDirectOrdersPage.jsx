import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronDown, MessageCircle, FileText } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const PICKUP_STATUSES = ['pending', 'processing', 'ready for pickup', 'pickup completed', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  'ready for pickup': 'bg-orange-100 text-orange-700',
  'pickup completed': 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function AdminDirectOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.orders) setOrders(d.orders.filter(o => o.order_type === 'direct')); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const notifyWhatsApp = (order) => {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const phone = (order.user_phone || address.mobile || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hi ${order.user_name || address.name || 'Customer'}! Your order #${order.order_number || order.id} status is now: *${order.status}*.\n\n` +
      (order.status === 'ready for pickup'
        ? `Your order is ready for pickup at *Aspari main road opposite APGB Bank, 518347*. Please come pick it up at your convenience! 🏪`
        : `Thank you for shopping with Manikanta Super Market! 🙏`)
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  const filtered = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6" /> Direct Orders
          </h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">{orders.length} total</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {['all', ...PICKUP_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold font-sans capitalize transition-colors ${
              statusFilter === s
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-white border border-brand-red/20 text-gray-900/60 hover:border-brand-red/40'
            }`}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-red/10 p-10 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-900/50 font-sans text-sm">
            {orders.length === 0 ? 'No direct orders yet.' : `No ${statusFilter} direct orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((order, i) => {
            let address = {};
            try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
            const name = order.user_name || address.name || 'Guest';
            const phone = order.user_phone || address.mobile || '—';
            const email = order.user_email || address.email || '—';

            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-brand-red/10 overflow-hidden">

                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 cursor-pointer hover:bg-[#FDF8F0]/30 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="font-serif font-bold text-gray-900 text-sm sm:text-base">MSM - {order.order_number || order.id}</span>
                      <span className="text-gray-900/50 text-[10px] sm:text-xs font-sans">
                        {new Date(order.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-bold font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-900/60 text-[10px] sm:text-xs font-sans mt-0.5 truncate">{name}</p>
                  </div>
                  <span className="font-serif font-bold text-brand-orange text-sm sm:text-base lg:text-lg flex-shrink-0">${order.total}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-900/40 transition-transform flex-shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`} />
                </div>

                {expanded === order.id && (
                  <div className="border-t border-brand-red/5 p-3 sm:p-4 lg:p-5 space-y-4">

                    {/* Status Update */}
                    <div>
                      <p className="text-[10px] font-sans text-gray-900/40 uppercase tracking-wider mb-2">Update Status</p>
                      <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[#FDF8F0] border border-brand-red/10 text-gray-900 font-sans text-sm focus:outline-none">
                        {PICKUP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Customer Details */}
                    <div className="pt-4 border-t border-brand-red/5">
                      <p className="text-[10px] font-sans text-gray-900/40 uppercase tracking-wider mb-3">Customer Details</p>
                      <div className="bg-[#FDF8F0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-gray-900/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Name</span>
                          <span className="text-sm font-semibold text-gray-900">{name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-gray-900/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Phone</span>
                          <span className="text-sm font-semibold text-gray-900">{phone}</span>
                        </div>
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <span className="text-[10px] font-bold text-gray-900/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Email</span>
                          <span className="text-sm font-semibold text-gray-900 break-all">{email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-gray-900/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Payment</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{order.payment_method === 'razorpay' ? 'Online (Razorpay)' : order.payment_method || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="pt-4 border-t border-brand-red/5">
                      <p className="text-[10px] font-sans text-gray-900/40 uppercase tracking-wider mb-3">Order Items</p>
                      <div className="space-y-3">
                        {(typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])).map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0">
                              <img src={item.product?.images?.[0] || item.product?.image_url} alt="" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <p className="text-xs text-gray-500">{item.variant?.size ? `Size: ${item.variant.size}` : 'Standard'} • Qty: {item.qty}</p>
                                {(item.product?.product_code || item.product_code) && (
                                  <span className="text-xs font-bold text-brand-orange bg-brand-orange text-white/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                                    MSM - {item.product?.product_code || item.product_code}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-brand-orange">
                              ${(item.variant?.price || item.product?.price || 0) * item.qty}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-brand-red/5">
                      <button onClick={() => notifyWhatsApp(order)}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> Notify via WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
