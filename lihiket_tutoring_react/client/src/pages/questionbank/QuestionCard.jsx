import { FiEdit2, FiTrash2, FiEye, FiAward, FiTag, FiBook } from 'react-icons/fi';

const TYPE_LABELS = {
  multiple_choice: 'MCQ',
  true_false:      'True / False',
  short_answer:    'Short Answer',
  essay:           'Essay',
};

const DIFF_COLORS = {
  easy:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  hard:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function QuestionCard({ question, onView, onEdit, onDelete, theme }) {
  const dark = theme === 'dark';
  const q    = question;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
           : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* ── Header badges ── */}
      <div className="flex flex-wrap gap-2">
        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${DIFF_COLORS[q.difficulty]}`}>
          {q.difficulty}
        </span>
        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
          dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {TYPE_LABELS[q.type] || q.type}
        </span>
        {q.gradeLevel && (
          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {q.gradeLevel}
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ml-auto ${
          dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
        }`}>
          {q.marks} pt{q.marks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Question text ── */}
      <p className={`text-sm font-semibold leading-snug line-clamp-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
        {q.text}
      </p>

      {/* ── MCQ options preview ── */}
      {q.type === 'multiple_choice' && q.options?.length > 0 && (
        <div className="space-y-1">
          {q.options.map(opt => (
            <div key={opt.label} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 ${
              opt.label === q.correctAnswer
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold'
                : dark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                opt.label === q.correctAnswer
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : dark ? 'border-slate-600' : 'border-gray-300'
              }`}>
                {opt.label}
              </span>
              {opt.text}
            </div>
          ))}
        </div>
      )}

      {/* ── True/False answer ── */}
      {q.type === 'true_false' && (
        <p className={`text-xs font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          Answer: {q.correctAnswer}
        </p>
      )}

      {/* ── Subject + tags ── */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-slate-700">
        {q.subject && (
          <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            <FiBook className="w-3 h-3" /> {q.subject.name}
          </span>
        )}
        {q.tags?.slice(0, 3).map(tag => (
          <span key={tag} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
          }`}>
            <FiTag className="w-2.5 h-2.5" /> {tag}
          </span>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
        <button onClick={() => onView(q)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        <button onClick={() => onEdit(q)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>
          <FiEdit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(q)}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
