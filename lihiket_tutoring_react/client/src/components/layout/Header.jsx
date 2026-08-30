import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth }    from '../../store/auth/AuthContext';
import { useTheme }   from '../../store/theme/ThemeContext';
import { useSidebar } from '../../store/sidebar/SidebarContext';
import {
  FiMenu, FiLogOut, FiBook, FiSun, FiMoon,
  FiSearch, FiChevronsLeft, FiChevronsRight, FiUser,
} from 'react-icons/fi';
import NotificationBell from '../../pages/notifications/NotificationBell';
import ChatBell         from '../../pages/chats/ChatBell';
import HeaderSearch     from './HeaderSearch';

const AUTH_PAGES = [
  '/login', '/register', '/forgot-password',
  '/verify-otp', '/set-new-password', '/pending-approval',
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme }            = useTheme();
  const { open, toggle }                  = useSidebar();
  const location                          = useLocation();
  const dark                              = theme === 'dark';
  const [searchOpen, setSearchOpen]       = useState(false);

  // Don't render on auth pages
  if (AUTH_PAGES.includes(location.pathname)) return null;

  const isActive = (path) => location.pathname === path;

  // Consistent icon button class
  const iconBtn = `p-2 rounded-xl transition-colors
    bg-slate-100 dark:bg-slate-800
    text-slate-600 dark:text-slate-300
    hover:bg-slate-200 dark:hover:bg-slate-700
    focus-visible:ring-2 focus-visible:ring-blue-500`;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
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
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <FiBook className="w-4 h-4" />
              </div>
              <span className="hidden sm:block text-lg font-extrabold text-slate-900 dark:text-white">
                Lihiket<span className="text-blue-600">.</span>
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
                      { to: '/',          label: 'Home'      },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          isActive(to)
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                        ? <Link key={label} to={to} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive(to) ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{label}</Link>
                        : <a key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{label}</a>
                    ))}
                  </>
                )}
              </nav>

              {/* Right controls */}
              <div className="flex items-center gap-1.5 ml-auto">

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
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors ${
                        isActive('/profile')
                          ? 'bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-400/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="hidden sm:block text-left leading-tight">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                      </div>
                    </Link>

                    {/* Logout — visible on sm+ in header, always visible on mobile via icon */}
                    <button onClick={() => logout()}
                      title="Logout"
                      className={`${iconBtn} text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hidden sm:flex`}>
                      <FiLogOut className="w-4 h-4" />
                    </button>
                    {/* Mobile-only logout (icon only, always shown on xs) */}
                    <button onClick={() => logout()}
                      title="Logout"
                      className={`${iconBtn} text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 sm:hidden`}>
                      <FiLogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login"
                      className="px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register"
                      className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
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
