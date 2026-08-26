import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiAlertCircle, FiRotateCw, FiMail, FiBookOpen } from 'react-icons/fi';
import { verifyOTP, forgotPassword } from '../../api/auth.api';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [email, setEmail] = useState(location.state?.email || '');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);

  // Auto-decrement cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);
    setErrorMsg('');

    // Advance focus if digit was entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      const split = pasteData.split('');
      setDigits(split);
      setErrorMsg('');
      inputRefs.current[3]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;
    setResending(true);
    setErrorMsg('');
    try {
      await forgotPassword(email);
      toast.success('A new 4-digit OTP has been sent to your email.');
      setCountdown(60);
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = digits.join('');

    if (fullCode.length < 4) {
      setErrorMsg('Please enter all 4 digits of the verification code.');
      return;
    }

    if (!email) {
      setErrorMsg('Missing email address. Please start password reset again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyOTP({ email, otp: fullCode });
      toast.success('Code verified! Set your new password.');
      navigate('/set-new-password', {
        state: { email, otp: fullCode },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Background glow */}
      <div className={`absolute top-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-emerald-600/10' : 'bg-emerald-400/20'}`} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-200">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <span className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Lihiket<span className="text-blue-400">.</span>
            </span>
          </Link>
          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mt-6 mb-2 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-600'}`}>
            <FiMail className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Enter Verification Code
          </h2>
          <p className={`mt-2 text-sm max-w-xs mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            We sent a 4-digit code to{' '}
            <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{email || 'your registered email'}</strong>
          </p>
        </div>

        {/* Card */}
        <div className={`mt-8 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700/70' : 'bg-white border-slate-200'}`}>
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-fade-in">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* 4 Digit Boxes */}
            <div className="flex justify-center items-center gap-3 sm:gap-4 my-6" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-black rounded-2xl border-2 bg-slate-900/90 outline-none transition-all ${
                    digit
                      ? theme === 'dark' ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 text-blue-400' : 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 text-blue-600'
                      : theme === 'dark' ? 'border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || digits.join('').length < 4}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code…</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Section */}
          <div className={`mt-6 pt-6 border-t flex items-center justify-between text-xs ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Didn't receive the code?</span>
            {countdown > 0 ? (
              <span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Resend code in <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className={`inline-flex items-center gap-1 font-bold transition-colors disabled:opacity-50 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                <FiRotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
