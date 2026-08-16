import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, MapPin, CreditCard, ChevronLeft, ShoppingCart, Store, Pencil, X, Check } from 'lucide-react';

import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLoadScript } from '@react-google-maps/api';


const GOOGLE_MAPS_LIBRARIES = ['places'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";


import { COUNTRIES } from '../data/countries';

function flag(code) {
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function AddressAutocomplete({ value, onChange, onSelect }) {
  const [inputVal, setInputVal] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [apiError, setApiError] = useState(false); // true when quota/API fails
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps?.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      } catch (err) {
        setApiError(true);
      }
    } else {
      // Google Maps not loaded at all — go straight to manual mode
      setApiError(true);
    }
  }, []);

  // Sync external value into the input (but don't override if user is typing)
  useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setInputVal(v);
    onChange(v);
    if (apiError) return; // no autocomplete if API is down
    clearTimeout(debounceTimer.current);
    if (!v.trim() || !autocompleteService.current) { setSuggestions([]); return; }
    debounceTimer.current = setTimeout(() => {
      autocompleteService.current.getPlacePredictions({ input: v }, (results, status) => {
        const PS = window.google.maps.places.PlacesServiceStatus;
        if (status === PS.OK) {
          setSuggestions(results);
        } else {
          setSuggestions([]);
          // Quota exhausted or request denied → switch to manual mode permanently
          if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED || status === 'UNKNOWN_ERROR') {
            setApiError(true);
          }
        }
      });
    }, 300);
  };

  const handleSelect = (suggestion) => {
    setSuggestions([]);
    placesService.current.getDetails(
      { placeId: suggestion.place_id, fields: ['address_components'] },
      (place, status) => {
        const PS = window.google.maps.places.PlacesServiceStatus;
        if (status !== PS.OK) {
          // If getDetails fails, at minimum fill in what we have from the suggestion text
          const line1 = suggestion.structured_formatting.main_text;
          setInputVal(line1);
          onChange(line1);
          if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED) setApiError(true);
          return;
        }
        const components = place.address_components || [];
        const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';
        const line1 = `${get('street_number')} ${get('route')}`.trim() || get('premise') || get('sublocality_level_1') || suggestion.structured_formatting.main_text;
        setInputVal(line1);
        onChange(line1);
        onSelect({
          line1,
          city: get('locality') || get('administrative_area_level_2') || get('postal_town'),
          state: get('administrative_area_level_1'),
          pincode: get('postal_code'),
          country: get('country'),
        });
      }
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {apiError ? (
        // ── Manual fallback mode ───────────────────────────────────────
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-xs font-semibold">Address lookup unavailable. Please type your address manually.</span>
          </div>
          <input
            value={inputVal}
            onChange={handleInput}
            placeholder="Enter your full address..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
          />
        </div>
      ) : (
        // ── Autocomplete mode ──────────────────────────────────────────
        <div>
          <MapPin className="w-4 h-4 text-brand-red absolute left-3.5 top-[13px] pointer-events-none" />
          <input
            value={inputVal}
            onChange={handleInput}
            placeholder="Start typing your address..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
          />
          <p className="text-[10px] text-gray-400 mt-1 pl-1">You can edit this field freely after selecting a suggestion.</p>
          {suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-red hover:text-white flex items-start gap-2.5 border-b border-gray-50 last:border-0 group transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-brand-red group-hover:text-white shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{s.structured_formatting.main_text}</span>
                      <span className="text-xs block text-gray-500 group-hover:text-white/80">{s.structured_formatting.secondary_text}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#08183A',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

function RazorpayPaymentForm({ isPlacingOrder, handlePlaceOrder, termsAccepted, setTermsAccepted, addressConfirmed, setAddressConfirmed, address, sessionSecondsLeft, onEditAddress, paymentError, onRetry }) {
  const isExpiringSoon = sessionSecondsLeft !== null && sessionSecondsLeft <= 60;
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-brand-red" />
          </div>
          Payment
        </h2>
        {sessionSecondsLeft !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            isExpiringSoon ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Session expires in {Math.floor(sessionSecondsLeft/60)}:{String(sessionSecondsLeft%60).padStart(2,'0')}
          </div>
        )}
      </div>

      {/* Shipping address confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-green-800 flex items-center gap-1.5">📍 Shipping To</p>
          <button type="button" onClick={onEditAddress}
            className="text-[11px] font-bold text-gray-900 underline hover:text-brand-red transition-colors">← Edit Address</button>
        </div>
        <div className="text-xs text-green-900 leading-relaxed">
          <p className="font-bold">{address.name}</p>
          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.pincode}</p>
          <p>{address.country}</p>
          <p className="text-green-700 mt-0.5">📞 {address.mobile}</p>
        </div>
        {address.line2 ? null : (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            💡 No apartment/suite number provided. If applicable, please <button type="button" onClick={onEditAddress} className="underline font-bold">go back and add it</button> to ensure accurate delivery.
          </p>
        )}
        <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-green-200">
          <input type="checkbox" checked={addressConfirmed} onChange={e => setAddressConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-700 shrink-0" />
          <span className="text-[11px] text-green-800 font-medium leading-relaxed">
            I confirm the above shipping address is correct and complete.
          </span>
        </label>
      </div>

      {/* Shipping T&C */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-blue-800">📦 Shipping Terms & Conditions</p>
        <ul className="space-y-1.5 text-xs text-blue-700 leading-relaxed">
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Shipping typically takes <strong>1–3 business days</strong> depending on your location.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>If your package arrives damaged or has missing items, <strong>photo proof is required</strong> and must be reported within <strong>1–2 business days</strong> of delivery to mani.worriers@gmail.com. No claims will be accepted without proof.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>All sales are <strong>final — no returns or exchanges</strong>. Items are fashion jewellery and sold as-is.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>To keep your jewellery looking its best: avoid contact with water, perfume, and harsh chemicals. Store in a dry place when not in use.</span></li>
        </ul>
      </div>

      <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-red/10 space-y-4">
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700">Payment Failed</p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{paymentError}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Try Again
              </button>
            </div>
          </div>
        )}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-dark-blue shrink-0" />
          <span className="text-[11px] text-gray-500 leading-relaxed">
            I agree to the Manikanta Super Market <a href="/terms-of-service" target="_blank" className="text-gray-900 font-bold underline">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" className="text-gray-900 font-bold underline">Privacy Policy</a>, understand that all sales are final—no returns or exchanges—as stated in the Shipping & Return Policy.
          </span>
        </label>
        <button
          onClick={() => handlePlaceOrder()}
          disabled={isPlacingOrder || !termsAccepted || !addressConfirmed}
          className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
            isPlacingOrder || !termsAccepted || !addressConfirmed
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-brand-red text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          {isPlacingOrder ? (
            <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : 'Pay via Razorpay'}
        </button>
      </div>
    </div>
  );
}


export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user, addAddress, addresses, fetchProfile, updateAddress } = useAuthStore();
  const { showToast } = useToastStore();

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  
  const [orderType, setOrderType] = useState(location.state?.orderType || 'shipping');
  const initialStep = token ? (location.state?.orderType === 'pickup' ? 3 : 2.5) : 1;
  const [step, setStep] = useState(initialStep);
  const [pickupContact, setPickupContact] = useState({ name: '', email: '', phone: '' });
  const [pickupDialCode, setPickupDialCode] = useState('IN');
  const [pickupDialOpen, setPickupDialOpen] = useState(false);
  const [pickupDialSearch, setPickupDialSearch] = useState('');
  const pickupDialRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [pickupTermsAccepted, setPickupTermsAccepted] = useState(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    if (user) {
      setPickupContact({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (pickupDialRef.current && !pickupDialRef.current.contains(e.target)) setPickupDialOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/checkout');
    } else {
      fetchProfile();
    }
  }, []);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    mobile: user?.phone || ''
  });
  const [dialCountryCode, setDialCountryCode] = useState('IN');
  const dialCode = COUNTRIES.find(c => c.code === dialCountryCode)?.dial || '+1';
  const [dialSearch, setDialSearch] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const dialRef = useRef(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false);
      if (dialRef.current && !dialRef.current.contains(e.target)) setDialOpen(false);
      if (editDialRef.current && !editDialRef.current.contains(e.target)) setEditDialOpen(false);
      if (editCountryRef.current && !editCountryRef.current.contains(e.target)) setEditCountryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [editingAddr, setEditingAddr] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editDialCode, setEditDialCode] = useState('IN');
  const [editDialOpen, setEditDialOpen] = useState(false);
  const [editDialSearch, setEditDialSearch] = useState('');
  const editDialRef = useRef(null);
  const [editCountryOpen, setEditCountryOpen] = useState(false);
  const [editCountrySearch, setEditCountrySearch] = useState('');
  const editCountryRef = useRef(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (addr) => {
    const stored = addr.mobile || '';
    // Match by country name first (most reliable), then fall back to dial prefix
    const byCountry = COUNTRIES.find(c => c.name === addr.country);
    const byDial = COUNTRIES.find(c => stored.startsWith(c.dial) && c.code === (byCountry?.code || 'US'));
    const matched = byCountry || byDial || COUNTRIES.find(c => stored.startsWith(c.dial));
    const dialPrefix = matched?.dial || '+1';
    const countryCode = matched?.code || 'US';
    const digits = stored.startsWith(dialPrefix) ? stored.slice(dialPrefix.length) : stored;
    setEditDialCode(countryCode);
    setEditForm({ ...addr, mobile: digits });
    setEditingAddr(addr.id);
  };

  const saveEdit = async () => {
    const dial = COUNTRIES.find(c => c.code === editDialCode)?.dial || '+1';
    const fullMobile = `${dial}${editForm.mobile}`;
    const data = { ...editForm, mobile: fullMobile };
    setSavingEdit(true);
    await updateAddress(editingAddr, data);
    if (selectedSavedAddress === editingAddr) {
      setAddress({ name: data.name, line1: data.line1, line2: data.line2 || '', city: data.city, state: data.state || '', pincode: data.pincode, country: data.country || 'India', mobile: editForm.mobile });
    }
    setSavingEdit(false);
    setEditingAddr(null);
  };

  const [transactionId, setTransactionId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null); // id of selected saved address
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxLabel, setTaxLabel] = useState('Tax (enter pincode)');
  const [useCoins, setUseCoins] = useState(false);
  const coinsDiscount = useCoins ? Math.min(parseFloat(user?.m_coins) || 0, subtotal - discount + shippingFee + taxAmount) : 0;
  const finalTotal = subtotal - discount + shippingFee + taxAmount - coinsDiscount;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => {
        setShippingConfig(d);
        const allowed = d?.settings?.allowed_countries || [];
        if (allowed.length > 0 && !allowed.includes(address.country)) {
          const defaultCountryName = allowed[0];
          setAddress(a => ({ ...a, country: defaultCountryName }));
          const cObj = COUNTRIES.find(c => c.name === defaultCountryName);
          if (cObj) setDialCountryCode(cObj.code);
        }
      })
      .catch(console.error);
  }, []);

  // Recompute shipping fee whenever config loads
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const threshold = parseFloat(shippingConfig.settings.free_shipping_threshold) || 0;
    const flat = parseFloat(shippingConfig.settings.flat_rate) || 0;
    setShippingFee(threshold > 0 && (subtotal - discount) >= threshold ? 0 : flat);
  }, [shippingConfig, subtotal, discount]);

  // Recompute tax whenever subtotal, discount, address pincode, or config changes
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const { tax_mode, tax_percentage } = shippingConfig.settings;
    const taxable = subtotal - discount;

    if (tax_mode === 'pincode') {
      const pin = address.pincode?.trim();
      const rule = pin ? (shippingConfig.pincodes || []).find(p => p.pincode === pin) : null;
      const pct = rule ? parseFloat(rule.percentage) : 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(rule ? `Tax (${pct}% — pincode ${pin})` : 'Tax (0% — pincode not matched)');
    } else {
      const pct = parseFloat(tax_percentage) || 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(`Tax (${pct}%)`);
    }
  }, [shippingConfig, subtotal, discount, address.pincode]);

  const couponCode = appliedCoupon?.code || location.state?.couponCode || '';

  // Redirect to cart if empty (only if order is not being placed and not succeeded)
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder && !orderSuccess) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder, orderSuccess]);

  // If user logs in mid-way
  useEffect(() => {
    if (token && step === 1) setStep(location.state?.orderType === 'pickup' ? 3 : 2.5);
  }, [token, step]);

  // Auto-select saved address or show new form
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedSavedAddress(def.id);
      const c = COUNTRIES.find(c => c.name === def.country);
      if (c) setDialCountryCode(c.code);
      // Strip dial code prefix from stored mobile if present
      const dialPrefix = c?.dial || '';
      const rawMobile = def.mobile || '';
      const mobileDigits = rawMobile.startsWith(dialPrefix) ? rawMobile.slice(dialPrefix.length) : rawMobile;
      setAddress({ name: def.name, line1: def.line1, line2: def.line2 || '', city: def.city, state: def.state || '', pincode: def.pincode, country: def.country || 'India', mobile: mobileDigits });
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
    }
  }, [addresses]);

  useGSAP(() => {
    if (orderSuccess) {
      const tl = gsap.timeline();
      
      tl.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        .from(iconRef.current, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
        .from(textRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, "-=0.2")
        .to(iconRef.current, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', delay: 0.2 });
    }
  }, { dependencies: [orderSuccess] });

  const createOrder = async (pMethod, razorpayOrderId = null, razorpayPaymentId = null, razorpaySignature = null) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items, address: (orderType === 'pickup') ? { name: pickupContact.name, mobile: `${COUNTRIES.find(c=>c.code===pickupDialCode)?.dial||'+1'}${pickupContact.phone}`, email: pickupContact.email } : address, total: finalTotal, coupon_code: couponCode, payment_method: pMethod, order_type: orderType, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, discount_amount: discount, shipping_fee: shippingFee, tax_amount: taxAmount, m_coins_used: coinsDiscount })
    });
    return res.json();
  };

  const handleProceedToPayment = async () => {
    if (orderType !== 'pickup') {
      const errs = {};
      if (!address.name.trim()) errs.name = 'Full name is required';
      if (!address.line1.trim()) errs.line1 = 'Address is required';
      if (!address.city.trim()) errs.city = 'City is required';
      if (!address.pincode.trim()) errs.pincode = 'ZIP code is required';
      if (!address.country.trim()) errs.country = 'Country is required';
      const mobileDigits = address.mobile.replace(/\D/g, '');
      if (!address.mobile.trim()) {
        errs.mobile = 'Phone number is required';
      } else if (['US', 'CA', 'IN'].includes(dialCountryCode) && mobileDigits.length !== 10) {
        errs.mobile = `Enter a valid 10-digit number`;
      } else if (!['US', 'CA', 'IN'].includes(dialCountryCode) && (mobileDigits.length < 5 || mobileDigits.length > 15)) {
        errs.mobile = 'Enter a valid phone number';
      }
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        showToast('Please fix the highlighted fields.', 'error');
        return;
      }
      setFieldErrors({});
      // Shippo address validation
      try {
        const token = localStorage.getItem('token');
        const valRes = await fetch(`${BACKEND_URL}/general/validate-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            name: address.name,
            street1: address.line1,
            street2: address.line2 || '',
            city: address.city,
            state: address.state || '',
            zip: address.pincode,
            country: address.country,
            phone: address.mobile
          })
        });
        const valData = await valRes.json();
        if (!valData.valid) {
          showToast(valData.message || 'Address could not be validated. Please check and try again.', 'error');
          return;
        }
      } catch (e) {
        console.warn('Address validation failed, proceeding anyway:', e);
      }
    } else if (orderType === 'pickup') {
      if (!pickupContact.name.trim()) { showToast('Please enter your name.', 'error'); return; }
      if (!pickupContact.phone.trim() || pickupContact.phone.replace(/\D/g, '').length < 10) {
        showToast('Please enter a valid 10-digit phone number for pickup notification.', 'error');
        return;
      }
    }
    if (token && saveAddress && orderType !== 'pickup') {
      addAddress({ ...address, mobile: `${dialCode}${address.mobile}`, is_default: saveAsDefault }).catch(() => {});
    }
    // Start 5-minute session timer
    setSessionSecondsLeft(SESSION_MINUTES * 60);
    setStep(3);
  };

  // Session countdown effect
  useEffect(() => {
    if (sessionSecondsLeft === null) return;
    if (sessionSecondsLeft <= 0) {
      clearInterval(sessionTimerRef.current);
      showToast('Your session has expired. Please restart checkout.', 'error');
      setStep(2.5);
      setSessionSecondsLeft(null);
      return;
    }
    sessionTimerRef.current = setInterval(() => setSessionSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [sessionSecondsLeft]);

  const handlePlaceOrder = async () => {
    if (orderType !== 'pickup' && !termsAccepted) { showToast('Please accept the Terms & Conditions to proceed.', 'error'); return; }
    if (orderType !== 'pickup' && !addressConfirmed) { showToast('Please confirm your shipping address is correct.', 'error'); return; }
    if (orderType === 'pickup' && !pickupTermsAccepted) { showToast('Please accept the Pickup Terms & Conditions to proceed.', 'error'); return; }
    setIsPlacingOrder(true);
    setPaymentError(null);
    try {
      const stockRes = await fetch(`${BACKEND_URL}/general/check-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const stockData = await stockRes.json();
      if (!stockData.available) {
        const names = stockData.unavailable.map(u => `"${u.name}" (${u.available ?? 0} left)`).join(', ');
        showToast(`Sorry, ${names} is no longer available in the requested quantity.`, 'error');
        setIsPlacingOrder(false);
        return;
      }



      // Razorpay Checkout Flow
      const intentRes = await fetch(`${BACKEND_URL}/general/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const intentData = await intentRes.json();
      if (!intentData.success) { showToast('Failed to initialize payment', 'error'); setIsPlacingOrder(false); return; }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: intentData.amount,
        currency: "INR",
        name: "Manikanta Super Market",
        description: "Order Payment",
        order_id: intentData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/general/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              setTransactionId(response.razorpay_payment_id);
              const createOrderData = await createOrder('razorpay', response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
              if (createOrderData.success) {
                setIsPlacingOrder(false);
                setOrderSuccess(true);
                setTimeout(() => {
                  clearCart();
                  navigate(`/order-tracking/${createOrderData.order.order_number}`);
                }, 3000);
              } else {
                showToast('Failed to place order after payment.', 'error');
                setPaymentError('Your payment was processed but we could not create your order. Please contact support with your payment reference.');
                setIsPlacingOrder(false);
              }
            } else {
              setPaymentError('Payment verification failed.');
              setIsPlacingOrder(false);
            }
          } catch (err) {
            setPaymentError('Payment verification error.');
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: orderType === 'pickup' ? pickupContact.name : address.name,
          email: orderType === 'pickup' ? pickupContact.email : "",
          contact: orderType === 'pickup' ? pickupContact.phone : address.mobile
        },
        theme: {
          color: "#E53935"
        },
        modal: {
          ondismiss: function() {
            setIsPlacingOrder(false);
            setPaymentError('Payment was cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setPaymentError(response.error.description);
        setIsPlacingOrder(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsPlacingOrder(false);
    }
  };

  const pickupEnabled = shippingConfig?.settings?.pickup_enabled ?? false;

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6 px-2 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-red/10">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/cart')}>
        <div className="w-6 h-6 rounded-full bg-white text-brand-red flex items-center justify-center text-xs font-bold border border-brand-red/10">✓</div>
        <span className="text-[10px] text-gray-900 font-bold mt-1">Cart</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2 ? 'bg-brand-red text-white/40' : 'bg-brand-red text-white/20'}`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-white text-brand-red border border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : '1'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-gray-900' : 'text-gray-900/50'}`}>Shipping</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2.5 ? 'bg-brand-red text-white/40' : 'bg-brand-red text-white/20'}`}></div>
      <div className="flex flex-col items-center" onClick={() => { if (step === 3 && orderType !== 'pickup') { setStep(2.5); setSessionSecondsLeft(null); clearInterval(sessionTimerRef.current); setAddressConfirmed(false); setTermsAccepted(false); } }} style={{ cursor: step === 3 && orderType !== 'pickup' ? 'pointer' : 'default' }}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2.5 ? 'bg-white text-brand-red border border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>
          {step > 2.5 ? '✓' : '2'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2.5 ? 'text-gray-900' : 'text-gray-900/50'}`}>Address</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 3 ? 'bg-brand-red text-white/40' : 'bg-brand-red text-white/20'}`}></div>
      <div className={`flex flex-col items-center ${step < 3 ? 'opacity-70' : ''}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-white text-brand-red border border-brand-red/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>3</div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-gray-900' : 'text-gray-900/50'}`}>Payment</span>
      </div>
    </div>
  );

  const SESSION_MINUTES = 5;
  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const allowedCountries = shippingConfig?.settings?.allowed_countries || [];
  const displayCountries = allowedCountries.length > 0 
    ? COUNTRIES.filter(c => allowedCountries.includes(c.name))
    : COUNTRIES;

  return (
    <div className="min-h-screen bg-white font-sans pb-36">
      {/* ── Yellow Hero Header ── */}
      <div className="bg-[#FFC107] pt-12 pb-10 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* ── White Card ── */}
      <div className="bg-white rounded-t-[28px] -mt-5 relative z-10 min-h-screen p-4 md:p-8 space-y-4 md:max-w-7xl mx-auto">
        {renderStepIndicator()}

        {/* Mobile Order Summary (collapsible) */}
        <div className="lg:hidden">
          <button
            onClick={() => setSummaryOpen(o => !o)}
            className="w-full flex items-center justify-between bg-white/90 border border-brand-red/10 rounded-2xl px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-red" />
              <span className="text-sm font-bold text-gray-900">Order Summary</span>
              <span className="text-xs bg-brand-red text-white font-bold px-2 py-0.5 rounded-full">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-red">₹{finalTotal.toFixed(2)}</span>
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
                      <p className="text-sm font-bold text-brand-red">₹{((item.variant?.price || item.product.price) * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-brand-red/10 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-900/70">
                  <span>Item Total</span><span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-red">
                    <span>Coupon ({appliedCoupon.code})</span><span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-900/70">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-gray-900/70">
                    <span>{taxLabel || 'Tax'}</span><span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {user?.m_coins > 0 && (
                  <div className="flex justify-between items-center text-sm pt-2 mt-1 border-t border-brand-red/5">
                    <label className="flex items-center gap-2 cursor-pointer text-amber-700 font-medium">
                      <input type="checkbox" checked={useCoins} onChange={e => setUseCoins(e.target.checked)} className="accent-amber-600 w-4 h-4" />
                      Use M-Coins (Bal: {user.m_coins})
                    </label>
                    {useCoins && <span className="font-medium text-amber-600">- ₹{coinsDiscount.toFixed(2)}</span>}
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-brand-red/10">
                  <span>Grand Total</span><span className="text-brand-red">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">


            {step === 2.5 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-red" />
              </div>
              Shipping Address
            </h2>

            {/* Saved addresses list */}
            {addresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id}>
                    {editingAddr === addr.id ? (
                      /* Inline edit form */
                      <div className="bg-white rounded-2xl border-2 border-brand-red/10 p-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Edit Address</p>
                          <button onClick={() => setEditingAddr(null)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                            <X className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[['name','Full Name'],['line2','Line 2 (optional)'],['city','City'],['state','State'],['pincode','ZIP']].map(([key, label]) => (
                            <div key={key} className={key === 'line2' ? 'sm:col-span-2' : ''}>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
                              <input
                                value={editForm[key] || ''}
                                onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10 transition-all"
                              />
                            </div>
                          ))}
                          {/* Address Line 1 with autocomplete */}
                          <div className="sm:col-span-2 order-first">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Address Line 1</label>
                            {mapsLoaded ? (
                              <AddressAutocomplete
                                value={editForm.line1 || ''}
                                onChange={v => setEditForm(f => ({ ...f, line1: v }))}
                                onSelect={({ line1, city, state, pincode, country }) => {
                                  const c = country ? COUNTRIES.find(c => c.name === country) : null;
                                  setEditForm(f => ({
                                    ...f,
                                    line1: line1 || f.line1,
                                    city: city || f.city,
                                    state: state || f.state,
                                    pincode: pincode || f.pincode,
                                    country: country || f.country,
                                  }));
                                  if (c) setEditDialCode(c.code);
                                }}
                              />
                            ) : (
                              <input
                                value={editForm.line1 || ''}
                                onChange={e => setEditForm(f => ({ ...f, line1: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10 transition-all"
                              />
                            )}
                          </div>
                          {/* Country dropdown */}
                          <div ref={editCountryRef} className="relative sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Country</label>
                            <button type="button" onClick={() => { setEditCountryOpen(o => !o); setEditCountrySearch(''); }}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm flex items-center gap-2 justify-between focus:outline-none focus:border-brand-red/10 transition-all">
                              <div className="flex items-center gap-2 min-w-0">
                                {editForm.country && (() => { const c = COUNTRIES.find(c => c.name === editForm.country); return c ? <span>{flag(c.code)}</span> : null; })()}
                                <span className={`truncate ${editForm.country ? 'text-gray-700' : 'text-gray-400'}`}>{editForm.country || 'Select country'}</span>
                              </div>
                              <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${editCountryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {editCountryOpen && (
                              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                <div className="p-2 border-b border-gray-100">
                                  <input autoFocus type="text" value={editCountrySearch} onChange={e => setEditCountrySearch(e.target.value)}
                                    placeholder="Search country..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10" />
                                </div>
                                <ul className="max-h-48 overflow-y-auto">
                                  {COUNTRIES.filter(c => c.name.toLowerCase().includes(editCountrySearch.toLowerCase())).map(c => (
                                    <li key={c.code}>
                                      <button type="button" onClick={() => {
                                        setEditForm(f => ({ ...f, country: c.name }));
                                        setEditDialCode(c.code);
                                        setEditCountryOpen(false);
                                      }} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                                        editForm.country === c.name ? 'bg-brand-red text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <span>{flag(c.code)}</span>
                                        <span className="flex-1 truncate">{c.name}</span>
                                        <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          {/* Phone with dial code picker */}
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone</label>
                            <div className="flex gap-2">
                              <div ref={editDialRef} className="relative shrink-0">
                                <button type="button" onClick={() => { setEditDialOpen(o => !o); setEditDialSearch(''); }}
                                  className="h-full min-w-[80px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm flex items-center gap-1.5 focus:outline-none focus:border-brand-red/10 hover:border-brand-red/10 transition-all">
                                  <span>{flag(editDialCode)}</span>
                                  <span className="font-bold text-gray-700 text-xs">{COUNTRIES.find(c => c.code === editDialCode)?.dial || '+1'}</span>
                                  <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${editDialOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {editDialOpen && (
                                  <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                      <input autoFocus type="text" value={editDialSearch} onChange={e => setEditDialSearch(e.target.value)}
                                        placeholder="Search country..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10" />
                                    </div>
                                    <ul className="max-h-48 overflow-y-auto">
                                      {COUNTRIES.filter(c => c.name.toLowerCase().includes(editDialSearch.toLowerCase()) || c.dial.includes(editDialSearch)).map(c => (
                                        <li key={c.code}>
                                          <button type="button" onClick={() => { setEditDialCode(c.code); setEditDialOpen(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                                              editDialCode === c.code ? 'bg-brand-red text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                                            <span>{flag(c.code)}</span>
                                            <span className="flex-1 truncate">{c.name}</span>
                                            <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <input type="text" inputMode="numeric"
                                value={editForm.mobile || ''}
                                onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                                placeholder="Phone number"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                        <button onClick={saveEdit} disabled={savingEdit}
                          className="w-full bg-white text-brand-red font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
                          {savingEdit ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSavedAddress(addr.id);
                          const c = COUNTRIES.find(c => c.name === addr.country);
                          if (c) setDialCountryCode(c.code);
                          const dialPrefix = c?.dial || '';
                          const rawMobile = addr.mobile || '';
                          const mobileDigits = rawMobile.startsWith(dialPrefix) ? rawMobile.slice(dialPrefix.length) : rawMobile;
                          setAddress({ name: addr.name, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state || '', pincode: addr.pincode, country: addr.country || 'United States', mobile: mobileDigits });
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                          selectedSavedAddress === addr.id ? 'border-brand-red bg-red-50 text-brand-red' : 'border-gray-200 bg-white hover:border-brand-red/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                          selectedSavedAddress === addr.id ? 'border-brand-red bg-brand-red text-white' : 'border-gray-300'
                        }`}>
                          {selectedSavedAddress === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                            {addr.is_default && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📞 {addr.mobile}</p>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); openEdit(addr); }}
                          className="shrink-0 w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => { setSelectedSavedAddress(null); setShowNewAddressForm(true); setAddress({ name: user?.name || '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'United States', mobile: '' }); }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-brand-red/10 transition-all flex items-center gap-3 text-gray-900/60 hover:text-gray-900"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  <span className="text-sm font-semibold">+ Use a different address</span>
                </button>
              </div>
            )}

            {/* New address form */}
            {showNewAddressForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-brand-red/10">
              {addresses.length > 0 && (
                <div className="px-4 pt-4 sm:px-6">
                  <button type="button" onClick={() => { setShowNewAddressForm(false); const def = addresses.find(a => a.is_default) || addresses[0]; setSelectedSavedAddress(def.id); }}
                    className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline">
                    ← Back to saved addresses
                  </button>
                </div>
              )}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                  <input
                    required
                    value={address.name}
                    onChange={e => { setAddress({...address, name: e.target.value}); setFieldErrors(f => ({...f, name: ''})); }}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all ${
                      fieldErrors.name ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.name}</p>}
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address Line 1 *</label>
                  {mapsLoaded ? (
                    <div className={fieldErrors.line1 ? 'rounded-xl ring-1 ring-red-400' : ''}>
                      <AddressAutocomplete
                        value={address.line1}
                        onChange={v => { setAddress(a => ({ ...a, line1: v })); setFieldErrors(f => ({...f, line1: ''})); }}
                        onSelect={({ line1, city, state, pincode, country }) => {
                          setAddress(a => ({ ...a, line1: line1 || a.line1, city: city || a.city, state: state || a.state, pincode: pincode || a.pincode, country: country || a.country }));
                          setFieldErrors(f => ({...f, line1: '', city: '', pincode: '', country: ''}));
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      value={address.line1}
                      onChange={e => { setAddress(a => ({ ...a, line1: e.target.value })); setFieldErrors(f => ({...f, line1: ''})); }}
                      placeholder="House no., Street, Area"
                      className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all ${
                        fieldErrors.line1 ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                      }`}
                    />
                  )}
                  {fieldErrors.line1 && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.line1}</p>}
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Selecting a suggestion auto-fills city, state, ZIP & country
                  </p>
                </div>

                {/* Apartment */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Apartment, suite, etc. (optional)</label>
                  <input
                    value={address.line2}
                    onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">City *</label>
                    <input required value={address.city} onChange={e => { setAddress({...address, city: e.target.value}); setFieldErrors(f => ({...f, city: ''})); }}
                      className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all ${
                        fieldErrors.city ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                      }`}
                      placeholder="City" />
                    {fieldErrors.city && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">State <span className="text-gray-400 font-normal">*</span></label>
                    <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="State" />
                      
                  </div>
                </div>

                {/* ZIP + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">ZIP Code *</label>
                    <input type="text" inputMode="numeric" required value={address.pincode}
                      onChange={e => { setAddress({...address, pincode: e.target.value}); setFieldErrors(f => ({...f, pincode: ''})); }}
                      className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all ${
                        fieldErrors.pincode ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                      }`}
                      placeholder="ZIP / Postal code" />
                    {fieldErrors.pincode && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.pincode}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone *</label>
                    <div className="flex gap-2">
                      <div ref={dialRef} className="relative shrink-0">
                        <button type="button" onClick={() => { setDialOpen(o => !o); setDialSearch(''); }}
                          className="h-full min-w-[80px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm flex items-center gap-1.5 focus:outline-none focus:border-brand-red/10 hover:border-brand-red/10 transition-all">
                          <span>{flag(dialCountryCode)}</span>
                          <span className="font-bold text-gray-700">{dialCode}</span>
                          <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${dialOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {dialOpen && (
                          <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <input autoFocus type="text" value={dialSearch} onChange={e => setDialSearch(e.target.value)}
                                placeholder="Search country..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10" />
                            </div>
                            <ul className="max-h-52 overflow-y-auto">
                              {displayCountries.filter(c => c.name.toLowerCase().includes(dialSearch.toLowerCase()) || c.dial.includes(dialSearch)).map(c => (
                                <li key={c.code}>
                                  <button type="button" onClick={() => { setDialCountryCode(c.code); setDialOpen(false); }}
                                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                      dialCountryCode === c.code ? 'bg-brand-red text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                                    <span className="text-base">{flag(c.code)}</span>
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <input type="text" inputMode="numeric" required value={address.mobile}
                        maxLength={['IN', 'US', 'CA'].includes(dialCountryCode) ? 10 : 15}
                        onChange={e => { const limit = ['IN', 'US', 'CA'].includes(dialCountryCode) ? 10 : 15; setAddress({...address, mobile: e.target.value.replace(/\D/g, '').slice(0, limit)}); setFieldErrors(f => ({...f, mobile: ''})); }}
                        className={`flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all ${
                          fieldErrors.mobile ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                        }`}
                        placeholder={['IN', 'US', 'CA'].includes(dialCountryCode) ? '10-digit number' : 'Phone number'} />
                    </div>
                    {fieldErrors.mobile && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.mobile}</p>}
                  </div>
                </div>

                {/* Country */}
                <div ref={countryRef} className="relative">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Country *</label>
                  <button type="button" onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none transition-all flex items-center gap-2 justify-between ${
                      fieldErrors.country ? 'border-red-400' : 'border-gray-200 focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30'
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {address.country && (() => { const c = COUNTRIES.find(c => c.name === address.country); return c ? <span className="text-base shrink-0">{flag(c.code)}</span> : null; })()}
                      <span className={`truncate ${address.country ? 'text-gray-700' : 'text-gray-400'}`}>{address.country || 'Select country'}</span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${countryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {countryOpen && (
                    <div className="absolute z-[200] bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input autoFocus type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                          placeholder="Search country..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10" />
                      </div>
                      <ul className="max-h-52 overflow-y-auto">
                        {displayCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <li key={c.code}>
                            <button type="button" onClick={() => { setAddress({...address, country: c.name}); setDialCountryCode(c.code); setCountryOpen(false); setFieldErrors(f => ({...f, country: ''})); }}
                              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                address.country === c.name ? 'bg-brand-red text-white/10 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <span className="text-base shrink-0">{flag(c.code)}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                            </button>
                          </li>
                        ))}
                        {displayCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                          <li className="px-4 py-3 text-sm text-gray-400 text-center">No country found</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {fieldErrors.country && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.country}</p>}
                </div>

                {/* Save address checkboxes */}
                {token && (
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 accent-brand-dark-blue rounded" />
                      <span className="text-xs text-gray-600 font-medium">Save this address for future orders</span>
                    </label>
                    {saveAddress && (
                      <label className="flex items-center gap-2.5 cursor-pointer pl-6">
                        <input type="checkbox" checked={saveAsDefault} onChange={e => setSaveAsDefault(e.target.checked)}
                          className="w-4 h-4 accent-brand-dark-blue rounded" />
                        <span className="text-xs text-gray-600">Set as default address</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Proceed button inside card on mobile */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <button onClick={handleProceedToPayment}
                  className="w-full bg-white text-brand-red font-bold text-sm rounded-xl py-4 shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Proceed to Payment
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400">100% Secure Transaction</span>
                </div>
              </div>
            </div>
            )}

            {/* Proceed button when using saved address */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="space-y-3">
                <button onClick={handleProceedToPayment}
                  className="w-full bg-white text-brand-red font-bold text-sm rounded-xl py-4 shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Proceed to Payment
                </button>
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400">100% Secure Transaction</span>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 3 && orderType === 'pickup' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-800">Store Pickup Selected</p>
                  <p className="text-sm text-blue-700 mt-1">Once your order is ready, our team will message you via <strong>WhatsApp/Text</strong> from <strong>+91 98660 48155</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-blue-200 pt-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-800">Nearby Pickup Location</p>
                  <p className="text-sm text-blue-700">Aspari main road opposite APGB Bank, 518347</p>
                  <a href="https://maps.google.com/?q=Aspari+main+road+opposite+APGB+Bank,+518347" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold underline hover:text-blue-800">View on Google Maps →</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-brand-red/10 p-5 space-y-4">
              <p className="text-sm font-bold text-gray-900">Contact Details for Pickup Notification</p>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <input
                  value={pickupContact.name}
                  onChange={e => setPickupContact(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                />
              </div>

              {/* Phone with country code */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Mobile *</label>
                <div className="flex gap-2">
                  {/* Country code picker */}
                  <div ref={pickupDialRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => { setPickupDialOpen(o => !o); setPickupDialSearch(''); }}
                      className="h-full min-w-[90px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm flex items-center gap-1.5 focus:outline-none focus:border-brand-red/10 hover:border-brand-red/10 transition-all"
                    >
                      <span>{String.fromCodePoint(...[...pickupDialCode.toUpperCase()].map(x => 127397 + x.charCodeAt(0)))}</span>
                      <span className="font-bold text-gray-700 text-xs">{COUNTRIES.find(c=>c.code===pickupDialCode)?.dial || '+1'}</span>
                      <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${pickupDialOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {pickupDialOpen && (
                      <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-gray-100">
                          <input
                            autoFocus
                            type="text"
                            value={pickupDialSearch}
                            onChange={e => setPickupDialSearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/10"
                          />
                        </div>
                        <ul className="max-h-52 overflow-y-auto">
                          {COUNTRIES.filter(c =>
                            c.name.toLowerCase().includes(pickupDialSearch.toLowerCase()) ||
                            c.dial.includes(pickupDialSearch)
                          ).map(c => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => { setPickupDialCode(c.code); setPickupDialOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                  pickupDialCode === c.code ? 'bg-brand-red text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>{String.fromCodePoint(...[...c.code.toUpperCase()].map(x => 127397 + x.charCodeAt(0)))}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pickupContact.phone}
                    onChange={e => setPickupContact(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                    placeholder="Phone number"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>
                <p className="text-[10px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                  💬 For best experience, please provide your WhatsApp number — we'll send pickup updates via WhatsApp/Text.
                </p>
              </div>

              {/* Email */}
              {!user?.email && (
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email (optional)</label>
                  <input
                    value={pickupContact.email}
                    onChange={e => setPickupContact(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Pickup T&C */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800">⚠️ Pickup Terms & Conditions</p>
              <ul className="space-y-1.5 text-xs text-amber-700 leading-relaxed">
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Please inspect your item(s) carefully at the time of pickup before leaving the store.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span><strong>Any damage must be reported within 1–2 business days</strong> of pickup. Claims after this window cannot be accepted.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Bring a valid photo ID and your order confirmation when picking up.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Orders not picked up within 7 days of the ready notification may be subject to restocking.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>All sales are <strong>final — no returns or exchanges</strong> on pickup orders.</span></li>
              </ul>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-amber-200">
                <input type="checkbox" checked={pickupTermsAccepted} onChange={e => setPickupTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-700 shrink-0" />
                <span className="text-xs text-amber-800 font-medium leading-relaxed">
                  I have read and agree to the above pickup terms & conditions.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && orderType === 'pickup' && (
          <div className="max-w-3xl mx-auto mt-4">
            <button
              onClick={() => {
                if (!pickupContact.name.trim()) { showToast('Please enter your name.', 'error'); return; }
                if (pickupContact.phone.replace(/\D/g, '').length < 7) { showToast('Please enter a valid phone number.', 'error'); return; }
                if (!pickupTermsAccepted) { showToast('Please accept the Pickup Terms & Conditions to proceed.', 'error'); return; }
                handlePlaceOrder(null, null);
              }}
              disabled={isPlacingOrder || !pickupTermsAccepted}
              className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
                isPlacingOrder || !pickupTermsAccepted
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-white text-brand-red shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPlacingOrder
                ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Placing Order...</>
                : '✓ Confirm Pickup Order'
              }
            </button>
          </div>
        )}
        {step === 3 && orderType !== 'pickup' && (
          <RazorpayPaymentForm
            isPlacingOrder={isPlacingOrder}
            handlePlaceOrder={handlePlaceOrder}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            addressConfirmed={addressConfirmed}
            setAddressConfirmed={setAddressConfirmed}
            address={address}
            sessionSecondsLeft={sessionSecondsLeft}
            onEditAddress={() => { setStep(2.5); setSessionSecondsLeft(null); clearInterval(sessionTimerRef.current); setAddressConfirmed(false); setTermsAccepted(false); }}
            paymentError={paymentError}
            onRetry={() => setPaymentError(null)}
          />
        )}
      </div>          {/* Right Column: Order Summary (Desktop) */}
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
                      {item.product.product_code && (
                        <span className="text-[10px] font-bold text-brand-orange bg-brand-orange text-white/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">#{item.product.product_code}</span>
                      )}
                      <p className="text-sm font-bold text-brand-red mt-1">₹{((item.variant?.price || item.product.price) * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-brand-red/10 pt-4 mb-6">
                <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-red mb-2">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-medium">- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-gray-900">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                    <span>{taxLabel || 'Tax'}</span>
                    <span className="font-medium text-gray-900">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {user?.m_coins > 0 && (
                  <div className="flex justify-between items-center text-sm mb-3 pb-2 border-b border-brand-red/5">
                    <label className="flex items-center gap-2 cursor-pointer text-amber-700 font-medium hover:text-amber-800 transition-colors">
                      <input type="checkbox" checked={useCoins} onChange={e => setUseCoins(e.target.checked)} className="accent-amber-600 w-4 h-4 rounded" />
                      Use M-Coins (Balance: {user.m_coins})
                    </label>
                    {useCoins && <span className="font-medium text-amber-600">- ₹{coinsDiscount.toFixed(2)}</span>}
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-xl pt-2 border-t border-brand-red/10">
                  <span>Grand Total</span>
                  <span className="text-brand-red">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {(step === 2 || step === 2.5) ? (
                <button 
                  onClick={step === 2 && pickupEnabled ? undefined : handleProceedToPayment}
                  disabled={step === 2 && pickupEnabled}
                  className={`w-full bg-white text-brand-red font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${step === 2 && pickupEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Proceed to Payment
                </button>
              ) : null}
              
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-beige/95 backdrop-blur-md border-t border-brand-red/10 p-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mx-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <>
                <p className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-1">Payable Amount</p>
                <div className="flex flex-col">
                  {appliedCoupon && <span className="text-[10px] text-brand-red font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                  <p className="text-2xl font-bold text-gray-900 leading-none">₹{finalTotal.toFixed(2)}</p>
                </div>
              </>
            </div>
          </div>
          
          {(step === 2 || step === 2.5) ? (
            <button 
              onClick={step === 2 && pickupEnabled ? undefined : handleProceedToPayment}
              disabled={step === 2 && pickupEnabled}
              className={`w-full bg-white text-brand-red font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${step === 2 && pickupEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Proceed to Payment
            </button>
          ) : null}
        
        <div className="flex items-center justify-center gap-1 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] text-gray-400 font-medium">Your order is safe and secure</span>
        </div>
        </div>
      </div>

      {/* Placing Order Spinner */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-14 h-14 border-4 border-brand-red/10 border-t-brand-gold rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-900">Processing your payment...</p>
        </div>
      )}

      {/* Order Confirmed Overlay */}
      {orderSuccess && (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div ref={iconRef} className="w-24 h-24 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 ref={textRef} className="text-2xl font-serif font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Thank you for placing your order with Manikanta Super Market. We're delighted to begin preparing your selection and will keep you updated throughout its journey to you.
            </p>
            {transactionId && (
              <p className="text-xs text-gray-400 font-mono bg-gray-100 px-4 py-2 rounded-lg">
                Transaction ID: <span className="text-gray-900 font-semibold">{transactionId}</span>
              </p>
            )}
            <p className="text-sm text-gray-400">Redirecting to tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
