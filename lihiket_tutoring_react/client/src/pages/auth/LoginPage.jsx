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
        setErrorMsg('Fingerprint sign-in was cancelled.');
      } else {
        setErrorMsg(err?.message || 'Fingerprint sign-in failed. You can sign in with your password instead.');
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

              {/* Fingerprint / passkey sign-in (only on WebAuthn-capable browsers) */}
              {webauthnSupported && (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-px ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <span className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>or</span>
                    <div className={`flex-1 h-px ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  </div>

                  {/* ── Biometric button — prominent on mobile ── */}
                  <button
                    type="button"
                    onClick={handleFingerprintLogin}
                    disabled={fpLoading || loading}
                    className={`group w-full py-4 px-4 font-bold text-sm rounded-2xl border-2 transition-all duration-200
                      flex items-center justify-center gap-3
                      disabled:opacity-50 disabled:cursor-not-allowed
                      active:scale-95
                      ${dark
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400'
                      }`}
                  >
                    {fpLoading ? (
                      <>
                        {/* Scanning animation */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping" />
                          <div className="absolute inset-1 rounded-full border-2 border-blue-400/60 animate-ping animation-delay-150" />
                          <LuFingerprint className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold leading-tight">Scanning…</span>
                          <span className={`text-xs font-normal ${dark ? 'text-blue-400/70' : 'text-blue-500/70'}`}>
                            Place your finger on the sensor
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`relative w-8 h-8 flex items-center justify-center rounded-full
                          ${dark ? 'bg-blue-500/15' : 'bg-blue-100'}
                          group-hover:scale-110 transition-transform`}>
                          <LuFingerprint className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold leading-tight">Sign in with Biometrics</span>
                          <span className={`text-xs font-normal ${dark ? 'text-blue-400/70' : 'text-blue-500/70'}`}>
                            Fingerprint · Face ID · Windows Hello
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                </>
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
