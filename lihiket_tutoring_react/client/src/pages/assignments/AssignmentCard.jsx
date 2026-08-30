import {
  FiFileText, FiCalendar, FiAward, FiEdit2, FiTrash2,
  FiEye, FiUpload, FiCheckCircle, FiAlertCircle, FiUser,
  FiClock, FiBarChart2,
} from 'react-icons/fi';

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];
function gradientFor(id = '') {
  const sum = (id + '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS = {
  draft:     { label: 'Draft',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  published: { label: 'Published', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  closed:    { label: 'Closed',    cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

export default function AssignmentCard({ assignment: a, canManage, onView, onEdit, onDelete, onSubmit, theme }) {
  const dark    = theme === 'dark';
  const grad    = gradientFor(a._id);
  const sub     = a.mySubmission;
  const st      = STATUS[a.status] || STATUS.draft;
  const overdue = a.dueDate && !sub && new Date() > new Date(a.dueDate);
  const initials = a.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  // Progress: submission rate for teachers, 0 or 100 for students
  const submittedCount  = canManage ? (a.submissionCount || 0) : (sub ? 1 : 0);
  const totalCount      = canManage ? (a.studentCount || 10) : 1;
  const progressPct     = Math.min(100, totalCount > 0 ? (submittedCount / totalCount) * 100 : 0);

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      a.status === 'published'
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
    }`}>

      {/* ── Colour banner ── */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${
          a.status !== 'published' ? 'bg-black/30 text-white' : st.cls
        }`}>
          {overdue ? 'Overdue' : st.label}
        </span>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {initials}
          </div>
          <p className="text-white/75 text-xs font-medium">
            {a.totalMarks} marks
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {a.title}
          </h3>
          {a.description && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {a.description}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3">
            {a.dueDate && (
              <span className={`flex items-center gap-1 ${
                overdue ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {overdue
                  ? <FiAlertCircle className="w-3 h-3" />
                  : <FiCalendar    className="w-3 h-3" />
                }
                {fmtDate(a.dueDate)}
              </span>
            )}
            {a.subject && (
              <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                <FiAward className="w-3 h-3" /> {a.totalMarks}
              </span>
            )}
          </div>
          {/* Student submission badge */}
          {!canManage && sub && (
            <span className={`flex items-center gap-1 font-semibold ${
              sub.status === 'graded'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              <FiCheckCircle className="w-3 h-3" />
              {sub.status === 'graded' ? `${sub.marks}/${a.totalMarks}` : 'Submitted'}
            </span>
          )}
          {/* Teacher submission count */}
          {canManage && a.submissionCount != null && (
            <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
              <FiBarChart2 className="w-3 h-3" /> {a.submissionCount} submitted
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {canManage ? 'Submissions' : 'Progress'}
            </span>
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
              {canManage
                ? `${submittedCount} / ${totalCount}`
                : sub ? (sub.status === 'graded' ? 'Graded' : 'Submitted') : 'Not submitted'
              }
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
        <button onClick={() => onView(a)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                     text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          <FiEye className="w-3.5 h-3.5" /> Details
        </button>
        {/* Student submit */}
        {!canManage && a.status === 'published' && !sub && (
          <button onClick={() => onSubmit(a)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold
                       text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
            <FiUpload className="w-3.5 h-3.5" /> Submit
          </button>
        )}
        {/* Resubmit */}
        {!canManage && a.allowLate && sub && a.status === 'published' && (
          <button onClick={() => onSubmit(a)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                       text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
            <FiUpload className="w-3.5 h-3.5" /> Resubmit
          </button>
        )}
        {canManage && (
          <>
            <button onClick={() => onEdit(a)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(a)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
