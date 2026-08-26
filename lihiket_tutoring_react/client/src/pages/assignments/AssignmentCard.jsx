import { FiClock, FiAward, FiEdit2, FiTrash2, FiEye, FiUpload,
         FiCheckCircle, FiAlertTriangle, FiBook, FiCalendar } from 'react-icons/fi';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const SUB_STYLE = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  graded:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  returned:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
};

function isOverdue(dueDate) {
  return dueDate && new Date() > new Date(dueDate);
}

export default function AssignmentCard({ assignment: a, canManage, onView, onEdit, onDelete, onSubmit, theme }) {
  const dark = theme === 'dark';
  const sub  = a.mySubmission;
  const overdue = isOverdue(a.dueDate);

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{a.title}</h3>
          </div>
          {a.subject && (
            <p className={`text-xs mt-0.5 flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiBook className="w-3 h-3" /> {a.subject.name}
            </p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLE[a.status]}`}>
          {a.status}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {a.dueDate && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${
            overdue && !sub ? 'text-red-500' : dark ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <FiCalendar className="w-3 h-3" />
            Due {new Date(a.dueDate).toLocaleDateString()}
            {overdue && !sub && ' (overdue)'}
          </span>
        )}
        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiAward className="w-3 h-3" /> {a.totalMarks} marks
        </span>
        {a.allowLate && (
          <span className={`text-xs ${dark ? 'text-amber-400' : 'text-amber-600'}`}>Late allowed</span>
        )}
      </div>

      {/* Submission status */}
      {sub && (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          sub.status === 'graded'
            ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10'
            : 'border-blue-400/40 bg-blue-50 dark:bg-blue-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <FiCheckCircle className={`w-4 h-4 ${sub.status === 'graded' ? 'text-emerald-500' : 'text-blue-500'}`} />
            <span className={`text-xs font-bold capitalize ${sub.status === 'graded' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
              {sub.late ? 'Late · ' : ''}{sub.status}
            </span>
          </div>
          {sub.marks != null && (
            <span className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              {sub.marks} / {a.totalMarks}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 pt-2 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        <button onClick={() => onView(a)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        {!canManage && a.status === 'published' && !sub && (
          <button onClick={() => onSubmit(a)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
            <FiUpload className="w-3.5 h-3.5" /> Submit
          </button>
        )}
        {canManage && (
          <>
            <button onClick={() => onEdit(a)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(a)}
              className="px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
