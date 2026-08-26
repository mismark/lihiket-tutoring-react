import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import {
  FiBook, FiUsers, FiClock, FiAward, FiLogOut,
  FiMail, FiPhone, FiCalendar, FiUser,
  FiCheckCircle, FiAlertCircle, FiGrid, FiChevronRight,
} from 'react-icons/fi';

// ── stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, theme }) {
  const colors = {
    blue:    { bg: theme === 'dark' ? 'bg-blue-500/10'    : 'bg-blue-50',    icon: 'text-blue-500',    val: theme === 'dark' ? 'text-blue-400'    : 'text-blue-600'    },
    emerald: { bg: theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50', icon: 'text-emerald-500', val: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600' },
    purple:  { bg: theme === 'dark' ? 'bg-purple-500/10'  : 'bg-purple-50',  icon: 'text-purple-500',  val: theme === 'dark' ? 'text-purple-400'  : 'text-purple-600'  },
    amber:   { bg: theme === 'dark' ? 'bg-amber-500/10'   : 'bg-amber-50',   icon: 'text-amber-500',   val: theme === 'dark' ? 'text-amber-400'   : 'text-amber-600'   },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div>
        <p className={`text-2xl font-extrabold ${c.val}`}>{value}</p>
        <p className={`text-xs font-medium mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
      </div>
    </div>
  );
}

// ── subject card ───────────────────────────────────────────────────────────────
function SubjectCard({ subject, theme }) {
  const dark = theme === 'dark';
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
      dark
        ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
        : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold text-base leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {subject.name}
          </h3>
          <p className={`text-xs font-mono mt-1 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            {subject.code}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
          subject.isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {subject.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {subject.description && (
        <p className={`text-sm mb-3 line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {subject.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {subject.gradeLevel && (
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {subject.gradeLevel}
          </span>
        )}
        {subject.category && (
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
            {subject.category}
          </span>
        )}
      </div>
    </div>
  );
}

// ── quick action card ──────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, title, description, to, color, theme }) {
  const colors = {
    blue:    theme === 'dark' ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'       : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    emerald: theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    purple:  theme === 'dark' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'   : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    amber:   theme === 'dark' ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20'      : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  };
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${colors[color] || colors.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-xs mt-0.5 truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{description}</p>
      </div>
      <FiChevronRight className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
    </Link>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { theme }        = useTheme();
  const dark             = theme === 'dark';

  const [subjects, setSubjects]   = useState([]);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    getAllSubjects()
      .then(res => {
        // keep only subjects this teacher is assigned to
        const mine = (res.data || []).filter(s =>
          s.assignedTeachers?.some(
            t => t._id?.toString() === user?.id?.toString()
          )
        );
        setSubjects(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const activeSubjects = subjects.filter(s => s.isActive);
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              👨‍🏫 Teacher Dashboard
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Welcome back,{' '}
              <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
                {user?.firstName} {user?.lastName}
              </span>
            </p>
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
              dark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* ── Profile + Status ── */}
        <div className={`rounded-2xl border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 capitalize">
                  Teacher
                </span>
                {user?.isVerified !== false && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {user?.specializedSubject && (
                <p className={`text-sm font-medium mb-3 ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                  📘 Specialized in <span className="font-semibold">{user.specializedSubject}</span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user?.email && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-blue-500 truncate">{user.email}</a>
                  </div>
                )}
                {user?.phone && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${user.phone}`} className="hover:text-blue-500">{user.phone}</a>
                  </div>
                )}
                {user?.experience != null && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiAward className="w-4 h-4 flex-shrink-0" />
                    <span>{user.experience} year{user.experience !== 1 ? 's' : ''} experience</span>
                  </div>
                )}
                <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <FiCalendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>

              {user?.bio && (
                <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiBook}   label="Assigned Subjects" value={loading ? '…' : subjects.length}       color="blue"    theme={theme} />
          <StatCard icon={FiGrid}   label="Active Subjects"   value={loading ? '…' : activeSubjects.length} color="emerald" theme={theme} />
          <StatCard icon={FiAward}  label="Years Experience"  value={user?.experience ?? 0}                  color="purple"  theme={theme} />
          <StatCard icon={FiUsers}  label="Students"          value="—"                                      color="amber"   theme={theme} />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction icon={FiBook}     title="My Subjects"     description="View all your assigned subjects"  to="/my-subjects" color="blue"    theme={theme} />
            <QuickAction icon={FiUsers}    title="My Students"     description="View students in your classes"    to="/dashboard"   color="emerald" theme={theme} />
            <QuickAction icon={FiClock}    title="Schedule"        description="View upcoming classes"            to="/dashboard"   color="purple"  theme={theme} />
            <QuickAction icon={FiAward}    title="Assignments"     description="Manage student assignments"       to="/dashboard"   color="amber"   theme={theme} />
            <QuickAction icon={FiUser}     title="Profile"         description="Update your profile and details"  to="/dashboard"   color="blue"    theme={theme} />
            <QuickAction icon={FiCalendar} title="Live Classes"    description="Start or schedule a live class"   to="/dashboard"   color="emerald" theme={theme} />
          </div>
        </div>

        {/* ── Assigned Subjects ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Assigned Subjects
            </h2>
            <Link
              to="/my-subjects"
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              View all <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm mt-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading subjects…</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <FiAlertCircle className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No subjects assigned yet</p>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
                Contact your admin to get subjects assigned to you
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => <SubjectCard key={s._id} subject={s} theme={theme} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
