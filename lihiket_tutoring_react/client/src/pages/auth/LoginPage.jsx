import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { LuFingerprint } from 'react-icons/lu';
import { loginUser, webauthnAuthBegin, webauthnAuthFinish } from '../../api/auth.api';
import { startAuthentication } from '@simplewebauthn/browser';
import { isWebAuthnSupported } from '../../utils/webauthn';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [fpLoading,    setFpLoading]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [webauthnSupported, setWebauthnSupported] = useState(false);

  // Detect fingerprint / biometric (WebAuthn) support once on mount
  useEffect(() => {
    setWebauthnSupported(isWebAuthnSupported());
  }, []);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
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
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Fingerprint / passkey (WebAuthn) login ─────────────────────────────────
  const handleFingerprintLogin = async () => {
    setFpLoading(true);
    setErrorMsg('');
    try {
      // 1. Ask the server for authentication options (challenge)
      const begin = await webauthnAuthBegin();
      // 2. Browser prompts the user for fingerprint / Face ID / Windows Hello
      const assertion = await startAuthentication({ optionsJSON: begin.data.options });
      // 3. Server verifies the signed assertion and returns a JWT
      const result = await webauthnAuthFinish({
        response: assertion,
        requestId: begin.data.requestId,
      });
      if (result.success && result.data) {
        toast.success(`Welcome back, ${result.data.user.firstName}!`);
        login(result.data.user, result.data.token);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase();
      if (
        msg.includes('cancel') ||
        msg.includes('not allowed') ||
        msg.includes('timed out') ||
        msg.includes('abort')
      ) {
        setErrorMsg('Fingerprint sign-in was cancelled. Try again or use your password.');
      } else if (msg.includes('not registered') || msg.includes('no credentials')) {
        setErrorMsg('No fingerprint registered. Go to Profile → Passkeys and add one first.');
      } else if (msg.includes('origin') || msg.includes('rpid') || msg.includes('rp id')) {
        setErrorMsg('Domain mismatch — make sure you registered this fingerprint on this site.');
      } else {
        setErrorMsg(err?.message || 'Fingerprint sign-in failed. Please use your password instead.');
      }
    } finally {
      setFpLoading(false);
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
              {errorMsg && <ErrorBanner message={errorMsg} />}

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

              {/* Fingerprint icon only — no text */}
              {webauthnSupported && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleFingerprintLogin}
                    disabled={fpLoading || loading}
                    title="Sign in with fingerprint / Face ID"
                    className={`w-14 h-14 rounded-full flex items-center justify-center
                      transition-all duration-200 active:scale-90 disabled:opacity-50
                      ${fpLoading
                        ? 'bg-blue-500/20 border-2 border-blue-400/60'
                        : dark
                          ? 'bg-slate-700/60 border-2 border-slate-600 hover:border-blue-500 hover:bg-blue-500/10'
                          : 'bg-slate-100 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}>
                    {fpLoading
                      ? <div className="w-6 h-6 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin" />
                      : <LuFingerprint className={`w-7 h-7 ${dark ? 'text-slate-300' : 'text-slate-600'}`} />
                    }
                  </button>
                </div>
              )}

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
