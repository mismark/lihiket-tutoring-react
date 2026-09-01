import { Link } from 'react-router-dom';
import { FiAtSign, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function LoginForm({ 
  form, 
  onChange, 
  showPassword, 
  onTogglePassword, 
  loading, 
  onSubmit, 
  theme 
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5">
          Email or Username
        </label>
        <div className="relative rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <FiAtSign className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={form.email}
            onChange={onChange('email')}
            required
            autoComplete="username"
            placeholder="name@email.com or username"
            className={`block w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'}`}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
            Password
          </label>
          <Link
            to="/forgot-password"
            state={{ email: form.email }}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <FiLock className="w-5 h-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange('password')}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`block w-full pl-11 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'}`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span>Sign in</span>
            <FiArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
