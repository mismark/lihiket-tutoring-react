/**
 * First-time admin setup page — /setup
 * Creates the first admin account when no admin exists yet.
 * After an admin is created, this page redirects to /login.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiShield, FiUser, FiMail, FiLock, FiPhone,
  FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff,
} from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SetupAdminPage() {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [form, setForm]       = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', phone: '',
    setupKey: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/create-admin', {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        phone:     form.phone.trim() || undefined,
        setupKey:  form.setupKey || undefined,
      });
      toast.success('Admin account created successfully!');
      // Auto-login: store token
      if (res.data?.data?.token) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        localStorage.setItem('auth_version', '2');
      }
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      const msg = err.message || 'Setup failed';
      if (msg.includes('already exists')) {
        setError('An admin already exists. Go to the login page.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
    focus:ring-2 focus:ring-blue-500
    ${dark
      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'}`;

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-4 relative overflow-hidden
      ${dark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>

      {/* Background glow */}
      <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none
        ${dark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none
        ${dark ? 'bg-violet-600/10' : 'bg-violet-400/20'}`} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg
            ${dark ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-600 to-indigo-600'}`}>
            <FiShield className={`w-8 h-8 ${dark ? 'text-blue-400' : 'text-white'}`} />
          </div>
          <h1 className={`text-3xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Lihiket Setup
          </h1>
          <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Create the administrator account that controls the entire platform
          </p>
        </div>

        {/* Success state */}
        {done ? (
          <div className={`rounded-3xl p-8 text-center shadow-2xl ${
            dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Admin account created!
            </h2>
            <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Redirecting to your dashboard…
            </p>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className={`rounded-3xl shadow-2xl p-7 sm:p-8 ${
            dark ? 'bg-slate-800/90 border border-slate-700/60' : 'bg-white border border-slate-200'
          }`}>

            {/* Warning banner */}
            <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
              dark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className={`text-sm ${dark ? 'text-amber-300' : 'text-amber-800'}`}>
                <strong>First-time setup only.</strong> This page is disabled after the first admin is created.
                Keep your credentials safe — this account has full control over the platform.
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-400/30 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className={`text-sm font-medium ${dark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    placeholder="First name" required className={inputCls} />
                </div>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    placeholder="Last name" required className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="Admin email address" required className={inputCls} />
              </div>

              {/* Phone (optional) */}
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="Phone number (optional)" className={inputCls} />
              </div>

              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Password (min 8 characters)" required className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Confirm password" required className={inputCls} />
              </div>

              {/* Optional setup key */}
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.setupKey} onChange={e => set('setupKey', e.target.value)}
                  placeholder="Setup key (optional — from ADMIN_SETUP_KEY in .env)"
                  className={inputCls} />
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600
                           hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm
                           rounded-2xl shadow-lg shadow-blue-600/25 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating admin…</>
                ) : (
                  <><FiShield className="w-4 h-4" /> Create Admin Account</>
                )}
              </button>
            </form>

            <p className={`mt-5 text-xs text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Already have an admin account?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
