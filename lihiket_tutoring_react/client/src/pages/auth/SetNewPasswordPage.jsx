import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield, FiBookOpen } from 'react-icons/fi';
import { setNewPassword } from '../../api/auth.api';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';

const STRENGTH_CONFIG = [
  { label: 'Too Weak', color: 'bg-slate-700', text: 'text-slate-500' },
  { label: 'Weak',     color: 'bg-red-500',   text: 'text-red-400' },
  { label: 'Fair',     color: 'bg-amber-500', text: 'text-amber-400' },
  { label: 'Good',     color: 'bg-blue-500',  text: 'text-blue-400' },
  { label: 'Strong',   color: 'bg-emerald-500', text: 'text-emerald-400' },
];

function calculatePasswordStrength(pass) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

export default function SetNewPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match. Please recheck.');
      return;
    }
    if (!email || !otp) {
      setErrorMsg('Missing verification session. Please restart password reset from the beginning.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await setNewPassword({
        email,
        otp,
        password: form.password,
      });
      setIsSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const strength = calculatePasswordStrength(form.password);
  const currentStrengthInfo = STRENGTH_CONFIG[strength];

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Glow */}
      <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-emerald-600/10' : 'bg-emerald-400/20'}`} />

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
            <FiShield className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Set New Password
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Create a secure password for your account.
          </p>
        </div>

        {/* Card */}
        <div className={`mt-8 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700/70' : 'bg-white border-slate-200'}`}>
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 'bg-emerald-100 border-emerald-200 text-emerald-600 shadow-emerald-500/10'}`}>
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Password Updated Successfully!</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Your password has been changed. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition"
              >
                <FiArrowRight className="w-4 h-4" /> Go to Login
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-fade-in">
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="font-medium">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* New Password */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    New Password *
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <FiLock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                      placeholder="Min. 8 characters"
                      className={`block w-full pl-11 pr-12 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {form.password && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              step <= strength ? currentStrengthInfo.color : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-bold ${currentStrengthInfo.text}`}>
                        {currentStrengthInfo.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Confirm New Password *
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <FiLock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                      placeholder="Repeat new password"
                      className={`block w-full pl-11 pr-12 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel and return to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
