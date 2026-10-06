import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth }    from '../../store/auth/AuthContext';
import { useTheme }   from '../../store/theme/ThemeContext';
import { useSidebar } from '../../store/sidebar/SidebarContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import logo from '../../assets/logo.jpg';
import {
  FiMenu, FiLogOut, FiBook, FiSun, FiMoon,
  FiSearch, FiChevronsLeft, FiChevronsRight, FiUser,
  FiDownload,
} from 'react-icons/fi';
import NotificationBell from '../../pages/notifications/NotificationBell';
import ChatBell         from '../../pages/chats/ChatBell';
import HeaderSearch     from './HeaderSearch';

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Force Ethiopia / Addis Ababa timezone (EAT = UTC+3)
  const formatted = time.toLocaleTimeString('en-US', {
    timeZone:    'Africa/Addis_Ababa',
    hour:        '2-digit',
    minute:      '2-digit',
    hour12:      true,
  });
  // formatted is e.g. "10:22 AM" — split at space
  const [hhmm, ampm] = formatted.split(' ');

  return (
    <div className="hidden sm:flex items-baseline gap-0.5 select-none"
      style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span className="text-sm font-extrabold text-white tracking-tight">
        {hhmm}
      </span>
      <span className="text-xs font-bold ml-0.5"
        style={{ color: '#34d399' }}>
        {ampm}
      </span>
    </div>
  );
}

const AUTH_PAGES = [
  '/login', '/register', '/forgot-password',
  '/verify-otp', '/set-new-password', '/pending-approval',
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme }            = useTheme();
  const { open, toggle }                  = useSidebar();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const location                          = useLocation();
  const dark                              = theme === 'dark';
  const [searchOpen, setSearchOpen]       = useState(false);

  // Don't render on auth pages
  if (AUTH_PAGES.includes(location.pathname)) return null;

  const isActive = (path) => location.pathname === path;

  // Consistent icon button class
  const iconBtn = `p-2 rounded-xl transition-colors cursor-pointer
    text-slate-400 hover:text-white
    hover:bg-white/[0.07]
    focus-visible:ring-2 focus-visible:ring-indigo-500`;

  return (
    <header className="sticky top-0 z-30 transition-colors duration-200"
      style={{ background: 'rgba(2,8,23,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 h-14">

          {/* ── Sidebar toggle ── */}
          {isAuthenticated && (
            <button
              onClick={toggle}
              aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
              className={iconBtn}
            >
              <span className="hidden lg:block">
                {open
                  ? <FiChevronsLeft  className="w-5 h-5" />
                  : <FiChevronsRight className="w-5 h-5" />
                }
              </span>
              <span className="lg:hidden">
                <FiMenu className="w-5 h-5" />
              </span>
            </button>
          )}

          {/* ── Logo ── */}
          {!searchOpen && (
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0 ml-1">
              <img src={logo} alt="Lihiket" className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <span className="hidden sm:block text-lg font-extrabold text-white">
                Lihiket<span style={{ color: '#34d399' }}>.</span>
              </span>
            </Link>
          )}

          {/* ── Inline search ── */}
          {searchOpen && isAuthenticated ? (
            <div className="flex-1">
              <HeaderSearch onClose={() => setSearchOpen(false)} />
            </div>
          ) : (
            <>
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
                {isAuthenticated ? (
                  <>
                    {[
                      { to: '/dashboard', label: 'Dashboard' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          isActive(to)
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`}>
                        {label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { to: '/',           label: 'Home'     },
                      { href: '#features', label: 'Features' },
                      { href: '#about',    label: 'About'    },
                    ].map(({ to, href, label }) => (
                      to
                        ? <Link key={label} to={to} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive(to) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>{label}</Link>
                        : <a key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">{label}</a>
                    ))}
                  </>
                )}
              </nav>

              {/* Right controls */}
              <div className="flex items-center gap-1.5 ml-auto">

                {/* Live clock */}
                <LiveClock />

                {/* Divider */}
                <div className="hidden sm:block w-px h-5 mx-1 bg-white/10" />

                {/* ── Install App button ── */}
                {canInstall && !isInstalled && (
                  <button
                    onClick={install}
                    title="Install Lihiket App"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 14px rgba(16,185,129,0.3)' }}
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    Install App
                  </button>
                )}
                {/* Icon-only on mobile */}
                {canInstall && !isInstalled && (
                  <button
                    onClick={install}
                    title="Install Lihiket App"
                    className="sm:hidden p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    aria-label="Install app"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                )}

                {/* Theme toggle */}
                <button onClick={toggleTheme} className={iconBtn}
                  title={dark ? 'Light mode' : 'Dark mode'}>
                  {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

                {/* Search — authenticated only */}
                {isAuthenticated && (
                  <button onClick={() => setSearchOpen(true)} className={iconBtn} aria-label="Search">
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}

                {/* Notification + Chat bells */}
                {isAuthenticated && (
                  <>
                    <NotificationBell theme={theme} />
                    <ChatBell theme={theme} />
                  </>
                )}

                {isAuthenticated ? (
                  <>
                    {/* Avatar link */}
                    <Link to="/profile" title="My profile"
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                        isActive('/profile')
                          ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'hover:bg-white/[0.06]'
                      }`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="hidden sm:block text-left leading-tight">
                        <p className="text-xs font-semibold text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                      </div>
                    </Link>

                    <button onClick={() => logout()} title="Logout"
                      className={`${iconBtn} !text-red-400 hover:!bg-red-500/10 hidden sm:flex`}>
                      <FiLogOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => logout()} title="Logout"
                      className={`${iconBtn} !text-red-400 hover:!bg-red-500/10 sm:hidden`}>
                      <FiLogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login"
                      className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.07] transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register"
                      className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
