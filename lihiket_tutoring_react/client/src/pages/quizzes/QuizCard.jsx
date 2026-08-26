import { FiClock, FiAward, FiEdit2, FiTrash2, FiEye, FiPlay,
         FiRefreshCw, FiCheckCircle, FiBook } from 'react-icons/fi';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function QuizCard({ quiz, canManage, onView, onEdit, onDelete, onTake, theme }) {
  const dark = theme === 'dark';
  const r    = quiz.myResult;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">🧩</span>
            <h3 className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</h3>
          </div>
          {quiz.subject && (
            <p className={`text-xs mt-0.5 flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiBook className="w-3 h-3" /> {quiz.subject.name}
            </p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${STATUS_STYLE[quiz.status]}`}>
          {quiz.status}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiClock className="w-3 h-3" /> {quiz.duration} min
        </span>
        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiAward className="w-3 h-3" /> {quiz.totalMarks} marks
        </span>
        <span className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {quiz.questionCount} questions
        </span>
        {quiz.allowRetake && (
          <span className={`flex items-center gap-1 text-xs ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <FiRefreshCw className="w-3 h-3" /> Retakes allowed
          </span>
        )}
      </div>

      {/* Best result */}
      {r && (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          r.passed ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-amber-400/40 bg-amber-50 dark:bg-amber-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <FiCheckCircle className={`w-4 h-4 ${r.passed ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className={`text-xs font-bold ${r.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {r.passed ? 'Passed' : 'Attempted'} · Attempt {r.attempt}
            </span>
          </div>
          <span className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
            {r.score} / {r.totalMarks}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 pt-2 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        <button onClick={() => onView(quiz)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <FiEye className="w-3.5 h-3.5" /> Details
        </button>
        {!canManage && quiz.status === 'published' && (quiz.allowRetake || !r) && (
          <button onClick={() => onTake(quiz)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
            {r ? <><FiRefreshCw className="w-3.5 h-3.5" /> Retake</> : <><FiPlay className="w-3.5 h-3.5" /> Start</>}
          </button>
        )}
        {canManage && (
          <>
            <button onClick={() => onEdit(quiz)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(quiz)}
              className="px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
