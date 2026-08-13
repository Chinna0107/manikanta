import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Droplet, Feather, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function ForgotPassword({ onBack, dark = false }) {
  const [step, setStep] = useState('email'); // email | otp | password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  const inputCls = dark
    ? 'w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all'
    : 'w-full bg-white border border-brand-red/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-gray-900 placeholder:text-gray-900/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow';
  const labelCls = dark ? 'text-xs font-medium text-white block mb-1.5' : 'text-sm font-semibold text-gray-900 block mb-1.5';
  const btnCls = dark
    ? 'w-full bg-gradient-to-r from-[#e3c162] to-[#b38827] text-black font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
    : 'w-full bg-white text-brand-red font-bold py-4 rounded-xl text-sm hover:bg-white transition-all disabled:opacity-60 shadow-lg';
  const errCls = dark
    ? 'bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center'
    : 'bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('otp');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setError('Enter all 6 digits');
    setStep('password');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Password reset successfully! You can now sign in.');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  if (success) return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-3xl">✓</span>
      </div>
      <p className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
      <button onClick={onBack} className={btnCls}>Back to Sign In</button>
    </div>
  );

  return (
    <div className="space-y-5">
      <button onClick={onBack} className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${dark ? 'text-white/50 hover:text-white' : 'text-gray-900/50 hover:text-gray-900'} transition-colors`}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
      </button>

      <div>
        <h4 className={`font-bold tracking-widest uppercase text-xs mb-1 ${dark ? 'text-brand-orange' : 'text-brand-red'}`}>Reset Password</h4>
        <h2 className={`text-2xl font-serif font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
        </h2>
        <p className={`text-xs ${dark ? 'text-white/50' : 'text-gray-900/60'}`}>
          {step === 'email' ? 'Enter your email to receive a reset OTP.' : step === 'otp' ? `OTP sent to ${email} and your phone.` : 'Enter your new password.'}
        </p>
      </div>

      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className={labelCls}>Email Address</label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-brand-orange' : 'text-gray-900/40'}`} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
          </div>
          {error && <p className={errCls}>{error}</p>}
          <button type="submit" disabled={loading} className={btnCls}>{loading ? 'Sending OTP...' : 'Send OTP →'}</button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input key={idx} ref={el => otpRefs.current[idx] = el}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleOtpChange(e.target.value, idx)}
                onKeyDown={e => handleOtpKeyDown(e, idx)}
                className={`w-10 h-12 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-colors ${
                  dark ? 'bg-transparent border-white/20 text-white focus:border-[#D4AF37]' : 'bg-white border-brand-red/10 text-gray-900 focus:border-brand-red/10'
                }`}
              />
            ))}
          </div>
          {error && <p className={errCls}>{error}</p>}
          <button type="submit" className={btnCls}>Verify OTP →</button>
          <button type="button" onClick={() => { setStep('email'); setOtp(['','','','','','']); }}
            className={`w-full text-xs ${dark ? 'text-white/40 hover:text-white' : 'text-gray-900/40 hover:text-gray-900'} transition-colors`}>
            Resend OTP
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-brand-orange' : 'text-gray-900/40'}`} />
              <input type={showPass ? 'text' : 'password'} required minLength={6} value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${dark ? 'text-brand-orange' : 'text-gray-900/40'}`}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className={errCls}>{error}</p>}
          <button type="submit" disabled={loading} className={btnCls}>{loading ? 'Resetting...' : 'Reset Password →'}</button>
        </form>
      )}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, googleLogin, loading, error } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const res = await login(form.email, form.password);
    if (res.success) navigate(res.role === 'admin' ? '/admin' : redirect);
    else setLocalError(res.error);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLocalError('');
    const res = await googleLogin(tokenResponse.access_token || tokenResponse.credential || tokenResponse.id_token);
    // Note: useGoogleLogin with flow: 'implicit' gives access_token. We can use googleAuth if it accepts id_token or access_token.
    // To get id_token, we should use standard credentialResponse from GoogleLogin, OR use implicit flow but backend needs userinfo endpoint.
    // Wait, the backend verifyIdToken expects an id_token!
    // So we should NOT use `useGoogleLogin` which only gives access_token unless we use flow: 'auth-code'.
    // Actually, `useGoogleLogin` with flow default gives an access token.
    // Let me revise this. I'll use `GoogleLogin` component if I want idToken easily, OR I can use `useGoogleLogin` and fetch user info on frontend and pass it, OR better yet, just use `googleAuth(tokenResponse.credential)` if I use the bare `GoogleLogin` component, OR I can just use `google-auth-library` verifyIdToken if I can get the id_token.
    // Let's use `useGoogleLogin` with `flow: 'implicit'` but wait! We can just fetch user info on the frontend and send it to our backend, or even better, if we need idToken, we can use `window.google.accounts.oauth2` or just use the `<GoogleLogin />` component. Since we have custom buttons, `useGoogleLogin` is required.
    // Wait! `useGoogleLogin` DOES NOT return an `id_token`. It only returns an `access_token`. The backend `verifyIdToken` requires an `id_token`.
    // Instead of `verifyIdToken` in backend, I can fetch `https://www.googleapis.com/oauth2/v3/userinfo` with the `access_token`!
    // That's much easier for custom buttons. Let's change backend to accept `accessToken` instead.
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalError('');
      // Send access_token to backend
      const res = await googleLogin(tokenResponse.access_token);
      if (res.success) navigate(res.role === 'admin' ? '/admin' : redirect);
      else setLocalError(res.error);
    },
    onError: () => {
      setLocalError('Google Login Failed');
    },
  });

  const displayError = localError || error;

  return (
    <>
      {/* DESKTOP VIEW (Unchanged, hidden on mobile) */}
      <div className="hidden lg:flex min-h-screen font-sans">
        {/* Left Panel — Brand Visual */}
        <div className="w-1/2 relative flex flex-col items-center justify-center px-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop" alt="Supermarket background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center w-full max-w-md"
          >
            <Link to="/" className="inline-flex bg-white p-5 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform items-center justify-center">
              <img src={logoImg} alt="Manikanta Super Market" className="h-20 w-auto object-contain" />
            </Link>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-5 leading-tight drop-shadow-md">
              Freshness<br />
              <span className="text-[#FFC107]">Delivered Daily</span>
            </h1>
            
            <p className="text-white/90 text-base leading-relaxed mb-10 drop-shadow-sm font-medium px-4">
              Your one-stop destination for farm-fresh groceries, everyday essentials, and premium quality products.
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              {[
                { icon: <ShieldCheck className="w-6 h-6 text-[#FFC107]" strokeWidth={2} />, label: '100% Quality' },
                { icon: <Droplet className="w-6 h-6 text-[#FFC107]" strokeWidth={2} />, label: 'Farm Fresh' },
                { icon: <Feather className="w-6 h-6 text-[#FFC107]" strokeWidth={2} />, label: 'Fast Delivery' },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                    {icon}
                  </div>
                  <span className="text-white font-semibold text-xs tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-1/2 bg-brand-cream flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <div className="mb-8">
              <h4 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-2">Welcome Back</h4>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Sign In</h2>
              <div className="w-14 h-1 bg-brand-red text-white rounded-full"></div>
              <p className="text-gray-900/60 text-sm mt-4">Enter your credentials to access your account.</p>
            </div>

            {showForgot ? (
            <ForgotPassword onBack={() => setShowForgot(false)} dark={false} />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-900/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full bg-white border border-brand-red/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-gray-900 placeholder:text-gray-900/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-900/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} required
                    placeholder="Your password"
                    className="w-full bg-white border border-brand-red/10 rounded-xl px-4 py-3.5 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-900/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900/40 hover:text-gray-900 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">
                  {displayError}
                </div>
              )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full bg-white text-brand-red font-bold py-4 rounded-xl text-sm hover:bg-white transition-all disabled:opacity-60 mt-2 shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In →'}
                </motion.button>
                <button type="button" onClick={() => setShowForgot(true)}
                  className="w-full text-center text-xs text-gray-900/50 hover:text-gray-900 transition-colors mt-1">
                  Forgot Password?
                </button>
              </form>
          )}

              {/* OR Google */}
              <div className="flex items-center gap-3 w-full my-6">
                <div className="h-px bg-white flex-1"></div>
                <span className="text-gray-900/40 text-[10px] tracking-wider uppercase">OR</span>
                <div className="h-px bg-white flex-1"></div>
              </div>
              
              <button type="button" onClick={() => loginWithGoogle()} className="w-full bg-white border border-brand-dark-blue/10 text-gray-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-white transition-colors">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                Continue with Google
              </button>

            <p className="text-center text-sm text-gray-900/60 mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-gray-900 hover:text-brand-red transition-colors">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden min-h-screen bg-[#060B19] font-sans flex flex-col relative overflow-y-auto pb-10">
        {/* Top Image Background */}
        <div className="absolute top-0 left-0 w-full h-[320px] z-0">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop" alt="Supermarket background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#060B19]/80 to-[#060B19]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-start px-6 pt-10 w-full flex-grow bg-gradient-to-b from-transparent to-[#060B19] to-40%">
          {/* Header / Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="inline-flex bg-white p-4 rounded-3xl shadow-2xl mb-5 items-center justify-center">
              <img src={brandLogo} alt="Manikanta Super Market Logo" className="w-16 h-16 object-contain" />
            </Link>
            <h1 className="font-serif font-bold text-3xl text-white text-center leading-tight drop-shadow-md">
              Freshness<br />
              <span className="text-[#FFC107]">Delivered Daily</span>
            </h1>
            <p className="text-white/90 text-xs text-center leading-relaxed max-w-[280px] mt-3 font-medium">
              Your one-stop destination for farm-fresh groceries and everyday essentials.
            </p>
          </div>

        {/* Sign In Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-2">
            Sign <span className="text-brand-orange">In</span>
          </h2>
          <div className="w-8 h-1 bg-brand-orange text-white mx-auto rounded-full mb-3"></div>
          <p className="text-white/50 text-xs">Enter your credentials to access your account.</p>
        </div>

        {/* Form */}
        {showForgot ? (
          <div className="w-full max-w-sm">
            <ForgotPassword onBack={() => setShowForgot(false)} dark={true} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-white block mb-1.5 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-orange absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white block mb-1.5 pl-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-orange absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} required
                placeholder="Your password"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange hover:text-brand-orange/80 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center">
              {displayError}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#e3c162] to-[#b38827] text-black font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 mt-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <button type="button" onClick={() => setShowForgot(true)}
            className="w-full text-center text-xs text-white/40 hover:text-white transition-colors mt-1">
            Forgot Password?
          </button>
        </form>
        )}

        {/* OR Google */}
        <div className="flex items-center gap-3 w-full max-w-sm my-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-white/40 text-[10px] tracking-wider uppercase">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button type="button" onClick={() => loginWithGoogle()} className="w-full max-w-sm bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-gray-100 transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-white/50 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-orange hover:text-white transition-colors">
            Create Account
          </Link>
        </p>

        {/* Bottom Badges */}
        <div className="flex justify-between w-full max-w-sm mt-12 mb-4 px-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FFC107]" strokeWidth={2} />
            </div>
            <span className="text-white text-[10px] font-semibold tracking-wide">100% Quality</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-[#FFC107]" strokeWidth={2} />
            </div>
            <span className="text-white text-[10px] font-semibold tracking-wide">Farm Fresh</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
              <Feather className="w-5 h-5 text-[#FFC107]" strokeWidth={2} />
            </div>
            <span className="text-white text-[10px] font-semibold tracking-wide">Fast Delivery</span>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
