import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Store, CheckCircle, CreditCard, ChevronLeft, UserCircle2, ShoppingCart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements } from '@stripe/react-stripe-js';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function StripeCardForm({ onReady }) {
  const elements = useElements();
  useEffect(() => {
    if (elements) onReady(elements.getElement(CardElement));
  }, [elements]);
  return (
    <div className="p-3 border border-brand-red/10 rounded-xl bg-white">
      <CardElement options={{
        style: {
          base: { fontSize: '16px', color: '#08183A', '::placeholder': { color: '#9ca3af' } },
          invalid: { color: '#ef4444' }
        }
      }} />
    </div>
  );
}

export function PickupPage() {
  const navigate = useNavigate();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [step, setStep] = useState(token ? 2 : 1); // 1: Auth, 2: Details, 3: Payment
  const [details, setDetails] = useState({
    name: user?.name || '',
    mobile: user?.phone || ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [stripeCardElement, setStripeCardElement] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [taxConfig, setTaxConfig] = useState(null);
  const [taxAmount, setTaxAmount] = useState(0);
  const finalTotal = subtotal - discount + taxAmount;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => setTaxConfig(d))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!taxConfig || !taxConfig.settings) return;
    
    // Tax on subtotal after discount
    const taxable = subtotal - discount;
    const tax = taxable * ((taxConfig.settings.tax_percentage ?? 0) / 100);
    setTaxAmount(tax);
  }, [taxConfig, subtotal, discount]);

  const couponCode = appliedCoupon?.code || '';

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder]);

  // If user logs in mid-way
  useEffect(() => {
    if (token && step === 1) {
      setStep(2);
      if (user) {
        setDetails(prev => ({ ...prev, name: user.name, mobile: user.phone }));
      }
    }
  }, [token, step, user]);

  useGSAP(() => {
    if (isPlacingOrder) {
      const tl = gsap.timeline();
      
      tl.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        .from(iconRef.current, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
        .from(textRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, "-=0.2")
        .to(iconRef.current, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', delay: 0.2 });
    }
  }, { dependencies: [isPlacingOrder] });

  const createOrder = async (pMethod) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items,
        address: { name: details.name, mobile: details.mobile }, // Save name/mobile in address field for pickup
        total: finalTotal,
        coupon_code: couponCode,
        payment_method: pMethod,
        order_type: 'pickup'
      })
    });
    return res.json();
  };

  const handleProceedToPayment = () => {
    if (!details.name.trim() || !details.mobile.trim()) {
      showToast('Please provide name and mobile number.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(details.mobile)) {
      showToast('Phone number must be exactly 10 digits.', 'error');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const intentRes = await fetch(`${BACKEND_URL}/general/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const intentData = await intentRes.json();
      if (!intentData.success) {
        showToast('Failed to initialize payment', 'error');
        setIsPlacingOrder(false);
        return;
      }

      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: stripeCardElement,
          billing_details: { name: details.name }
        }
      });

      if (error) {
        showToast(error.message || 'Payment failed', 'error');
        setIsPlacingOrder(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const createOrderData = await createOrder('stripe');
        if (createOrderData.success) {
          setTimeout(() => {
            clearCart();
            navigate(`/order-tracking/${createOrderData.order.order_number}`);
          }, 2000);
        } else {
          showToast('Failed to place order after payment.', 'error');
          setIsPlacingOrder(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Payment error. Please try again.', 'error');
      setIsPlacingOrder(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6 px-2 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-red/10">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/cart')}>
        <div className="w-6 h-6 rounded-full bg-white text-brand-red flex items-center justify-center text-xs font-bold border border-brand-red/10">✓</div>
        <span className="text-[10px] text-gray-900 font-bold mt-1">Cart</span>
      </div>
      <div className="h-px bg-white flex-1 mx-2"></div>
      
      <div className="flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(1)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 1 ? 'bg-white text-brand-red border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/60 border-brand-dark-blue/10'}`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 1 ? 'text-gray-900' : 'text-gray-900/60'}`}>Login</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step > 1 ? 'bg-white' : 'bg-brand-red text-white/30'}`}></div>

      <div className="flex flex-col items-center cursor-pointer" onClick={() => step > 2 && setStep(2)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 2 ? 'bg-white text-brand-red border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/60 border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-gray-900' : 'text-gray-900/60'}`}>Details</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step > 2 ? 'bg-white' : 'bg-brand-red text-white/30'}`}></div>

      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 3 ? 'bg-white text-brand-red border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/60 border-brand-dark-blue/10'}`}>
          3
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-gray-900' : 'text-gray-900/60'}`}>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige pb-36">
      <Header title="Store Pickup Checkout" />
      
      <div className="p-4 md:p-8 md:max-w-7xl mx-auto mt-6">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')} 
          className="flex items-center text-sm font-bold text-gray-900 hover:text-brand-red transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {step === 1 ? 'Back to Cart' : 'Back'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Steps */}
          <div className="lg:col-span-8">
            {/* Mobile Order Summary (collapsible) */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setSummaryOpen(o => !o)}
                className="w-full flex items-center justify-between bg-white/90 border border-brand-red/10 rounded-2xl px-4 py-3.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-red" />
                  <span className="text-sm font-bold text-gray-900">Order Summary</span>
                  <span className="text-xs bg-brand-red text-white/10 text-brand-red font-bold px-2 py-0.5 rounded-full">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brand-red">${finalTotal.toFixed(2)}</span>
                  <svg className={`w-4 h-4 text-gray-900/50 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {summaryOpen && (
                <div className="mt-2 bg-white/90 border border-brand-red/10 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map(item => (
                      <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-3">
                        <div className="w-14 h-14 bg-white rounded-xl border border-brand-red/10 p-1 shrink-0">
                          <img src={item.product.images?.[0] || item.product.image_url} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-900/60">Qty: {item.qty} | {item.variant?.size || 'Standard'}</p>
                          <p className="text-sm font-bold text-brand-red">${((item.variant?.price || item.product.price) * item.qty).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-brand-red/10 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-900/70">
                      <span>Item Total</span><span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-brand-red">
                        <span>Coupon ({appliedCoupon.code})</span><span>- ${discount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-900/70">
                        <span>Tax ({taxConfig?.settings?.tax_percentage ?? 0}%)</span>
                        <span className="font-medium">${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-brand-red/10">
                      <span>Grand Total</span><span className="text-brand-red">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {renderStepIndicator()}

            {step === 1 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white/10 flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-brand-red" />
                  </div>
                  Account Details
                </h2>
                <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-brand-red/10 flex flex-col items-center justify-center text-center">
                  <UserCircle2 className="w-16 h-16 text-brand-red mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to Secure Checkout</h3>
                  <p className="text-sm text-gray-900/60 mb-8 max-w-sm">Log in to your account for a faster checkout experience and to earn loyalty points on this purchase.</p>
                  
                  <div className="w-full max-w-sm space-y-3 flex flex-col items-center">
                    <button 
                      onClick={() => navigate('/login', { state: { returnTo: '/pickup' } })}
                      className="w-full bg-white text-brand-red font-bold py-3 rounded-xl shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Login to your account
                    </button>
                    <div className="flex items-center w-full gap-3 py-2">
                      <div className="h-px bg-brand-red text-white/20 flex-1"></div>
                      <span className="text-xs font-bold text-gray-900/40 uppercase">or</span>
                      <div className="h-px bg-brand-red text-white/20 flex-1"></div>
                    </div>
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-brand-beige-darker text-gray-900 border border-brand-dark-blue/10 font-bold py-3 rounded-xl hover:bg-brand-beige transition-colors"
                    >
                      Checkout as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white/10 flex items-center justify-center">
                    <Store className="w-4 h-4 text-brand-red" />
                  </div>
                  Pickup Details
                </h2>
                
                <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-brand-red/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-gold/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                      <input required value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-100 py-1 focus:outline-none focus:border-brand-red/10 transition-colors bg-transparent" placeholder="Full Name for Pickup" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mobile</label>
                      <input type="text" maxLength={10} required value={details.mobile} onChange={e => setDetails({...details, mobile: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-red/10 transition-colors bg-transparent" placeholder="Mobile Number" />
                    </div>
                    <div className="mt-4 p-4 bg-white border border-brand-dark-blue/10 rounded-xl">
                      <p className="text-sm text-gray-900 font-bold flex items-center gap-2"><Store className="w-4 h-4 text-brand-red"/> Pickup Location</p>
                      <p className="text-xs text-gray-900/80 mt-1">Manikanta Super Market Store, Main Market, City Center</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-brand-red" />
                  </div>
                  Payment Method
                </h2>

                <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-red/10">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Card Details</p>
                  <Elements stripe={stripePromise}>
                    <StripeCardForm onReady={setStripeCardElement} />
                  </Elements>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-brand-red/10">
              <h3 className="font-serif font-bold text-gray-900 mb-6 text-xl">Order Summary</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar pr-2 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-brand-red/10 p-1 shrink-0">
                      <img src={item.product.images?.[0] || item.product.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-900/60 mt-1">Qty: {item.qty} | {item.variant?.size || 'Std'}</p>
                      <p className="text-sm font-bold text-brand-red mt-1">${(item.variant?.price || item.product.price) * item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-brand-red/10 pt-4 mb-6">
                <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-red mb-2">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-medium">- ${discount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                    <span>Tax ({taxConfig?.settings?.tax_percentage ?? 0}%)</span>
                    <span className="font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-xl pt-2 border-t border-brand-red/10">
                  <span>Grand Total</span>
                  <span className="text-brand-red">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {step === 1 ? (
                <button 
                  disabled
                  className="w-full bg-brand-beige-darker text-gray-900/50 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed"
                >
                  Select Checkout Method
                </button>
              ) : step === 2 ? (
                <button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-white text-brand-red font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
                    isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-gray-900/50' : 'bg-white text-brand-red shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </div>
                  ) : 'Confirm & Pay'}
                </button>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-beige/95 backdrop-blur-md border-t border-brand-red/10 p-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mx-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-1">Payable Amount</p>
              <div className="flex flex-col">
                {appliedCoupon && <span className="text-[10px] text-brand-red font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                <p className="text-2xl font-bold text-gray-900 leading-none">${finalTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {step === 1 ? (
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-400 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed"
            >
              Select Checkout Method
            </button>
          ) : step === 2 ? (
            <button 
              onClick={handleProceedToPayment}
              className="w-full bg-white text-brand-red font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <span className="w-1 h-1 bg-white rounded-full mx-1 opacity-50" />
              
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`w-full font-bold text-base rounded-xl py-4 shadow-lg flex items-center justify-center gap-2 transition-all ${
                isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-gray-900/50 shadow-none' : 'bg-white text-brand-red shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </div>
              ) : 'Confirm Order'}
            </button>
          )}
        
        <div className="flex items-center justify-center gap-1 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] text-gray-400 font-medium">Your order is safe and secure</span>
        </div>
        </div>
      </div>

      {/* Order Placed Success Overlay */}
      {isPlacingOrder && (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-4">
            <div ref={iconRef} className="w-24 h-24 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 ref={textRef} className="text-2xl font-serif font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-sm text-gray-500">Redirecting to tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
