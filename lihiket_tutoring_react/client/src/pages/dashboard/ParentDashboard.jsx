import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getMyChildren } from '../../api/user.api';
import toast from 'react-hot-toast';
import {
  FiUser, FiUsers, FiBook, FiCheckCircle, FiMail,
  FiPhone, FiCalendar, FiLogOut, FiChevronDown,
  FiChevronRight, FiDollarSign, FiMapPin,
  FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi';

// ── helpers ────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, theme }) {
  const dark = theme === 'dark';
  const p = {
    blue:    { ring: dark ? 'bg-blue-500/10'    : 'bg-blue-50',    ico: 'text-blue-500',    val: dark ? 'text-blue-400'    : 'text-blue-600'    },
    emerald: { ring: dark ? 'bg-emerald-500/10' : 'bg-emerald-50', ico: 'text-emerald-500', val: dark ? 'text-emerald-400' : 'text-emerald-600' },
    purple:  { ring: dark ? 'bg-purple-500/10'  : 'bg-purple-50',  ico: 'text-purple-500',  val: dark ? 'text-purple-400'  : 'text-purple-600'  },
    amber:   { ring: dark ? 'bg-amber-500/10'   : 'bg-amber-50',   ico: 'text-amber-500',   val: dark ? 'text-amber-400'   : 'text-amber-600'   },
  }[color] || {};
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.ring}`}>
        <Icon className={`w-6 h-6 ${p.ico}`} />
      </div>
      <div>
        <p className={`text-2xl font-extrabold ${p.val}`}>{value}</p>
        <p className={`text-xs font-medium mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
      </div>
    </div>
  );
}

// ── enrollment badge ───────────────────────────────────────────────────────────
function EnrollmentBadge({ enrollment, theme }) {
  const dark   = theme === 'dark';
  const s      = enrollment.subject;
  const isFree = !s?.price || s.price === 0;
  if (!s) return null;
  return (
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
          <FiBook className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{s.name}</p>
          <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            {s.gradeLevel} · {s.category}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          isFree
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
        }`}>
          {isFree ? 'Free' : `ETB ${Number(s.price).toLocaleString()}`}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
          <FiCheckCircle className="w-3 h-3" /> Active
        </span>
      </div>
    </div>
  );
}

// ── child card ─────────────────────────────────────────────────────────────────
function ChildCard({ child, theme }) {
  const dark = theme === 'dark';
  const [open, setOpen] = useState(true);

  const joinedDate = child.createdAt
    ? new Date(child.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

      {/* Child header — clickable to expand */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-4 p-5 text-left transition ${dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
          {child.firstName?.[0]}{child.lastName?.[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>
              {child.firstName} {child.lastName}
            </h3>
            {child.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FiCheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {child.gradeLevel && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                {child.gradeLevel}
              </span>
            )}
            {!child.isActive && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                Inactive
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            {child.email} · {child.enrollmentCount} subject{child.enrollmentCount !== 1 ? 's' : ''} enrolled
          </p>
        </div>

        {open
          ? <FiChevronDown  className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
          : <FiChevronRight className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
        }
      </button>

      {/* Expanded details */}
      {open && (
        <div className={`border-t px-5 py-4 space-y-5 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {child.email && (
              <a href={`mailto:${child.email}`}
                className={`flex items-center gap-2 text-sm transition hover:text-blue-500 ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                <FiMail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{child.email}</span>
              </a>
            )}
            {child.phone && (
              <a href={`tel:${child.phone}`}
                className={`flex items-center gap-2 text-sm transition hover:text-emerald-500 ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                {child.phone}
              </a>
            )}
            {child.username && (
              <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                <FiUser className="w-4 h-4 flex-shrink-0" />
                @{child.username}
              </div>
            )}
            <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
              <FiCalendar className="w-4 h-4 flex-shrink-0" />
              Joined {joinedDate}
            </div>
          </div>

          {/* Enrolled subjects */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Enrolled Subjects ({child.enrollments?.length || 0})
            </p>
            {child.enrollments?.length === 0 ? (
              <div className={`rounded-xl p-4 text-center ${dark ? 'bg-slate-700/40' : 'bg-gray-50'}`}>
                <FiBook className={`w-8 h-8 mx-auto mb-2 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Not enrolled in any subjects yet</p>
              </div>
            ) : (
              <div className={`rounded-xl border px-4 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
                {child.enrollments.map(e => (
                  <EnrollmentBadge key={e._id} enrollment={e} theme={theme} />
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          {child.bio && (
            <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>{child.bio}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const { theme }        = useTheme();
  const dark             = theme === 'dark';

  const [children,  setChildren]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChildren = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await getMyChildren();
      setChildren(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load children data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadChildren(); }, []);

  const totalEnrollments = children.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const verifiedChildren = children.filter(c => c.isVerified).length;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              👨‍👩‍👧‍👦 Parent Dashboard
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Welcome back,{' '}
              <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
                {user?.firstName} {user?.lastName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadChildren(true)}
              disabled={refreshing}
              title="Refresh"
              className={`p-2 rounded-xl border transition ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* ── Profile card ── */}
        <div className={`rounded-2xl border p-6 shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  Parent
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <FiCheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {user?.email && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-blue-500 truncate">{user.email}</a>
                  </div>
                )}
                {user?.phone && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${user.phone}`} className="hover:text-emerald-500">{user.phone}</a>
                  </div>
                )}
                {user?.country && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiMapPin className="w-4 h-4 flex-shrink-0" />
                    {user.country}
                  </div>
                )}
                <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <FiCalendar className="w-4 h-4 flex-shrink-0" />
                  Joined {joinedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiUsers}       label="My Children"          value={loading ? '…' : children.length}     color="purple"  theme={theme} />
          <StatCard icon={FiCheckCircle} label="Verified Children"    value={loading ? '…' : verifiedChildren}   color="emerald" theme={theme} />
          <StatCard icon={FiBook}        label="Total Enrollments"    value={loading ? '…' : totalEnrollments}   color="blue"    theme={theme} />
          <StatCard icon={FiDollarSign}  label="Active Subjects"      value={loading ? '…' : totalEnrollments}   color="amber"   theme={theme} />
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/profile"
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-gray-200 hover:border-blue-300'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>My Profile</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>View and edit your account</p>
            </div>
          </Link>
          <button
            onClick={() => loadChildren(true)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md text-left ${dark ? 'bg-slate-800 border-slate-700 hover:border-purple-500/40' : 'bg-white border-gray-200 hover:border-purple-300'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Refresh Data</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Update children & enrollment info</p>
            </div>
          </button>
        </div>

        {/* ── Children section ── */}
        <div>
          <h2 className={`text-base font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            👶 My Children
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading children data…</p>
            </div>

          ) : children.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No children linked yet</p>
              <p className={`text-sm mt-2 max-w-sm mx-auto ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
                Your children's accounts will appear here once they register and link their parent email to your account.
                Make sure your children use <strong>{user?.email}</strong> as their parent email during registration.
              </p>
            </div>

          ) : (
            <div className="space-y-4">
              {children.map(child => (
                <ChildCard key={child._id} child={child} theme={theme} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
