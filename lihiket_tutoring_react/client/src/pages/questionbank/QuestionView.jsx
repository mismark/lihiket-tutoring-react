import { FiX, FiCheckCircle, FiBook, FiTag, FiAward, FiUser, FiCalendar } from 'react-icons/fi';

const TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false:      'True / False',
  short_answer:    'Short Answer',
  essay:           'Essay',
};

const DIFF_COLORS = {
  easy:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  hard:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function QuestionView({ question, onClose, theme }) {
  const dark = theme === 'dark';
  const q    = question;
  if (!q) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Question Details</h2>
          <button onClick={onClose}
            className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${DIFF_COLORS[q.difficulty]}`}>
              {q.difficulty}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
              {TYPE_LABELS[q.type]}
            </span>
            {q.gradeLevel && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                {q.gradeLevel}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ml-auto ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              {q.marks} mark{q.marks !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Question text */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Question</p>
            <p className={`text-base font-semibold leading-relaxed ${dark ? 'text-white' : 'text-gray-900'}`}>{q.text}</p>
          </div>

          {/* MCQ Options */}
          {q.type === 'multiple_choice' && q.options?.length > 0 && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Options</p>
              <div className="space-y-2">
                {q.options.map(opt => (
                  <div key={opt.label} className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                    opt.label === q.correctAnswer
                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : dark ? 'border-slate-700 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      opt.label === q.correctAnswer
                        ? 'bg-emerald-500 text-white'
                        : dark ? 'bg-slate-600 text-slate-300' : 'bg-white text-gray-600 border border-gray-300'
                    }`}>
                      {opt.label}
                    </span>
                    <p className={`text-sm flex-1 ${
                      opt.label === q.correctAnswer
                        ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                        : dark ? 'text-slate-300' : 'text-gray-700'
                    }`}>{opt.text}</p>
                    {opt.label === q.correctAnswer && (
                      <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer (non-MCQ) */}
          {q.type !== 'multiple_choice' && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Correct Answer
              </p>
              <div className={`p-3 rounded-xl border border-emerald-400/40 ${dark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <p className={`text-sm font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {q.correctAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {q.explanation && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Explanation</p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{q.explanation}</p>
            </div>
          )}

          {/* Meta */}
          <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            {q.subject && (
              <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                <FiBook className="w-3.5 h-3.5" /> {q.subject.name}
              </div>
            )}
            {q.createdBy && (
              <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                <FiUser className="w-3.5 h-3.5" /> {q.createdBy.firstName} {q.createdBy.lastName}
              </div>
            )}
            {q.createdAt && (
              <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                <FiCalendar className="w-3.5 h-3.5" /> {new Date(q.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Tags */}
          {q.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {q.tags.map(tag => (
                <span key={tag} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                  dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  <FiTag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
