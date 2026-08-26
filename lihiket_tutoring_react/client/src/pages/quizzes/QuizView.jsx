import { FiX, FiClock, FiAward, FiBook, FiPlay, FiEdit2, FiRefreshCw,
         FiCheckCircle, FiUser } from 'react-icons/fi';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function QuizView({ quiz, canManage, onClose, onEdit, onTake, theme }) {
  const dark = theme === 'dark';
  if (!quiz) return null;
  const r = quiz.myResult;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="min-w-0">
            <h2 className={`text-base font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[quiz.status]}`}>{quiz.status}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiClock, label: 'Duration',   value: `${quiz.duration} min`  },
              { icon: FiAward, label: 'Total Marks', value: quiz.totalMarks         },
              { icon: FiAward, label: 'Pass Mark',   value: quiz.passMark           },
              { icon: FiBook,  label: 'Questions',   value: quiz.questionCount || quiz.questions?.length || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <Icon className="w-3 h-3" /> {label}
                </div>
                <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {quiz.allowRetake && <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400`}><FiRefreshCw className="w-3 h-3" /> Retakes allowed</span>}
            {quiz.showAnswers && <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400`}><FiCheckCircle className="w-3 h-3" /> Answers shown</span>}
          </div>

          {quiz.subject && (
            <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              <FiBook className="w-4 h-4 text-blue-500" /> {quiz.subject.name} · {quiz.subject.gradeLevel}
            </div>
          )}

          {quiz.description && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Description</p>
              <p className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{quiz.description}</p>
            </div>
          )}

          {quiz.createdBy && (
            <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiUser className="w-3.5 h-3.5" /> Created by {quiz.createdBy.firstName} {quiz.createdBy.lastName}
            </div>
          )}

          {r && (
            <div className={`p-4 rounded-xl border ${r.passed ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-amber-400/40 bg-amber-50 dark:bg-amber-500/10'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>My Best Result</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{r.passed ? '✓ Passed' : 'Not passed'} · Attempt {r.attempt}</span>
                <span className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>{r.score} / {r.totalMarks}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex-shrink-0 flex gap-3 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          {!canManage && quiz.status === 'published' && (quiz.allowRetake || !r) && (
            <button onClick={onTake} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
              {r ? <><FiRefreshCw className="w-4 h-4" /> Retake</> : <><FiPlay className="w-4 h-4" /> Start Quiz</>}
            </button>
          )}
          {canManage && (
            <button onClick={onEdit} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <FiEdit2 className="w-4 h-4" /> Edit
            </button>
          )}
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Close</button>
        </div>
      </div>
    </div>
  );
}
