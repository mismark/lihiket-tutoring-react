import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects }  from '../../api/subject.api';
import { getAllUsers, getPendingUsers } from '../../api/user.api';
import StatCard from '../../components/shared/StatCard';
import {
  FiUsers, FiBook, FiSettings, FiActivity,
  FiChevronRight, FiCheckCircle, FiClock,
  FiShield, FiBarChart2, FiAlertCircle,
} from 'react-icons/fi';

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-3 w-28 bg-slate-100 dark:bg-slate-700/60 rounded" />
      </div>
    </div>
  );
}

// ── Quick action card ─────────────────────────────────────────────────────────
const ACTION_COLORS = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',       icon: 'text-blue-600 dark:text-blue-400'    },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-500/10',   icon: 'text-purple-600 dark:text-purple-400'  },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',     icon: 'text-amber-600 dark:text-amber-400'    },
};

function QuickAction({ icon: Icon, title, description, to, color = 'blue', badge }) {
  const c = ACTION_COLORS[color] || ACTION_COLORS.blue;
  return (
    <Link to={to}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 hover:-translate-y-px">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
          {badge > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <FiChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-600" />
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [stats,   setStats]   = useState(null);  // null = loading
  const [pending, setPending] = useState(0);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [subRes, usersRes, pendingRes] = await Promise.allSettled([
          getAllSubjects(),
          getAllUsers(),
          getPendingUsers(),
        ]);

        if (cancelled) return;

        const subjects = subRes.status === 'fulfilled' ? (subRes.value?.data || []) : [];
        const users    = usersRes.status === 'fulfilled' ? (usersRes.value?.data || []) : [];
        const pend     = pendingRes.status === 'fulfilled' ? (pendingRes.value?.data || []) : [];

        const teachers = users.filter(u => u.role === 'teacher' && u.isActive);
        const students = users.filter(u => u.role === 'student' && u.isActive);

        setStats({
          subjects:        subjects.length,
          activeSubjects:  subjects.filter(s => s.isActive).length,
          teachers:        teachers.length,
          students:        students.length,
          totalUsers:      users.length,
        });
        setPending(pend.length);
      } catch {
        if (!cancelled) setError('Could not load dashboard data');
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const loading = stats === null && !error;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <FiShield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 ml-13 pl-1">
              Welcome back,{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {user?.firstName} {user?.lastName}
              </span>
            </p>
          </div>
          {pending > 0 && (
            <Link to="/users"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
              <FiAlertCircle className="w-4 h-4" />
              {pending} pending approval{pending !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stats grid ── */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard icon={FiBook}     label="Total Subjects"   value={stats?.subjects  ?? 0} color="blue"    />
                <StatCard icon={FiCheckCircle} label="Active Subjects" value={stats?.activeSubjects ?? 0} color="emerald" />
                <StatCard icon={FiUsers}    label="Active Teachers"  value={stats?.teachers  ?? 0} color="purple"  />
                <StatCard icon={FiUsers}    label="Active Students"  value={stats?.students  ?? 0} color="amber"   />
              </>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction
              icon={FiBook}     title="Manage Subjects" color="blue"
              description="Create, edit, and assign subjects to teachers"
              to="/subjects"
            />
            <QuickAction
              icon={FiUsers}    title="Manage Users"    color="emerald"
              description="View teachers, students, parents, and approvals"
              to="/users"
              badge={pending}
            />
            <QuickAction
              icon={FiActivity} title="Manage Courses"  color="purple"
              description="Review courses created across all subjects"
              to="/subjects"
            />
            <QuickAction
              icon={FiBarChart2} title="Reports"        color="amber"
              description="View platform activity and statistics"
              to="/users"
            />
          </div>
        </div>

        {/* ── Secondary stats row ── */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Users</p>
              <div className="space-y-2">
                {[
                  { label: 'Total users',   value: stats.totalUsers, color: 'text-slate-700 dark:text-white' },
                  { label: 'Teachers',      value: stats.teachers,   color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Students',      value: stats.students,   color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Pending',       value: pending,          color: 'text-amber-600 dark:text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Subjects</p>
              <div className="space-y-2">
                {[
                  { label: 'Total',   value: stats.subjects,       color: 'text-slate-700 dark:text-white' },
                  { label: 'Active',  value: stats.activeSubjects, color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Inactive',value: stats.subjects - stats.activeSubjects, color: 'text-red-500 dark:text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Approvals</p>
              {pending > 0 ? (
                <>
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1">{pending}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    User{pending !== 1 ? 's' : ''} waiting for approval
                  </p>
                  <Link to="/users"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    Review now
                  </Link>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-2 gap-2 text-center">
                  <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">All caught up</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">No pending approvals</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
