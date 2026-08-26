import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { useSidebar } from '../../store/sidebar/SidebarContext';
import { FiMenu, FiLogOut, FiBook, FiSun, FiMoon, FiSearch, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import NotificationBell from '../../pages/notifications/NotificationBell';
import ChatBell         from '../../pages/chats/ChatBell';
import HeaderSearch     from './HeaderSearch';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme }            = useTheme();
  const { open, toggle }                  = useSidebar();
  const location                          = useLocation();
  const dark                              = theme === 'dark';

  const [searchOpen, setSearchOpen] = useState(false);

  const authPages = ['/login', '/register', '/forgot-password', '/verify-otp', '/set-new-password', '/pending-approval'];
  if (authPages.includes(location.pathname)) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30 transition-colors duration-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center gap-3">

          {/* ── Sidebar toggle button ── */}
          {isAuthenticated && (
            <button
              onClick={toggle}
              aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
              title={open ? 'Collapse sidebar' : 'Expand sidebar'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              {/* Desktop: show chevrons to indicate collapse/expand */}
              <span className="hidden lg:block">
                {open
                  ? <FiChevronsLeft  className="w-5 h-5" />
                  : <FiChevronsRight className="w-5 h-5" />
                }
              </span>
              {/* Mobile: always show hamburger */}
              <span className="lg:hidden">
                <FiMenu className="w-5 h-5" />
              </span>
            </button>
          )}

          {/* ── Logo — hidden while search is open on mobile ── */}
          {!searchOpen && (
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
                <FiBook className="w-4 h-4" />
              </div>
              <span className="hidden sm:block text-xl font-extrabold text-slate-900 dark:text-white">
                Lihiket<span className="text-blue-600">.</span>
              </span>
            </Link>
          )}

          {/* ── Inline search bar — expands to fill available space ── */}
          {searchOpen && isAuthenticated ? (
            <div className="flex-1">
              <HeaderSearch onClose={() => setSearchOpen(false)} />
            </div>
          ) : (
            <>
              {/* ── Desktop nav links ── */}
              <div className="hidden md:flex items-center gap-6 flex-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className={`text-sm font-semibold transition-colors ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      Dashboard
                    </Link>
                    <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      Home
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      Home
                    </Link>
                    <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
                    <a href="#about"    className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
                  </>
                )}
              </div>

              {/* ── Right controls ── */}
              <div className="flex items-center gap-2 ml-auto">

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                >
                  {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                </button>

                {/* Search icon — opens inline search bar */}
                {isAuthenticated && (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}

                {/* Notification bell */}
                <NotificationBell theme={theme} />

                {/* Chat bell with unread badge */}
                <ChatBell theme={theme} />

                {isAuthenticated ? (
                  <>
                    {/* Avatar → /profile */}
                    <Link
                      to="/profile"
                      title="My profile"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                        isActive('/profile')
                          ? 'bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/30'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                      </div>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => logout()}
                      className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login"    className="px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Sign In</Link>
                    <Link to="/register" className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Sign Up</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
