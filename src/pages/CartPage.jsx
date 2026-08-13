import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Store, Truck, X, ChevronLeft, ChevronRight, Tag, ChevronDown } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useStoreData } from '../store/useStoreData';

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeFromCart, updateQuantity, getSubtotal, getTotal, getDiscount, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { products } = useStoreData();
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const { showToast } = useToastStore();

  const getLiveStock = (item) => {
    const liveProduct = products.find(p => p.id === item.product.id);
    if (!liveProduct) return item.variant?.stock ?? 0;
    let variants = liveProduct.variants;
    if (typeof variants === 'string') try { variants = JSON.parse(variants); } catch { variants = []; }
    for (const v of (variants || [])) {
      const s = (v.sizes || []).find(s => s.size === item.variant?.size);
      if (s) return Number(s.stock ?? 0);
    }
    return Number(liveProduct.stock ?? 0);
  };

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [vacation, setVacation] = useState({ is_active: false, message: '' });
  const [showVacationModal, setShowVacationModal] = useState(false);

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => setPickupEnabled(d.settings?.pickup_enabled ?? false))
      .catch(() => {});
    fetch(`${BACKEND_URL}/general/settings/vacation`)
      .then(r => r.json())
      .then(d => setVacation(d))
      .catch(() => {});
  }, []);

  const handleCheckout = () => {
    if (vacation.is_active) { setShowVacationModal(true); return; }

    // Validate coupon locally before showing modal (no network call)
    if (appliedCoupon) {
      const cartQty = items.reduce((s, i) => s + i.qty, 0);
      if (appliedCoupon.min_type === 'qty' && cartQty < (appliedCoupon.min_qty || 0)) {
        removeCoupon(); setCouponCode('');
        showToast(`Coupon removed: need at least ${appliedCoupon.min_qty} item(s)`, 'error');
        return;
      }
      if (appliedCoupon.min_type !== 'qty' && subtotal < (appliedCoupon.min_order_value || 0)) {
        removeCoupon(); setCouponCode('');
        showToast(`Coupon removed: minimum order ₹${appliedCoupon.min_order_value} required`, 'error');
        return;
      }
    }

    // Show modal immediately — no API delay
    setShowDeliveryModal(true);
  };

  const handleDeliveryChoice = async (type) => {
    setShowDeliveryModal(false);
    // Stock check on delivery choice (done in background while navigating)
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
      const stockRes = await fetch(`${BACKEND_URL}/general/check-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        if (!stockData.available && stockData.unavailable?.length > 0) {
          const names = stockData.unavailable.map(u => `"${u.name}" (${u.available ?? 0} available)`).join(', ');
          showToast(`Stock unavailable: ${names}`, 'error');
          return;
        }
      }
    } catch {}
    navigate('/checkout', { state: { couponCode, orderType: type } });
  };

  const subtotal = getSubtotal();
  const grandTotal = getTotal();
  const discount = getDiscount();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BACKEND_URL}/general/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartValue: subtotal, cartQty: items.reduce((s, i) => s + i.qty, 0), user_id: user?.id, cartItems: items })
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.coupon);
        showToast('Coupon applied successfully!');
        setShowCouponInput(false);
      } else {
        showToast(data.error || 'Invalid coupon', 'error');
      }
    } catch {
      showToast('Error validating coupon', 'error');
    }
  };
  return (
    <div className="min-h-screen bg-white font-sans pb-28">

      {/* ── Yellow Hero Header ── */}
      <div className="bg-[#FFC107] pt-12 pb-10 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            My Cart ({items.reduce((s, i) => s + i.qty, 0)})
          </h1>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            Deliver to <ChevronDown className="w-3 h-3" />
          </p>
          <p className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
            Aspari main road opposite APGB Bank, 518347 <ChevronDown className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* ── White Card ── */}
      <div className="bg-white rounded-t-[28px] -mt-5 relative z-10 min-h-screen">

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 pt-24 gap-5">
            <div className="w-24 h-24 bg-[#FFF8E1] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-[#FFC107]" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-400 text-sm text-center">Add items to your cart to place an order.</p>
            <button onClick={() => navigate('/')} className="w-full bg-[#D61A3C] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#D61A3C]/30">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 px-4 pt-2">
              {items.map((item, idx) => {
                const imgSrc = item.variant?.image
                  || (Array.isArray(item.product.images) && item.product.images[0])
                  || item.product.image_url;
                const price = Number(item.variant?.price || item.product.price || 0);
                const mrp = Number(item.variant?.mrp || item.variant?.our_price || price);

                return (
                  <div key={`${item.product.id}-${item.variant?.size || 'default'}`} className="py-4 flex gap-3 items-center">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-[#FFF8E1] rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={imgSrc || 'https://placehold.co/80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <Link to={`/product/${item.product.id}`} className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">{item.variant?.size || 'Standard'}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-bold text-[#D61A3C]">₹{price.toLocaleString()}</span>
                            {mrp > price && (
                              <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.variant)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Qty control */}
                      <div className="flex items-center mt-2">
                        <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.variant, Math.max(1, item.qty - 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                          <button
                            onClick={() => {
                              const liveStock = getLiveStock(item);
                              if (item.qty >= liveStock) { showToast(`Only ${liveStock} in stock`, 'error'); return; }
                              updateQuantity(item.product.id, item.variant, item.qty + 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-[#D61A3C] hover:bg-red-50 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Coupon Row */}
            <div className="mx-4 mt-2 border-t border-gray-100 pt-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-bold text-green-600">{appliedCoupon.code} applied!</p>
                      <p className="text-xs text-gray-400">You save ₹{discount.toFixed(0)}</p>
                    </div>
                  </div>
                  <button onClick={() => { removeCoupon(); setCouponCode(''); }} className="text-red-500 text-xs font-bold">Remove</button>
                </div>
              ) : showCouponInput ? (
                <div className="py-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D61A3C]/50"
                    />
                    <button onClick={handleApplyCoupon} className="bg-[#D61A3C] text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                      Apply
                    </button>
                  </div>
                  <button onClick={() => setShowCouponInput(false)} className="text-xs text-gray-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowCouponInput(true)} className="w-full flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                      <Tag className="w-4 h-4 text-[#D61A3C]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Apply Coupon</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Bill Summary */}
            <div className="mx-4 mt-3 bg-gray-50 rounded-2xl p-4 space-y-3">
              <p className="font-bold text-gray-800 text-sm">Bill Details</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Item Total</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">- ₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                <span>To Pay</span>
                <span className="text-[#D61A3C]">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">To Pay</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900">₹{grandTotal.toFixed(0)}</span>
                {subtotal > grandTotal && (
                  <span className="text-sm text-gray-400 line-through">₹{subtotal.toFixed(0)}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-[#D61A3C] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#D61A3C]/30 text-base active:scale-95 transition-transform"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Delivery Method Modal (3 Options) */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-[70]">
          <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">How to receive your order?</h2>
              <button onClick={() => setShowDeliveryModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 pb-8">
              <button onClick={() => handleDeliveryChoice('shipping')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#FFC107] hover:bg-[#FFF8E1] transition-all text-left">
                <div className="w-12 h-12 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#D61A3C]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Home Delivery</p>
                  <p className="text-xs text-gray-400 mt-0.5">Deliver to my address • Shipping fee applies</p>
                </div>
              </button>
              <button onClick={() => handleDeliveryChoice('pickup')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#FFC107] hover:bg-[#FFF8E1] transition-all text-left">
                <div className="w-12 h-12 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#D61A3C]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Store Pickup</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ordering from home, I'll pick up • No shipping fee</p>
                </div>
              </button>
              <button onClick={() => handleDeliveryChoice('direct')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#FFC107] hover:bg-[#FFF8E1] transition-all text-left">
                <div className="w-12 h-12 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#D61A3C]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Direct Order</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ordering from shop, picking up now • No shipping fee</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <h2 className="font-bold text-xl text-gray-900">Orders Temporarily Paused</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {vacation.message || 'We are temporarily not accepting orders. Please check back soon!'}
            </p>
            <button onClick={() => setShowVacationModal(false)} className="w-full bg-[#D61A3C] text-white font-bold py-3 rounded-2xl">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

