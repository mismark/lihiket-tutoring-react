import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft, FiArrowRight, FiAlertCircle,
  FiRotateCw, FiMail, FiBookOpen, FiCheckCircle,
} from 'react-icons/fi';
import { verifyOTP, forgotPassword } from '../../api/auth.api';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;

export default function VerifyOTPPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [email,    setEmail]    = useState(location.state?.email || '');
  const [digits,   setDigits]   = useState(Array(OTP_LENGTH).fill(''));
  const [loading,  setLoading]  = useState(false);
  const [resending,setResending]= useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown,setCountdown]= useState(60);

  const inputRefs = useRef([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Auto-focus first box
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Redirect if no email in state
  useEffect(() => {
    if (!location.state?.email) navigate('/forgot-password', { replace: true });
  }, [location.state, navigate]);

  const handleChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setErrorMsg('');
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    // Auto-submit when all filled
    if (val && next.every(d => d) && next.join('').length === OTP_LENGTH) {
      submitCode(next.join(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ''; setDigits(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && idx > 0)              inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    const next = [...digits];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    setErrorMsg('');
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (next.every(d => d)) submitCode(next.join(''));
  };

  const submitCode = async (code) => {
    if (!email) { setErrorMsg('Email missing. Go back and try again.'); return; }
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyOTP({ email, otp: code });
      toast.success('Code verified! Create your new password.');
      navigate('/set-new-password', { state: { email, otp: code } });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired code. Try again.');
      // Shake and clear inputs on error
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setErrorMsg(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    submitCode(code);
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;
    setResending(true);
    setErrorMsg('');
    try {
      await forgotPassword(email);
      toast.success('A new 6-digit code has been sent to your email.');
      setCountdown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const filled = digits.filter(d => d).length;

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans
      ${dark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>

      {/* Background glows */}
      <div className={`absolute top-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-emerald-600/10' : 'bg-emerald-400/20'}`} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        {/* Logo + header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <span className={`text-2xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              Lihiket<span className="text-blue-400">.</span>
            </span>
          </Link>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
            dark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <FiMail className="w-8 h-8" />
          </div>

          <h2 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Check your email
          </h2>
          <p className={`mt-2 text-sm max-w-sm mx-auto leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            We sent a <strong>6-digit verification code</strong> to{' '}
            <strong className={dark ? 'text-slate-200' : 'text-slate-800'}>{email}</strong>.
            {' '}Enter it below.
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-2xl p-7 sm:p-8 ${
          dark ? 'bg-slate-800/90 border border-slate-700/60' : 'bg-white border border-slate-200'
        }`}>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-400/30 flex items-start gap-3 animate-slide-up">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className={`text-sm font-medium ${dark ? 'text-red-300' : 'text-red-700'}`}>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* 6 OTP boxes */}
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-2"
              onPaste={handlePaste}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  disabled={loading}
                  aria-label={`Digit ${idx + 1}`}
                  className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none
                    transition-all duration-150 select-none
                    ${digit
                      ? dark
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/15'
                        : 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/15'
                      : dark
                        ? 'border-slate-700 bg-slate-900/60 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i < filled ? 'bg-blue-500' : dark ? 'bg-slate-700' : 'bg-slate-200'
                }`} />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || filled < OTP_LENGTH}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600
                         hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm
                         rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40
                         active:scale-[0.99] transition-all duration-150
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Verify Code
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend + timer */}
          <div className={`mt-6 pt-5 border-t flex items-center justify-between text-sm ${
            dark ? 'border-slate-700/60' : 'border-slate-200'
          }`}>
            <span className={dark ? 'text-slate-400' : 'text-slate-500'}>
              Didn't receive it?
            </span>
            {countdown > 0 ? (
              <span className={`font-semibold tabular-nums ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Resend in{' '}
                <span className="text-blue-500 dark:text-blue-400 font-bold">
                  {String(Math.floor(countdown / 60)).padStart(2,'0')}:{String(countdown % 60).padStart(2,'0')}
                </span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className={`inline-flex items-center gap-1.5 font-bold transition-colors disabled:opacity-50 ${
                  dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                <FiRotateCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>

          {/* Expiry note */}
          <p className={`mt-3 text-xs text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            This code expires in <strong>15 minutes</strong>. Check your spam folder if not received.
          </p>

          {/* Back to login */}
          <div className="mt-5 text-center">
            <Link to="/login"
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}>
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>

        {/* Hint for dev */}
        {import.meta.env.DEV && (
          <p className={`mt-4 text-xs text-center ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
            Dev mode: OTP is printed to the server console if SMTP is not configured.
          </p>
        )}
      </div>
    </div>
  );
}
