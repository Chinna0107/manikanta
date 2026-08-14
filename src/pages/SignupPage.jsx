import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck, Store, UserCircle2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/logo.png';
import { PhoneInput } from '../components/PhoneInput';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// ── Step Progress Bar ─────────────────────────────────────────────────────────
function StepBar({ step, mobile = false }) {
  const steps = ['Role', 'Details', 'Verify', 'Done'];
  const activeIdx = { role: 0, form: 1, otp: 2, done: 3 }[step] ?? 0;
  return (
    <div className={`flex items-center gap-1 w-full ${mobile ? 'mb-5' : 'mb-6'}`}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`${mobile ? 'w-8 h-8' : 'w-7 h-7'} rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < activeIdx ? 'bg-green-500 text-white' :
              i === activeIdx ? 'bg-[#D61A3C] text-white ring-4 ring-[#D61A3C]/20' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < activeIdx ? <CheckCircle2 className={mobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} /> : i + 1}
            </div>
            <span className={`${mobile ? 'text-[10px]' : 'text-[9px]'} font-semibold tracking-wide uppercase ${
              i === activeIdx ? 'text-[#D61A3C]' : i < activeIdx ? 'text-green-600' : 'text-gray-300'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-3 rounded-full transition-all duration-500 ${i < activeIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Role Card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, selected, onSelect, mobile = false }) {
  const isShopkeeper = role === 'shopkeeper';
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`group relative w-full flex flex-col items-center gap-3 ${mobile ? 'p-5' : 'p-6'} rounded-2xl border-2 transition-all duration-300 cursor-pointer active:scale-95 ${
        selected
          ? 'border-[#D61A3C] bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-100 ring-4 ring-[#D61A3C]/10'
          : 'border-gray-200 bg-white hover:border-[#D61A3C]/40 hover:shadow-md'
      }`}
    >
      <div className={`${mobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl flex items-center justify-center transition-all duration-300 ${
        selected ? 'bg-[#D61A3C] shadow-lg shadow-[#D61A3C]/30' : 'bg-gray-100 group-hover:bg-[#D61A3C]/10'
      }`}>
        {isShopkeeper
          ? <Store className={`${mobile ? 'w-7 h-7' : 'w-8 h-8'} transition-colors ${selected ? 'text-white' : 'text-gray-400 group-hover:text-[#D61A3C]'}`} />
          : <UserCircle2 className={`${mobile ? 'w-7 h-7' : 'w-8 h-8'} transition-colors ${selected ? 'text-white' : 'text-gray-400 group-hover:text-[#D61A3C]'}`} />
        }
      </div>
      <div className="text-center">
        <p className={`${mobile ? 'text-base' : 'text-lg'} font-bold transition-colors ${selected ? 'text-[#D61A3C]' : 'text-gray-900'}`}>
          {isShopkeeper ? 'Shopkeeper' : 'Customer'}
        </p>
        <p className={`text-xs mt-0.5 leading-tight transition-colors ${selected ? 'text-rose-500' : 'text-gray-400'}`}>
          {isShopkeeper ? 'I sell products' : 'I shop & buy'}
        </p>
      </div>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#D61A3C] flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </motion.div>
      )}
    </button>
  );
}

// ── OTP Input Row ─────────────────────────────────────────────────────────────
function OtpRow({ otp, setOtp, refs, mobile = false }) {
  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  return (
    <div className="flex justify-center gap-2.5">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={el => refs.current[idx] = el}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(e.target.value, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          className={`${mobile ? 'w-12 h-14' : 'w-11 h-13'} text-center text-2xl font-bold rounded-xl border-2 bg-white text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 transition-all duration-200 border-gray-200 hover:border-gray-300 shadow-sm`}
        />
      ))}
    </div>
  );
}

// ── Google SVG ────────────────────────────────────────────────────────────────
function GoogleSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
      </g>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function SignupPage() {
  const navigate = useNavigate();
  const { signup, verifyOtp, googleLogin, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const [allowedCountries] = useState([]);
  const otpRefs = useRef([]);

  const pwRules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'At least 1 number', ok: /\d/.test(form.password) },
    { label: 'At least 1 special character', ok: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const passwordValid = pwRules.every(r => r.ok);

  useEffect(() => { return () => clearError(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => { setSelectedRole(role); setLocalError(''); };
  const handleRoleContinue = () => {
    if (!selectedRole) { setLocalError('Please select your account type to continue.'); return; }
    setLocalError(''); setStep('form');
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setLocalError('');
    if (!consentAccepted) { setLocalError('Please accept the Terms & Privacy Policy to continue.'); return; }
    if (!passwordValid) { setPasswordTouched(true); setLocalError('Password does not meet the requirements.'); return; }
    const res = await signup(form.name, form.email, form.phone, form.password, '', selectedRole);
    if (res.success) { setOtp(['', '', '', '', '', '']); setStep('otp'); }
    else setLocalError(res.error);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setLocalError('');
    const code = otp.join('');
    if (code.length < 6) { setLocalError('Please enter all 6 digits.'); return; }
    const res = await verifyOtp(form.email, code);
    if (res.success) { setStep('done'); setTimeout(() => navigate('/'), 2500); }
    else setLocalError(res.error);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalError('');
      const res = await googleLogin(tokenResponse.access_token);
      if (res.success) navigate(res.role === 'admin' ? '/admin' : '/');
      else setLocalError(res.error);
    },
    onError: () => setLocalError('Google Signup Failed'),
  });

  const displayError = localError || error;
  const inputCls = "w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 pl-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 hover:border-gray-300 transition-all duration-200";

  const RoleBadge = ({ onClick }) => selectedRole ? (
    <button type="button" onClick={onClick || (() => setStep('role'))}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D61A3C]/10 text-[#D61A3C] text-xs font-semibold border border-[#D61A3C]/20 hover:bg-[#D61A3C]/20 transition-colors mb-2">
      {selectedRole === 'shopkeeper' ? <Store className="w-3 h-3" /> : <UserCircle2 className="w-3 h-3" />}
      {selectedRole === 'shopkeeper' ? 'Shopkeeper' : 'Customer'}
      <span className="text-[#D61A3C]/50 ml-0.5">· change</span>
    </button>
  ) : null;

  const slideVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // DESKTOP render (lg+)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderDesktopStep = () => (
    <AnimatePresence mode="wait">
      <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }} className="w-full">

        {step === 'role' && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Join as</h2>
              <p className="text-sm text-gray-500 mt-1">Choose your account type to get started</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard role="customer" selected={selectedRole === 'customer'} onSelect={handleRoleSelect} />
              <RoleCard role="shopkeeper" selected={selectedRole === 'shopkeeper'} onSelect={handleRoleSelect} />
            </div>
            {displayError && <p className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">{displayError}</p>}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="button" onClick={handleRoleContinue}
              className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
            <div className="flex items-center gap-3 w-full">
              <div className="h-px bg-gray-200 flex-1" /><span className="text-gray-400 text-[10px] tracking-wider uppercase">OR</span><div className="h-px bg-gray-200 flex-1" />
            </div>
            <button type="button" onClick={() => loginWithGoogle()}
              className="w-full bg-white border border-gray-200 text-gray-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm">
              <GoogleSvg /> Continue with Google
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-gray-900 hover:text-[#D61A3C] transition-colors">Sign In</Link>
            </p>
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-1">
            <div className="mb-4">
              <RoleBadge />
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fill in your information below</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#D61A3C] transition-colors" />
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#D61A3C] transition-colors" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                <PhoneInput allowedCountries={allowedCountries} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#D61A3C] transition-colors" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} onBlur={() => setPasswordTouched(true)} required
                    placeholder="Min 8 chars, 1 number, 1 special"
                    className={`${inputCls} pr-12 ${passwordTouched && !passwordValid ? 'border-red-400 focus:border-red-500' : ''}`} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D61A3C] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordTouched && (
                  <div className="mt-1.5 space-y-0.5">
                    {pwRules.map((r, i) => (
                      <p key={i} className={`text-xs flex items-center gap-1.5 ${r.ok ? 'text-green-600' : 'text-red-500'}`}>
                        <span>{r.ok ? '✓' : '✗'}</span> {r.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" checked={consentAccepted} onChange={e => setConsentAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#D61A3C] rounded shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I confirm I am 13+ and agree to the{' '}
                  <Link to="/terms-of-service" target="_blank" className="font-bold text-gray-900 underline hover:text-[#D61A3C]">Terms & Conditions</Link> and{' '}
                  <Link to="/privacy-policy" target="_blank" className="font-bold text-gray-900 underline hover:text-[#D61A3C]">Privacy Policy</Link>.
                </span>
              </label>
              {displayError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">{displayError}</div>}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Sending OTP...' : <><span>Send OTP & Continue</span><ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>
            <button type="button" onClick={() => { setStep('role'); setLocalError(''); }}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors pt-1">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <RoleBadge />
              <div className="w-16 h-16 rounded-2xl bg-[#D61A3C]/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#D61A3C]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Check your email</h2>
              <p className="text-sm text-gray-500 mt-2">We sent a 6-digit code to <span className="font-semibold text-gray-900">{form.email}</span></p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <OtpRow otp={otp} setOtp={setOtp} refs={otpRefs} />
              {displayError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">{displayError}</div>}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Verifying...' : <><span>Verify & Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </motion.button>
              <button type="button" onClick={() => { setStep('form'); setLocalError(''); }}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto">
                <ArrowLeft className="w-3 h-3" /> Change details
              </button>
            </form>
          </div>
        )}

        {step === 'done' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center py-10 gap-5 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome aboard! 🎉</h2>
              <p className="text-sm text-gray-500 mt-2">Your account has been created successfully.<br />Redirecting you to the store...</p>
            </div>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE render (< lg) — native-app feel with gradient header + card body
  // ─────────────────────────────────────────────────────────────────────────────
  const renderMobileStep = () => (
    <AnimatePresence mode="wait">
      <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit"
        transition={{ duration: 0.22, ease: 'easeOut' }} className="w-full">

        {/* ── MOBILE STEP 1: ROLE ── */}
        {step === 'role' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Join as</h2>
              <p className="text-sm text-gray-500 mt-1">Choose your account type</p>
            </div>

            {/* Role cards — horizontal on mobile */}
            <div className="grid grid-cols-2 gap-3">
              <RoleCard role="customer" selected={selectedRole === 'customer'} onSelect={handleRoleSelect} mobile />
              <RoleCard role="shopkeeper" selected={selectedRole === 'shopkeeper'} onSelect={handleRoleSelect} mobile />
            </div>

            {displayError && (
              <p className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{displayError}</p>
            )}

            {/* CTA */}
            <motion.button whileTap={{ scale: 0.97 }}
              type="button" onClick={handleRoleContinue}
              className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:brightness-95 transition-all">
              Continue <ArrowRight className="w-5 h-5" />
            </motion.button>

            {/* Divider + Google */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-gray-400 text-[11px] tracking-widest uppercase">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <button type="button" onClick={() => loginWithGoogle()}
              className="w-full bg-white border border-gray-200 text-gray-800 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-3 text-sm shadow-sm active:bg-gray-50 transition-all">
              <GoogleSvg /> Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 pb-2">
              Have an account?{' '}
              <Link to="/login" className="font-bold text-[#D61A3C]">Sign In</Link>
            </p>
          </div>
        )}

        {/* ── MOBILE STEP 2: DETAILS FORM ── */}
        {step === 'form' && (
          <div>
            {/* Header */}
            <div className="mb-5">
              <RoleBadge />
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fill in your information</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 pl-11 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 shadow-sm transition-all" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 pl-11 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 shadow-sm transition-all" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <PhoneInput allowedCountries={allowedCountries} value={form.phone}
                  onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} onBlur={() => setPasswordTouched(true)} required
                    placeholder="Min 8 chars, 1 number, 1 special"
                    className={`w-full bg-white border rounded-2xl px-4 pl-11 pr-12 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 shadow-sm transition-all ${
                      passwordTouched && !passwordValid
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#D61A3C] focus:ring-[#D61A3C]/10'
                    }`} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D61A3C] p-1 transition-colors">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordTouched && (
                  <div className="mt-2 space-y-1 px-1">
                    {pwRules.map((r, i) => (
                      <p key={i} className={`text-xs flex items-center gap-1.5 font-medium ${r.ok ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="text-sm">{r.ok ? '✓' : '✗'}</span> {r.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer bg-gray-50 rounded-2xl p-3.5 border border-gray-200 active:bg-gray-100 transition-colors">
                <input type="checkbox" checked={consentAccepted} onChange={e => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[#D61A3C] rounded shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I confirm I'm 13+ and agree to the{' '}
                  <Link to="/terms-of-service" target="_blank" className="font-bold text-gray-800 underline">Terms</Link> &{' '}
                  <Link to="/privacy-policy" target="_blank" className="font-bold text-gray-800 underline">Privacy Policy</Link>.
                </span>
              </label>

              {displayError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-600 text-center font-medium">{displayError}</div>
              )}

              <motion.button whileTap={{ scale: 0.97 }}
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2 active:brightness-95 transition-all">
                {loading ? 'Sending OTP...' : <><span>Send OTP & Continue</span><ArrowRight className="w-5 h-5" /></>}
              </motion.button>
            </form>

            <button type="button" onClick={() => { setStep('role'); setLocalError(''); }}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 py-3 mt-1 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to role selection
            </button>
          </div>
        )}

        {/* ── MOBILE STEP 3: OTP ── */}
        {step === 'otp' && (
          <div className="space-y-6">
            {/* Icon + heading */}
            <div className="text-center">
              <RoleBadge />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D61A3C]/10 to-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Mail className="w-10 h-10 text-[#D61A3C]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Check your email</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                We sent a 6-digit code to{' '}
                <span className="font-bold text-gray-900 block mt-0.5">{form.email}</span>
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => otpRefs.current[idx] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => {
                    const val = e.target.value;
                    if (!/^\d?$/.test(val)) return;
                    const next = [...otp]; next[idx] = val; setOtp(next);
                    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                  }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 bg-white text-gray-900 focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-[#D61A3C]/10 border-gray-200 shadow-sm transition-all caret-transparent"
                />
              ))}
            </div>

            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-600 text-center font-medium">{displayError}</div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }}
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#D81B24] to-[#ff474f] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2 active:brightness-95 transition-all">
                {loading ? 'Verifying...' : <><span>Verify & Create Account</span><ArrowRight className="w-5 h-5" /></>}
              </motion.button>
            </form>

            <button type="button" onClick={() => { setStep('form'); setLocalError(''); }}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Change details
            </button>
          </div>
        )}

        {/* ── MOBILE STEP 4: SUCCESS ── */}
        {step === 'done' && (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="flex flex-col items-center justify-center py-12 gap-6 text-center">
            {/* Pulsing success ring */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-green-400/20"
              />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-200 relative">
                <ShieldCheck className="w-14 h-14 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome! 🎉</h2>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Your account has been created successfully.<br />
                Taking you to the store…
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-56 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {/* ════════════════ DESKTOP (lg+) ════════════════ */}
      <div className="hidden lg:flex h-screen w-full font-sans bg-gray-50 items-center justify-center overflow-hidden py-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_48px_-12px_rgba(0,0,0,0.12)] border border-white/80 flex flex-col items-center px-8 py-8 overflow-y-auto max-h-[94vh]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }} className="w-full">
            <div className="flex flex-col items-center mb-5">
              <Link to="/login">
                <img src={logoImg} alt="Manikanta Super Market" className="h-12 w-auto drop-shadow-md hover:scale-105 transition-transform" />
              </Link>
              <h1 className="font-extrabold tracking-tight text-gray-900 text-sm mt-1">Manikanta Super Market</h1>
            </div>
            {step !== 'done' && <StepBar step={step} />}
            {renderDesktopStep()}
          </motion.div>
        </div>
      </div>

      {/* ════════════════ MOBILE (< lg) ════════════════ */}
      <div className="lg:hidden min-h-screen w-full font-sans flex flex-col" style={{ background: 'linear-gradient(170deg, #fff5f5 0%, #fff 35%)' }}>

        {/* ── Gradient hero header ── */}
        <div className="relative bg-gradient-to-br from-[#D61A3C] to-[#a01028] px-6 pt-10 pb-16 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute top-10 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 left-8 w-28 h-28 rounded-full bg-white/5" />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-tight">Manikanta</p>
              <p className="text-white/70 text-[10px] font-medium">Super Market</p>
            </div>
          </div>

          {/* Title area */}
          <div className="mt-6 relative z-10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
              {step === 'role' ? 'Getting started' : step === 'form' ? 'Create account' : step === 'otp' ? 'Verification' : 'All done!'}
            </p>
            <h1 className="text-white text-3xl font-extrabold tracking-tight mt-1">
              {step === 'role' ? 'Join us today' : step === 'form' ? 'Your Details' : step === 'otp' ? 'Enter OTP' : 'Welcome!'}
            </h1>
          </div>
        </div>

        {/* ── White card body (overlaps header) ── */}
        <div className="flex-1 -mt-8 relative z-10">
          <div className="bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.06)] px-5 pt-6 pb-10 min-h-full">
            {/* Step bar */}
            {step !== 'done' && <StepBar step={step} mobile />}

            {/* Step content */}
            {renderMobileStep()}
          </div>
        </div>
      </div>
    </>
  );
}
