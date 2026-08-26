import { FiEdit2, FiTrash2, FiUsers, FiEye, FiDollarSign, FiBookOpen, FiUserCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SubjectCard({
  subject, onEdit, onAssign, onDelete, onView,
  onViewStudents, onCreateCourse, theme,
}) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;

  const btn = (onClick, icon, label, color = 'default') => {
    const colors = {
      default: dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'       : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      blue:    dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'     : 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      emerald: dark ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
      purple:  dark ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'   : 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    };
    const Icon = icon;
    return (
      <button
        onClick={() => onClick(subject)}
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${colors[color] || colors.default}`}
      >
        <Icon className="w-3.5 h-3.5" /> {label}
      </button>
    );
  };

  return (
    <div className={`${dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-300'} rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md flex flex-col`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-base leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {subject.name}
          </h3>
          <p className={`text-xs font-mono mt-1 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            {subject.code}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            subject.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {subject.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            isFree
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}>
            <FiDollarSign className="w-3 h-3" />
            {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* ── Description ── */}
      {subject.description && (
        <p className={`text-xs mb-3 line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
          {subject.description}
        </p>
      )}

      {/* ── Tags ── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* ── Teacher + enrollment counts ── */}
      <div className={`flex items-center justify-between text-xs mb-4 pb-3 border-b ${dark ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'}`}>
        <span className="flex items-center gap-1.5">
          <FiUsers className="w-3.5 h-3.5" />
          {subject.assignedTeachers?.length || 0} teacher{subject.assignedTeachers?.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <FiUserCheck className="w-3.5 h-3.5" />
          {subject.enrolledCount ?? 0} enrolled
        </span>
      </div>

      {/* ── Row 1: view / edit / assign / delete ── */}
      <div className="flex items-center gap-1.5 mb-1.5">
        {btn(onView,   FiEye,    'View',   'default')}
        {btn(onEdit,   FiEdit2,  'Edit',   'default')}
        {btn(onAssign, FiUsers,  'Assign', 'blue')}
        <button
          onClick={() => onDelete(subject)}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Row 2: students / courses ── */}
      <div className="flex items-center gap-1.5">
        {btn(onViewStudents,  FiUserCheck, 'Students', 'emerald')}
        {btn(onCreateCourse,  FiBookOpen,  'Courses',  'purple')}
      </div>

      {/* ── Row 3: manage courses ── */}
      <Link
        to={`/subjects/${subject.slug || subject._id}/courses`}
        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition w-full mt-0 ${
          dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        <FiBookOpen className="w-3.5 h-3.5" /> Manage Courses
      </Link>
    </div>
  );
}
