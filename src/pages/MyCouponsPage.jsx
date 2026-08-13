import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Ticket, Calendar, Copy, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function MyCouponsPage() {
  const { token } = useAuthStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/my-coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCoupons();
  }, [token]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-beige pb-20">
      <Header title="My Coupons" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-24">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Available Coupons</h1>
        <p className="text-gray-900/60 text-sm mb-8">Exclusive discounts and offers curated for you.</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-dark-blue/20 border-t-brand-dark-blue rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-brand-red/10 shadow-sm">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-brand-red/40" />
            </div>
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">No coupons available</h3>
            <p className="text-gray-900/60">Check back later for new offers and discounts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={coupon.id} 
                className="bg-white rounded-2xl border border-brand-red/10 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-gold/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 bg-white text-gray-900 px-3 py-1.5 rounded-lg border border-brand-dark-blue/10">
                      <Ticket className="w-4 h-4" />
                      <span className="font-bold tracking-wider">{coupon.code}</span>
                    </div>
                    {coupon.user_id && (
                      <span className="bg-brand-red text-white/20 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Personal
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                  </h3>
                  
                  <div className="space-y-1.5 text-sm text-gray-900/60 mb-6">
                    <p>
                      Min Requirement:{' '}
                      <span className="font-semibold text-gray-900">
                        {coupon.min_type === 'qty'
                          ? `${coupon.min_qty || 0} item(s)`
                          : `$${coupon.min_order_value}`}
                      </span>
                    </p>
                    <p>
                      Usage:{' '}
                      <span className="font-semibold text-gray-900">
                        {coupon.usage_type === 'one_time' ? 'One Time Only' : 'Multiple Times'}
                      </span>
                    </p>
                    {coupon.expires_at && (
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Valid till:{' '}
                        <span className="font-semibold text-gray-900">
                          {new Date(coupon.expires_at).toLocaleDateString('en-IN')}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleCopy(coupon.code)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    copiedCode === coupon.code 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                      : 'bg-white text-brand-red hover:bg-white shadow-lg shadow-brand-dark-blue/20'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <><CheckCircle2 className="w-4 h-4" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Code</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
