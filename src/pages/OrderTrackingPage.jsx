import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Store, Truck, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import confetti from 'canvas-confetti';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = React.useState(null);

  useEffect(() => {
    // Fetch order details
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${BACKEND_URL}/general/order/${orderId}`, { headers })
      .then(r => r.json())
      .then(d => { if (d.order) setOrder(d.order); })
      .catch(() => {});

    // Fire confetti
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#08183A', '#7D2A2A', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans flex flex-col">
      <Header title="Order Confirmation" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 mt-8 max-w-2xl mx-auto w-full">
        
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-60 scale-150"></div>
          <CheckCircle2 className="w-28 h-28 text-[#D61A3C] relative z-10 drop-shadow-md" strokeWidth={1.5} />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center space-y-3 mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Order Placed Successfully!</h1>
          <p className="text-gray-500 text-sm md:text-base">Thank you for shopping with Manikanta Super Market. Your order is being prepared and will be with you shortly!</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-full -z-0"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Number</p>
                <p className="text-lg font-bold text-gray-900">#{orderId}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                order?.order_type === 'pickup' ? 'bg-[#FFF8E1] text-[#D61A3C] border border-[#FFC107]/30' : 'bg-red-50 text-[#D61A3C] border border-red-100'
              }`}>
                {order?.order_type === 'pickup' ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                {order?.order_type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                {order?.created_at
                  ? new Date(order.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })
                  : new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })}
              </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {order?.order_type === 'pickup' ? 'Pickup Status' : 'Est. Shipping'}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {order?.order_type === 'pickup' ? 'We will contact you' : 'Within 1-3 Business Days'}
                </p>
              </div>
            </div>

            {/* Transaction ID */}
            {order?.razorpay_payment_id && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-gray-900 break-all">{order.razorpay_payment_id}</p>
              </div>
            )}

            {/* Items */}
            {order?.items?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Ordered</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                    {(item.product?.images?.[0] || item.product?.image_url || item.image_url) && (
                      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white p-1 shrink-0 overflow-hidden">
                        <img src={item.product?.images?.[0] || item.product?.image_url || item.image_url} alt={item.product?.name || item.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || item.name}{item.variant?.color ? ` — ${item.variant.color}` : ''}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">Qty: {item.qty || 1}</span>
                        {(item.variant?.code || item.product?.product_code || item.product_code) && (
                          <span className="text-xs font-bold bg-[#FFC107] text-white px-2 py-0.5 rounded-md shadow-sm">
                            #{item.variant?.code || item.product?.product_code || item.product_code}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-800 shrink-0">₹{Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pickup Info Banner */}
            {order?.order_type === 'pickup' && (
              <div className="bg-[#FFF8E1] border border-[#FFC107]/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#D61A3C] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Pickup Notification</p>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                      Once your order is ready, our team will message you for pickup via <strong>WhatsApp/Text message</strong> from <strong>+91 98660 48155</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-[#FFC107]/20 pt-3">
                  <MapPin className="w-5 h-5 text-[#D61A3C] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Pickup Location</p>
                    <p className="text-xs text-gray-700 mt-1">Aspari main road opposite APGB Bank, 518347</p>
                    <a
                      href="https://maps.google.com/?q=Aspari+main+road+opposite+APGB+Bank,+518347"
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#D61A3C] font-bold underline mt-1 inline-block hover:text-[#b81633]"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-full space-y-4"
        >
          <button 
            onClick={() => navigate('/category/all')}
            className="w-full bg-gradient-to-r from-brand-gold to-brand-dark-blue text-white font-bold text-base rounded-2xl py-4 shadow-lg shadow-brand-gold/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ShoppingBag className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-white text-gray-700 font-bold text-base rounded-2xl py-4 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            Go to Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
