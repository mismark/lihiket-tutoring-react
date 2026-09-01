import { FiEdit2, FiTrash2, FiUsers, FiEye, FiDollarSign, FiBookOpen, FiUserCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SubjectCard({
  subject, onEdit, onAssign, onDelete, onView,
  onViewStudents, onCreateCourse, theme,
}) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;
  const slug   = subject.slug || subject._id;

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
           : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* ── Green banner with title, code & initials avatar ── */}
      <div className="relative h-28 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center p-4 gap-3">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* Initials avatar */}
        <div className="relative w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-extrabold text-base tracking-tight leading-none">
            {(subject.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Title + code */}
        <div className="relative flex-1 min-w-0">
          <h3 className="text-white font-extrabold text-base leading-tight truncate drop-shadow-sm">
            {subject.name}
          </h3>
          <p className="text-white/80 text-xs font-mono mt-0.5 font-semibold">{subject.code}</p>
        </div>

        {/* Badges top-right */}
        <div className="relative flex flex-col items-end gap-1 flex-shrink-0">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
            {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            subject.isActive ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
          }`}>
            {subject.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold text-base leading-tight mb-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {subject.name}
        </h3>
        <p className={`text-xs font-mono mb-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
          {subject.code}
        </p>

        {subject.description && (
          <p className={`text-xs mb-3 line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            {subject.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {subject.gradeLevel && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
              {subject.gradeLevel}
            </span>
          )}
          {subject.category && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
              {subject.category}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className={`flex items-center justify-between text-xs pb-3 mb-3 border-b ${
          dark ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'
        }`}>
          <span className="flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5" />
            {subject.assignedTeachers?.length || 0} teacher{subject.assignedTeachers?.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <FiUserCheck className="w-3.5 h-3.5" />
            {subject.enrolledCount ?? 0} enrolled
          </span>
        </div>

        {/* Action buttons row 1 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <button onClick={() => onView(subject)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            <FiEye className="w-3.5 h-3.5" /> View
          </button>
          <button onClick={() => onEdit(subject)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            <FiEdit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onAssign(subject)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}>
            <FiUsers className="w-3.5 h-3.5" /> Assign
          </button>
          <button onClick={() => onDelete(subject)}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons row 2 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <button onClick={() => onViewStudents(subject)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              dark ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            }`}>
            <FiUserCheck className="w-3.5 h-3.5" /> Students
          </button>
          <button onClick={() => onCreateCourse(subject)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              dark ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}>
            <FiBookOpen className="w-3.5 h-3.5" /> Courses
          </button>
        </div>

        {/* Manage courses link */}
        <Link to={`/subjects/${slug}/courses`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-600 text-white hover:bg-blue-700'
          } shadow-sm`}>
          <FiBookOpen className="w-4 h-4" /> Manage Courses
        </Link>
      </div>
    </div>
  );
}
