import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ShieldCheck, Droplet, Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/logo.png'; // Updated logo for mobile
import { PhoneInput, formatPhone, COUNTRIES } from '../components/PhoneInput';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, verifyPhoneOtp, verifyOtp, googleLogin, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState('form'); // 'form' | 'phone_otp' | 'email_otp' | 'done'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', country: '', role: 'customer' });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const pwRules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'At least 1 number', ok: /\d/.test(form.password) },
    { label: 'At least 1 special character', ok: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const passwordValid = pwRules.every(r => r.ok);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const [allowedCountries, setAllowedCountries] = useState([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef(null);
  const phoneOtpRefs = useRef([]);
  const emailOtpRefs = useRef([]);

  useEffect(() => {
    const handler = (e) => { if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) setCountryOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isoFlag = (iso) => String.fromCodePoint(...[...iso].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));

  function CountryPicker({ dark }) {
    const list = allowedCountries.length > 0 ? COUNTRIES.filter(c => allowedCountries.includes(c.name)) : COUNTRIES;
    const filtered = list.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
    const selected = COUNTRIES.find(c => c.name === form.country);
    return (
      <div ref={countryDropdownRef} className="relative">
        <button
          type="button"
          onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
          className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all focus:outline-none ${
            dark
              ? 'bg-transparent border-white/10 text-white focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50'
              : 'bg-white border-brand-red/10 text-gray-900 focus:ring-2 focus:ring-brand-gold/40'
          }`}
        >
          {selected ? (
            <><span className="text-base leading-none shrink-0">{isoFlag(selected.iso)}</span><span className="flex-1 text-left truncate">{selected.name}</span></>
          ) : (
            <span className={`flex-1 text-left ${dark ? 'text-white/30' : 'text-gray-900/30'}`}>Select your country</span>
          )}
          <svg className={`w-4 h-4 shrink-0 transition-transform ${countryOpen ? 'rotate-180' : ''} ${dark ? 'text-white/40' : 'text-gray-900/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {countryOpen && (
          <div className="absolute z-[200] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-white border border-gray-200 shadow-inner rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-red/10"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <li key={c.iso}>
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, country: c.name })); setCountryOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      form.country === c.name ? 'bg-brand-red text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base shrink-0">{isoFlag(c.iso)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-400">No results</li>}
            </ul>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => {
        if (d?.settings?.allowed_countries) {
          setAllowedCountries(d.settings.allowed_countries);
        }
      })
      .catch(console.error);
    return () => clearError();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!consentAccepted) { setLocalError('Please accept the Privacy Policy and Terms of Service to continue.'); return; }
    if (!passwordValid) { setPasswordTouched(true); setLocalError('Password does not meet the requirements.'); return; }
    const res = await signup(form.name, form.email, form.phone, form.password, form.country, form.role);
    if (res.success) setStep('email_otp');
    else setLocalError(res.error);
  };

  const handleOtpChange = (val, idx, setter, refs) => {
    if (!/^\d?$/.test(val)) return;
    setter(prev => { const next = [...prev]; next[idx] = val; return next; });
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx, otp, refs) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLocalError('');
    const code = phoneOtp.join('');
    if (code.length < 6) return setLocalError('Enter all 6 digits');
    const res = await verifyPhoneOtp(form.email, code);
    if (res.success) setStep('email_otp');
    else setLocalError(res.error);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLocalError('');
    const code = emailOtp.join('');
    if (code.length < 6) return setLocalError('Enter all 6 digits');
    const res = await verifyOtp(form.email, code);
    if (res.success) { setStep('done'); setTimeout(() => navigate('/'), 2000); }
    else setLocalError(res.error);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalError('');
      const res = await googleLogin(tokenResponse.access_token);
      if (res.success) navigate(res.role === 'admin' ? '/admin' : '/');
      else setLocalError(res.error);
    },
    onError: () => {
      setLocalError('Google Signup Failed');
    },
  });

  const displayError = localError || error;

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex h-screen w-full font-sans bg-gray-100 items-center justify-center overflow-hidden py-2">
        {/* Centered Panel — Signup Form */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center justify-center px-8 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="flex flex-col items-center mb-2">
              <Link to="/">
                <img src={logoImg} alt="Manikanta Super Market" className="h-14 w-auto drop-shadow-md hover:scale-105 transition-transform" />
              </Link>
              <h1 className="font-sans font-extrabold tracking-tight text-gray-900 text-sm">Manikanta Super Market</h1>
            </div>
            {step === 'form' ? (
              <>
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-sans font-extrabold tracking-tight text-gray-900 mb-1">Create Account</h2>
                  <div className="hidden"></div>
                </div>

                <form onSubmit={handleSignup} className="space-y-2.5">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">Full Name</label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                      <input
                        name="name" value={form.name} onChange={handleChange} required
                        placeholder="Your full name"
                        className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 pl-11 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">Email Address</label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange} required
                        placeholder="you@example.com"
                        className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 pl-11 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Country - Desktop */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">Country</label>
                    <CountryPicker dark={false} />
                  </div>

                  {/* Phone - Desktop */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">Phone Number</label>
                    <PhoneInput allowedCountries={allowedCountries} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                      <input
                        name="password" type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={handleChange} onBlur={() => setPasswordTouched(true)} required
                        placeholder="Min 8 chars, 1 number, 1 special"
                        className={`w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 rounded-xl px-4 pl-11 pr-12 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm ${
                          passwordTouched && !passwordValid ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/50' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 hover:border-gray-300'
                        }`}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900/40 hover:text-gray-900 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordTouched && (
                      <div className="mt-2 space-y-1">
                        {pwRules.map((r, i) => (
                          <p key={i} className={`text-xs flex items-center gap-1.5 ${r.ok ? 'text-green-600' : 'text-red-500'}`}>
                            <span>{r.ok ? '✓' : '✗'}</span> {r.label}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Role Selection - Desktop */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-0.5">I am a</label>
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`border rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all ${form.role === 'customer' ? 'border-brand-gold/50 bg-brand-cream/50 ring-2 ring-brand-gold/40' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                          <input type="radio" name="role" value="customer" checked={form.role === 'customer'} onChange={handleChange} className="hidden" />
                          <span className={`text-sm font-semibold ${form.role === 'customer' ? 'text-brand-dark-blue' : 'text-gray-500'}`}>Customer</span>
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <div className={`border rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all ${form.role === 'shopkeeper' ? 'border-brand-gold/50 bg-brand-cream/50 ring-2 ring-brand-gold/40' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                          <input type="radio" name="role" value="shopkeeper" checked={form.role === 'shopkeeper'} onChange={handleChange} className="hidden" />
                          <span className={`text-sm font-semibold ${form.role === 'shopkeeper' ? 'text-brand-dark-blue' : 'text-gray-500'}`}>Shopkeeper</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={consentAccepted} onChange={e => setConsentAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-brand-dark-blue rounded shrink-0" />
                    <span className="text-xs text-gray-900/70 leading-relaxed">
                      I confirm that I am at least 13 years old, agree to the Manikanta Super Market{' '}
                      <Link to="/terms-of-service" target="_blank" className="font-bold text-gray-900 underline">Terms & Conditions</Link>,
                      and acknowledge the Manikanta Super Market{' '}
                      <Link to="/privacy-policy" target="_blank" className="font-bold text-gray-900 underline">Privacy Policy</Link>.
                    </span>
                  </label>

                  {displayError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">
                      {displayError}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-4"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP & Continue →'}
                  </motion.button>
                </form>

                {/* OR Google */}
                <div className="flex items-center gap-3 w-full my-3">
                  <div className="h-px bg-white flex-1"></div>
                  <span className="text-gray-900/40 text-[10px] tracking-wider uppercase">OR</span>
                  <div className="h-px bg-white flex-1"></div>
                </div>
                
                <button type="button" onClick={() => loginWithGoogle()} className="w-full bg-white border border-gray-200 text-gray-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                  Continue with Google
                </button>
              </>
            ) : step === 'phone_otp' ? (
              <>
                <div className="mb-8">
                  <h4 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-2">Step 1 of 2</h4>
                  <h2 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight text-gray-900 mb-2">Verify Mobile</h2>
                  <div className="w-14 h-1 bg-brand-red text-white rounded-full"></div>
                  <p className="text-gray-900/60 text-sm mt-4">
                    We sent a 6-digit OTP to <strong className="text-gray-900">{form.phone}</strong>
                  </p>
                </div>
                <form onSubmit={handleVerifyPhone} className="space-y-3">
                  <div className="flex justify-center gap-3">
                    {phoneOtp.map((digit, idx) => (
                      <input key={idx} ref={el => phoneOtpRefs.current[idx] = el}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(e.target.value, idx, setPhoneOtp, phoneOtpRefs)}
                        onKeyDown={e => handleOtpKeyDown(e, idx, phoneOtp, phoneOtpRefs)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                      />
                    ))}
                  </div>
                  {(localError || error) && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">{localError || error}</div>}
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full bg-white text-brand-red font-bold py-4 rounded-xl text-sm hover:bg-white transition-all disabled:opacity-60 shadow-lg">
                    {loading ? 'Verifying...' : 'Verify Mobile →'}
                  </motion.button>
                  <button type="button" onClick={() => setStep('form')} className="w-full text-sm text-gray-900/50 hover:text-gray-900 transition-colors">← Change details</button>
                </form>
              </>
            ) : step === 'email_otp' ? (
              <>
                <div className="mb-8">
                  <h4 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-2">Step 2 of 2</h4>
                  <h2 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight text-gray-900 mb-2">Verify Email</h2>
                  <div className="w-14 h-1 bg-brand-red text-white rounded-full"></div>
                  <p className="text-gray-900/60 text-sm mt-4">
                    We sent a 6-digit OTP to <strong className="text-gray-900">{form.email}</strong>
                  </p>
                </div>
                <form onSubmit={handleVerifyEmail} className="space-y-3">
                  <div className="flex justify-center gap-3">
                    {emailOtp.map((digit, idx) => (
                      <input key={idx} ref={el => emailOtpRefs.current[idx] = el}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(e.target.value, idx, setEmailOtp, emailOtpRefs)}
                        onKeyDown={e => handleOtpKeyDown(e, idx, emailOtp, emailOtpRefs)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                      />
                    ))}
                  </div>
                  {(localError || error) && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">{localError || error}</div>}
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full bg-white text-brand-red font-bold py-4 rounded-xl text-sm hover:bg-white transition-all disabled:opacity-60 shadow-lg">
                    {loading ? 'Verifying...' : 'Verify Email & Create Account →'}
                  </motion.button>
                  <button type="button" onClick={() => setStep('phone_otp')} className="w-full text-sm text-gray-900/50 hover:text-gray-900 transition-colors">← Back</button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-sans font-extrabold tracking-tight text-gray-900">Account Created!</h2>
                <p className="text-gray-900/60 text-sm">Redirecting you to the store...</p>
              </div>
            )}

            <p className="text-center text-sm text-gray-900/60 mt-3">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-gray-900 hover:text-brand-red transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden h-screen w-full bg-gray-100 font-sans flex flex-col items-center justify-center overflow-hidden px-4 py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm flex flex-col justify-center h-full"
        >
          <div className="flex flex-col items-center mb-2 mt-2">
            <Link to="/">
              <img src={brandLogo} alt="Manikanta Super Market" className="h-14 w-auto drop-shadow-md hover:scale-105 transition-transform" />
            </Link>
            <h1 className="font-sans font-extrabold tracking-tight text-gray-900 text-sm">Manikanta Super Market</h1>
          </div>
        {step === 'form' ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-sans font-extrabold tracking-tight text-gray-900 mb-1">Create Account</h2>
              <div className="hidden"></div>
            </div>

            <form onSubmit={handleSignup} className="w-full space-y-2.5">
              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">Full Name</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                  <input
                    name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                    className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 pl-11 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 pl-11 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Country - Mobile */}
              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">Country</label>
                <CountryPicker dark={false} />
              </div>

              {/* Phone - Mobile */}
              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">Phone Number</label>
                <PhoneInput allowedCountries={allowedCountries} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-gray-900 transition-colors top-1/2 -translate-y-1/2" />
                  <input
                    name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} onBlur={() => setPasswordTouched(true)} required
                    placeholder="Min 8 chars, 1 number, 1 special"
                    className={`w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 rounded-xl px-4 pl-11 pr-12 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm ${
                          passwordTouched && !passwordValid ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/50' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 hover:border-gray-300'
                        }`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-red hover:text-brand-red/80 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordTouched && (
                  <div className="mt-2 space-y-1">
                    {pwRules.map((r, i) => (
                      <p key={i} className={`text-xs flex items-center gap-1.5 ${r.ok ? 'text-green-400' : 'text-red-400'}`}>
                        <span>{r.ok ? '✓' : '✗'}</span> {r.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Role Selection - Mobile */}
              <div>
                <label className="text-xs font-medium text-gray-900 block mb-0.5 pl-1">I am a</label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className={`border rounded-xl px-4 py-3 flex items-center justify-center transition-all ${form.role === 'customer' ? 'bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : 'bg-white border-gray-200 hover:border-white/30'}`}>
                      <input type="radio" name="role" value="customer" checked={form.role === 'customer'} onChange={handleChange} className="hidden" />
                      <span className={`text-sm font-semibold ${form.role === 'customer' ? 'text-[#D4AF37]' : 'text-gray-900/60'}`}>Customer</span>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <div className={`border rounded-xl px-4 py-3 flex items-center justify-center transition-all ${form.role === 'shopkeeper' ? 'bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : 'bg-white border-gray-200 hover:border-white/30'}`}>
                      <input type="radio" name="role" value="shopkeeper" checked={form.role === 'shopkeeper'} onChange={handleChange} className="hidden" />
                      <span className={`text-sm font-semibold ${form.role === 'shopkeeper' ? 'text-[#D4AF37]' : 'text-gray-900/60'}`}>Shopkeeper</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Consent - Mobile */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={consentAccepted} onChange={e => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded shrink-0" />
                <span className="text-[11px] text-gray-900/60 leading-relaxed">
                  I confirm that I am at least 13 years old, agree to the Manikanta Super Market{' '}
                  <Link to="/terms-of-service" target="_blank" className="text-brand-red font-bold underline">Terms & Conditions</Link>,
                  and acknowledge the Manikanta Super Market{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-brand-red font-bold underline">Privacy Policy</Link>.
                </span>
              </label>

              {displayError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center">
                  {displayError}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-4"
              >
                {loading ? 'Sending OTP...' : 'Send OTP & Continue →'}
              </button>
            </form>

            {/* OR Google */}
            <div className="flex items-center gap-3 w-full max-w-sm my-3">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-gray-400 text-[10px] tracking-wider uppercase">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button type="button" onClick={() => loginWithGoogle()} className="w-full bg-white border border-gray-200 text-gray-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
              Continue with Google
            </button>
          </>
        ) : step === 'phone_otp' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-sans font-extrabold tracking-tight text-gray-900 mb-2">Verify <span className="text-brand-red">Mobile</span></h2>
              <div className="w-8 h-1 bg-brand-red text-gray-900 mx-auto rounded-full mb-3"></div>
            </div>
            <form onSubmit={handleVerifyPhone} className="w-full max-w-sm space-y-3">
              <div className="flex justify-center gap-2">
                {phoneOtp.map((digit, idx) => (
                  <input key={idx} ref={el => phoneOtpRefs.current[idx] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx, setPhoneOtp, phoneOtpRefs)}
                    onKeyDown={e => handleOtpKeyDown(e, idx, phoneOtp, phoneOtpRefs)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                  />
                ))}
              </div>
              {(localError || error) && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center">{localError || error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-brand-red text-white font-bold py-2 rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {loading ? 'Verifying...' : 'Verify Mobile →'}
              </button>
              <button type="button" onClick={() => setStep('form')} className="w-full text-sm text-gray-900/60 hover:text-gray-900 transition-colors">← Change details</button>
            </form>
          </>
        ) : step === 'email_otp' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-sans font-extrabold tracking-tight text-gray-900 mb-2">Verify <span className="text-brand-red">Email</span></h2>
              <div className="w-8 h-1 bg-brand-red text-gray-900 mx-auto rounded-full mb-3"></div>
            </div>
            <form onSubmit={handleVerifyEmail} className="w-full max-w-sm space-y-3">
              <div className="flex justify-center gap-2">
                {emailOtp.map((digit, idx) => (
                  <input key={idx} ref={el => emailOtpRefs.current[idx] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx, setEmailOtp, emailOtpRefs)}
                    onKeyDown={e => handleOtpKeyDown(e, idx, emailOtp, emailOtpRefs)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-orange-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 focus:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm"
                  />
                ))}
              </div>
              {(localError || error) && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center">{localError || error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-brand-red text-white font-bold py-2 rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {loading ? 'Verifying...' : 'Verify Email & Create Account →'}
              </button>
              <button type="button" onClick={() => setStep('phone_otp')} className="w-full text-sm text-gray-900/60 hover:text-gray-900 transition-colors">← Back</button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-sans font-extrabold tracking-tight text-gray-900">Account Created!</h2>
            <p className="text-gray-900/60 text-sm">Redirecting you to the store...</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-900/60 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-red hover:text-gray-900 transition-colors">
            Sign In
          </Link>
        </p>

        </motion.div>
      </div>
    </>
  );
}
