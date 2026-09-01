import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiAtSign, FiArrowLeft, FiArrowRight, FiKey, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import { forgotPassword } from '../../api/auth.api';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [identifier, setIdentifier] = useState(location.state?.email || '');
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or username.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await forgotPassword(identifier.trim().toLowerCase());
      toast.success(response.message || 'OTP sent! Check your inbox.');
      // Use the resolved email from the server (in case user entered a username)
      const resolvedEmail = response.data?.email || identifier.trim().toLowerCase();
      navigate('/verify-otp', {
        state: { email: resolvedEmail },
      });
    } catch (err) {
      const msg = err.message || 'Failed to send OTP code. Please try again.';
      if (msg.includes('No account') || msg.includes('404') || msg.includes('not found')) {
        setErrorMsg('No account found with that email or username. Please check and try again.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `block w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none
    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
    ${dark
      ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'}`;

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans
      ${dark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>

      {/* Background glows */}
      <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-indigo-600/10' : 'bg-indigo-400/20'}`} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <span className={`text-2xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              Lihiket<span className="text-blue-400">.</span>
            </span>
          </Link>

          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm
            ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <FiKey className="w-7 h-7" />
          </div>

          <h2 className={`text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
            Forgot your password?
          </h2>
          <p className={`mt-2 text-sm max-w-sm mx-auto ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Enter your email or username and we'll send a 6-digit verification code to your inbox.
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-2xl p-6 sm:p-8
          ${dark ? 'bg-slate-800/90 border border-slate-700/60' : 'bg-white border border-slate-200'}`}>

          {/* Error */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className={`text-sm font-medium ${dark ? 'text-red-300' : 'text-red-700'}`}>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                Email or Username
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiAtSign className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setErrorMsg(''); }}
                  required
                  autoComplete="username"
                  placeholder="name@email.com or your username"
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600
                         hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm
                         rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40
                         active:scale-[0.99] transition-all duration-200
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Code…
                </>
              ) : (
                <>
                  Send Verification Code
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login"
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors
                ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
