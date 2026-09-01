import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { loginUser } from '../../api/auth.api';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import LoginBrandSection from './components/LoginBrandSection';
import LoginForm         from './components/LoginForm';
import ErrorBanner       from './components/ErrorBanner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [form, setForm] = useState({
    email:    location.state?.email || '',
    password: '',
  });
  const [showPassword,      setShowPassword]      = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [errorMsg,          setErrorMsg]          = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrorMsg('');
    setIsPendingApproval(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setIsPendingApproval(false);
    try {
      const response = await loginUser({
        email:    form.email.trim(),
        password: form.password,
      });
      if (response.success && response.data) {
        toast.success(`Welcome back, ${response.data.user.firstName}!`);
        login(response.data.user, response.data.token);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err.message || 'Failed to sign in. Please try again.';
      setErrorMsg(message);
      if (message.toLowerCase().includes('pending') || message.toLowerCase().includes('approval')) {
        setIsPendingApproval(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans ${
      dark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
           : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Background glows */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${dark ? 'bg-indigo-600/10' : 'bg-indigo-400/20'}`} />

      <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left brand section */}
          <LoginBrandSection theme={theme} />

          {/* Right form */}
          <div>
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2.5 group justify-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FiBookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-2xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Lihiket<span className="text-blue-400">.</span>
                  </div>
                  <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Learning Platform</p>
                </div>
              </Link>
              <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Sign in</h2>
              <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Create one
                </Link>
              </p>
            </div>

            {/* Card */}
            <div className={`border backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 animate-slide-up ${
              dark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'
            }`}>

              {/* Desktop heading */}
              <div className="hidden lg:block">
                <h3 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Sign in to account
                </h3>
                <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Enter your credentials to access the platform
                </p>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <ErrorBanner
                  message={errorMsg}
                  isPendingApproval={isPendingApproval}
                />
              )}

              {/* Login form */}
              <LoginForm
                form={form}
                onChange={handleChange}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(v => !v)}
                loading={loading}
                onSubmit={handleSubmit}
                theme={theme}
              />

              {/* Sign up link */}
              <p className={`text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                New to Lihiket?{' '}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className={`mt-8 text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Secured by enterprise-grade encryption &bull; &copy; {new Date().getFullYear()} Lihiket
        </p>
      </div>
    </div>
  );
}
