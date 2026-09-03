import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import { getAllUsers }    from '../../api/user.api';
import StatCard from '../../components/shared/StatCard';
import {
  FiUsers, FiBook, FiActivity,
  FiChevronRight, FiCheckCircle,
  FiShield, FiBarChart2, FiAlertCircle,
} from 'react-icons/fi';

// ── Skeleton ──────────────────────────────────────────────────────────────────
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
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',       icon: 'text-blue-600 dark:text-blue-400'       },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-500/10',   icon: 'text-purple-600 dark:text-purple-400'   },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',     icon: 'text-amber-600 dark:text-amber-400'     },
};

function QuickAction({ icon: Icon, title, description, to, color = 'blue' }) {
  const c = ACTION_COLORS[color] || ACTION_COLORS.blue;
  return (
    <Link to={to}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 hover:-translate-y-px">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
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

  const [stats,  setStats]  = useState(null);
  const [error,  setError]  = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [subRes, usersRes] = await Promise.allSettled([
          getAllSubjects(),
          getAllUsers(),
        ]);
        if (cancelled) return;

        const subjects = subRes.status    === 'fulfilled' ? (subRes.value?.data    || []) : [];
        const users    = usersRes.status  === 'fulfilled' ? (usersRes.value?.data  || []) : [];

        setStats({
          subjects:       subjects.length,
          activeSubjects: subjects.filter(s => s.isActive).length,
          teachers:       users.filter(u => u.role === 'teacher').length,
          students:       users.filter(u => u.role === 'student').length,
          parents:        users.filter(u => u.role === 'parent').length,
          totalUsers:     users.length,
        });
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

        {/* Header */}
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
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard icon={FiBook}         label="Total Subjects"   value={stats?.subjects       ?? 0} color="blue"    />
                <StatCard icon={FiCheckCircle}  label="Active Subjects"  value={stats?.activeSubjects ?? 0} color="emerald" />
                <StatCard icon={FiUsers}        label="Teachers"         value={stats?.teachers       ?? 0} color="purple"  />
                <StatCard icon={FiUsers}        label="Students"         value={stats?.students       ?? 0} color="amber"   />
              </>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction icon={FiBook}     title="Manage Subjects" color="blue"
              description="Create, edit, and assign subjects to teachers" to="/subjects" />
            <QuickAction icon={FiUsers}    title="Manage Users"    color="emerald"
              description="View and manage teachers, students, and parents" to="/users" />
            <QuickAction icon={FiActivity} title="Manage Courses"  color="purple"
              description="Review courses created across all subjects" to="/subjects" />
            <QuickAction icon={FiBarChart2} title="Reports"        color="amber"
              description="View platform activity and statistics" to="/users" />
          </div>
        </div>

        {/* Secondary stats */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Users</p>
              <div className="space-y-2">
                {[
                  { label: 'Total users', value: stats.totalUsers, color: 'text-slate-700 dark:text-white' },
                  { label: 'Teachers',    value: stats.teachers,   color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Students',    value: stats.students,   color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Parents',     value: stats.parents,    color: 'text-purple-600 dark:text-purple-400' },
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
                  { label: 'Total',    value: stats.subjects,                              color: 'text-slate-700 dark:text-white' },
                  { label: 'Active',   value: stats.activeSubjects,                        color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Inactive', value: stats.subjects - stats.activeSubjects,       color: 'text-red-500 dark:text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
