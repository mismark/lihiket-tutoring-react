import { FiX, FiClock, FiAward, FiBook, FiPlay, FiEdit2, FiCheckCircle, FiUser, FiCalendar } from 'react-icons/fi';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

function fmt(dt) { return dt ? new Date(dt).toLocaleString() : '—'; }

export default function ExamView({ exam, canManage, onClose, onEdit, onTake, theme }) {
  const dark = theme === 'dark';
  if (!exam) return null;
  const r = exam.myResult;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="min-w-0">
            <h2 className={`text-base font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[exam.status]}`}>{exam.status}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiClock,   label: 'Duration',   value: `${exam.duration} min`  },
              { icon: FiAward,   label: 'Total Marks', value: exam.totalMarks         },
              { icon: FiAward,   label: 'Pass Mark',   value: exam.passMark           },
              { icon: FiBook,    label: 'Questions',   value: exam.questionCount || exam.questions?.length || 0 },
              { icon: FiCalendar,label: 'Start',       value: fmt(exam.startTime)     },
              { icon: FiCalendar,label: 'End',         value: fmt(exam.endTime)       },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <Icon className="w-3 h-3" /> {label}
                </div>
                <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Subject */}
          {exam.subject && (
            <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              <FiBook className="w-4 h-4 text-blue-500" /> {exam.subject.name} · {exam.subject.gradeLevel}
            </div>
          )}

          {/* Description */}
          {exam.description && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Description</p>
              <p className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{exam.description}</p>
            </div>
          )}

          {/* Instructions */}
          {exam.instructions && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Instructions</p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{exam.instructions}</p>
            </div>
          )}

          {/* Created by */}
          {exam.createdBy && (
            <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiUser className="w-3.5 h-3.5" /> Created by {exam.createdBy.firstName} {exam.createdBy.lastName}
            </div>
          )}

          {/* My result */}
          {r && (
            <div className={`p-4 rounded-xl border ${r.passed ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-red-400/40 bg-red-50 dark:bg-red-500/10'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>My Result</p>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-sm font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  <FiCheckCircle className="w-4 h-4" /> {r.passed ? 'Passed' : 'Failed'}
                </span>
                <span className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>{r.score} / {r.totalMarks}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 flex gap-3 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          {!canManage && exam.status === 'published' && !r && (
            <button onClick={onTake} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
              <FiPlay className="w-4 h-4" /> Take Exam
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
