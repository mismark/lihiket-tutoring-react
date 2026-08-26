import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { useSidebar } from '../../store/sidebar/SidebarContext';
import {
  FiX, FiHome, FiGrid, FiUsers, FiBook, FiBookOpen,
  FiUser, FiCreditCard, FiList, FiDatabase, FiLogOut,
  FiSun, FiMoon, FiFileText, FiAward, FiZap, FiVideo,
  FiBell, FiSearch, FiMessageSquare,
} from 'react-icons/fi';

// ── Role-based nav config ─────────────────────────────────────────────────────

const NAV = {
  admin: [
    { section: 'Main' },
    { label: 'Dashboard',       to: '/dashboard',              icon: FiGrid      },
    { label: 'Home',            to: '/',                       icon: FiHome      },
    { section: 'Management' },
    { label: 'Users',           to: '/users',                  icon: FiUsers     },
    { label: 'Subjects',        to: '/subjects',               icon: FiBook      },
    { label: 'Documents',       to: '/documents',              icon: FiFileText  },
    { label: 'Assignments',     to: '/assignments',            icon: FiList      },
    { label: 'Quizzes',         to: '/quizzes',                icon: FiZap       },
    { label: 'Exams',           to: '/exams',                  icon: FiAward     },
    { label: 'Live Classes',    to: '/live-classes',           icon: FiVideo     },
    { section: 'Account' },
    { label: 'Search',          to: '/search',                 icon: FiSearch    },
    { label: 'Notifications',   to: '/notifications',          icon: FiBell      },
    { label: 'Messages',        to: '/chats',                  icon: FiMessageSquare },
    { label: 'My Profile',      to: '/profile',                icon: FiUser      },
  ],
  teacher: [
    { section: 'Main' },
    { label: 'Dashboard',       to: '/dashboard',              icon: FiGrid      },
    { label: 'Home',            to: '/',                       icon: FiHome      },
    { section: 'Teaching' },
    { label: 'My Subjects',     to: '/my-subjects',            icon: FiBook      },
    { label: 'Browse Subjects', to: '/subjects',               icon: FiBookOpen  },
    { label: 'Documents',       to: '/documents',              icon: FiFileText  },
    { label: 'Question Bank',   to: '/subjects/question-bank', icon: FiDatabase  },
    { label: 'Assignments',     to: '/assignments',            icon: FiList      },
    { label: 'Quizzes',         to: '/quizzes',                icon: FiZap       },
    { label: 'Exams',           to: '/exams',                  icon: FiAward     },
    { label: 'Live Classes',    to: '/live-classes',           icon: FiVideo     },
    { section: 'Account' },
    { label: 'Search',          to: '/search',                 icon: FiSearch    },
    { label: 'Notifications',   to: '/notifications',          icon: FiBell      },
    { label: 'Messages',        to: '/chats',                  icon: FiMessageSquare },
    { label: 'My Profile',      to: '/profile',                icon: FiUser      },
  ],
  student: [
    { section: 'Main' },
    { label: 'Dashboard',       to: '/dashboard',              icon: FiGrid      },
    { label: 'Home',            to: '/',                       icon: FiHome      },
    { section: 'Learning' },
    { label: 'Browse Subjects', to: '/subjects',               icon: FiBookOpen  },
    { label: 'Documents',       to: '/documents',              icon: FiFileText  },
    { label: 'Assignments',     to: '/assignments',            icon: FiList      },
    { label: 'Quizzes',         to: '/quizzes',                icon: FiZap       },
    { label: 'Exams',           to: '/exams',                  icon: FiAward     },
    { label: 'Live Classes',    to: '/live-classes',           icon: FiVideo     },
    { section: 'Payments' },
    { label: 'Payment History', to: '/payment/history',        icon: FiCreditCard},
    { section: 'Account' },
    { label: 'Search',          to: '/search',                 icon: FiSearch    },
    { label: 'Notifications',   to: '/notifications',          icon: FiBell      },
    { label: 'Messages',        to: '/chats',                  icon: FiMessageSquare },
    { label: 'My Profile',      to: '/profile',                icon: FiUser      },
  ],
  parent: [
    { section: 'Main' },
    { label: 'Dashboard',       to: '/dashboard',              icon: FiGrid      },
    { label: 'Home',            to: '/',                       icon: FiHome      },
    { label: 'Documents',       to: '/documents',              icon: FiFileText  },
    { section: 'Account' },
    { label: 'Search',          to: '/search',                 icon: FiSearch    },
    { label: 'Notifications',   to: '/notifications',          icon: FiBell      },
    { label: 'Messages',        to: '/chats',                  icon: FiMessageSquare },
    { label: 'My Profile',      to: '/profile',                icon: FiUser      },
  ],
};

const GRADIENT = {
  admin:   'from-amber-500 to-orange-600',
  teacher: 'from-blue-500 to-indigo-600',
  student: 'from-emerald-500 to-teal-600',
  parent:  'from-purple-500 to-violet-600',
};

// ── Shared inner panel ────────────────────────────────────────────────────────

function SidebarPanel({ onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const dark = theme === 'dark';

  const role  = user?.role || 'student';
  const items = NAV[role] || NAV.student;
  const grad  = GRADIENT[role] || GRADIENT.student;

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => { logout(); onClose?.(); };

  return (
    <div className={`flex flex-col h-full w-64 ${
      dark ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-200'
    }`}>

      {/* ── Logo header ── */}
      <div className={`flex items-center justify-between px-4 py-4 border-b flex-shrink-0 ${
        dark ? 'border-slate-800' : 'border-gray-100'
      }`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
            <FiBookOpen className="w-4 h-4" />
          </div>
          <span className={`text-base font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
            Lihiket<span className="text-blue-600">.</span>
          </span>
        </Link>
        {/* Close button — visible on mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition ${
              dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── User profile strip ── */}
      {user && (
        <Link
          to="/profile"
          onClick={() => onClose?.()}
          className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 transition ${
            dark ? 'border-slate-800 hover:bg-slate-800' : 'border-gray-100 hover:bg-gray-50'
          }`}
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow`}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {user.firstName} {user.lastName}
            </p>
            <p className={`text-xs capitalize ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {role}
            </p>
          </div>
        </Link>
      )}

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <p key={idx} className={`px-3 pt-4 pb-1 text-xs font-bold uppercase tracking-widest first:pt-1 ${
                dark ? 'text-slate-500' : 'text-gray-400'
              }`}>
                {item.section}
              </p>
            );
          }

          const Icon   = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? dark
                    ? 'bg-blue-500/20 text-blue-400 font-semibold'
                    : 'bg-blue-50 text-blue-700 font-semibold'
                  : dark
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                active
                  ? dark ? 'text-blue-400' : 'text-blue-600'
                  : dark ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className={`px-2 py-3 border-t space-y-0.5 flex-shrink-0 ${
        dark ? 'border-slate-800' : 'border-gray-100'
      }`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            dark
              ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {dark
            ? <><FiSun  className="w-4 h-4 text-amber-400" /><span>Light Mode</span></>
            : <><FiMoon className="w-4 h-4 text-slate-500" /><span>Dark Mode</span></>
          }
        </button>

        {user && (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              dark
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main export: handles both desktop persistent + mobile overlay ─────────────

export default function Sidebar() {
  const { open, mobileOpen, closeMobile } = useSidebar();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  // Close mobile drawer on route change
  useEffect(() => { closeMobile(); }, [location.pathname, closeMobile]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeMobile(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeMobile]);

  // Don't render at all when not logged in
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── DESKTOP: persistent fixed sidebar ── */}
      <div className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-30 shadow-xl transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarPanel onClose={null} />
      </div>

      {/* ── MOBILE: backdrop ── */}
      <div
        onClick={closeMobile}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── MOBILE: slide-in drawer ── */}
      <div className={`lg:hidden fixed top-0 left-0 h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarPanel onClose={closeMobile} />
      </div>
    </>
  );
}
