import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiArrowRight, FiKey, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import { forgotPassword } from '../../api/auth.api';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await forgotPassword(email.trim().toLowerCase());
      toast.success(response.message || 'OTP sent! Check your inbox.');
      navigate('/verify-otp', {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Background accents */}
      <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-400/20'}`} />

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
          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mt-6 mb-2 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
            <FiKey className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Forgot your password?
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            No worries! Enter your email and we'll send a 4-digit OTP code to verify your identity.
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Registered Email Address
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  placeholder="name@example.com"
                  className={`block w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Verification Code…</span>
                </>
              ) : (
                <>
                  <span>Send 4-Digit OTP</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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
