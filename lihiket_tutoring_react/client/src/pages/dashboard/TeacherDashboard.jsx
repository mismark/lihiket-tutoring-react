import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import StatCard from '../../components/shared/StatCard';
import {
  FiBook, FiUsers, FiClock, FiAward,
  FiMail, FiPhone, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiGrid, FiChevronRight,
} from 'react-icons/fi';
// ── subject card ───────────────────────────────────────────────────────────────
function SubjectCard({ subject }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base leading-tight text-slate-900 dark:text-white">
            {subject.name}
          </h3>
          <p className="text-xs font-mono mt-1 text-blue-600 dark:text-blue-400">
            {subject.code}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
          subject.isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {subject.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      {subject.description && (
        <p className="text-sm mb-3 line-clamp-2 text-slate-500 dark:text-slate-400">
          {subject.description}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {subject.gradeLevel && (
          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {subject.gradeLevel}
          </span>
        )}
        {subject.category && (
          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
            {subject.category}
          </span>
        )}
      </div>
    </div>
  );
}

// ── quick action card ──────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, title, description, to, color }) {
  const pal = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20',
    purple:  'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20',
  };
  return (
    <Link to={to}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${pal[color] || pal.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs mt-0.5 truncate text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <FiChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-600" />
    </Link>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

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
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
            Welcome back,{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {user?.firstName} {user?.lastName}
            </span>
          </p>
        </div>

        {/* ── Profile card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-sm flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                  Teacher
                </span>
                {user?.isVerified !== false && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {user?.specializedSubject && (
                <p className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                  Specialized in{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {user.specializedSubject}
                  </span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user?.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-blue-500 truncate">{user.email}</a>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${user.phone}`} className="hover:text-blue-500">{user.phone}</a>
                  </div>
                )}
                {user?.experience != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiAward className="w-4 h-4 flex-shrink-0" />
                    <span>{user.experience} year{user.experience !== 1 ? 's' : ''} experience</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <FiCalendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>

              {user?.bio && (
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiBook}  label="Assigned Subjects" value={loading ? '…' : subjects.length}       color="blue"    />
          <StatCard icon={FiGrid}  label="Active Subjects"   value={loading ? '…' : activeSubjects.length} color="emerald" />
          <StatCard icon={FiAward} label="Years Experience"  value={user?.experience ?? 0}                  color="purple"  />
          <StatCard icon={FiUsers} label="Students"          value="—"                                      color="amber"   />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction icon={FiBook}     title="My Subjects"     description="View all your assigned subjects"    to="/my-subjects"          color="blue"    />
            <QuickAction icon={FiUsers}    title="My Students"     description="View students in your classes"      to="/subjects"             color="emerald" />
            <QuickAction icon={FiClock}    title="Live Classes"    description="Start or schedule a live class"     to="/live-classes"         color="purple"  />
            <QuickAction icon={FiAward}    title="Assignments"     description="Manage student assignments"         to="/assignments"           color="amber"   />
            <QuickAction icon={FiBook}     title="Question Bank"   description="Create questions for quizzes/exams" to="/subjects/question-bank" color="blue"  />
            <QuickAction icon={FiCalendar} title="Documents"       description="Upload and manage documents"        to="/documents"            color="emerald" />
          </div>
        </div>

        {/* ── Assigned Subjects ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Assigned Subjects
            </h2>
            <Link to="/my-subjects"
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
              View all <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse space-y-3">
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-700/60 rounded" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/60 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <FiAlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No subjects assigned yet</p>
              <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                Contact your admin to get subjects assigned to you
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => <SubjectCard key={s._id} subject={s} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
