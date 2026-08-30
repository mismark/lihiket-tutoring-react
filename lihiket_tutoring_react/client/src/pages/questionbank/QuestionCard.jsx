import { FiEdit2, FiTrash2, FiEye, FiTag, FiBook, FiCheckCircle } from 'react-icons/fi';

// Deterministic gradient — same as CourseCard
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

const TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false:      'True / False',
  short_answer:    'Short Answer',
  essay:           'Essay',
};

const TYPE_SHORT = {
  multiple_choice: 'MCQ',
  true_false:      'T/F',
  short_answer:    'SA',
  essay:           'Essay',
};

const DIFF = {
  easy:   { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', bar: 'bg-emerald-500', pct: 33  },
  medium: { cls: 'bg-amber-100   text-amber-700   dark:bg-amber-500/20   dark:text-amber-400',   bar: 'bg-amber-500',   pct: 66  },
  hard:   { cls: 'bg-red-100     text-red-700     dark:bg-red-500/20     dark:text-red-400',      bar: 'bg-red-500',     pct: 100 },
};

export default function QuestionCard({ question: q, onView, onEdit, onDelete, canManage, theme }) {
  const dark = theme === 'dark';
  const grad = gradientFor(q._id);
  const diff = DIFF[q.difficulty] || DIFF.medium;

  const initials = q.text
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
           : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
    }`}>

      {/* ── Gradient banner ── */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />

        {/* Difficulty badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize backdrop-blur-sm bg-black/20 text-white`}>
          {q.difficulty}
        </span>

        {/* Marks badge */}
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-sm text-white border border-white/30">
          {q.marks} {q.marks === 1 ? 'pt' : 'pts'}
        </span>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {initials || '?'}
          </div>
          <p className="text-white/75 text-xs font-medium">
            {TYPE_SHORT[q.type] || q.type}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Question text */}
        <p className={`text-sm font-bold leading-snug line-clamp-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
          {q.text}
        </p>

        {/* MCQ options preview */}
        {q.type === 'multiple_choice' && q.options?.length > 0 && (
          <div className="space-y-1">
            {q.options.slice(0, 4).map(opt => (
              <div key={opt.label} className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 transition ${
                opt.label === q.correctAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 font-semibold'
                  : dark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border transition ${
                  opt.label === q.correctAnswer
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : dark ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'
                }`}>
                  {opt.label}
                </span>
                <span className={`truncate ${opt.label === q.correctAnswer ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                  {opt.text}
                </span>
                {opt.label === q.correctAnswer && (
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* True/False answer */}
        {q.type === 'true_false' && q.correctAnswer && (
          <div className="flex items-center gap-2 text-xs">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Answer: {q.correctAnswer}
            </span>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            {q.subject && (
              <span className={`flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiBook className="w-3 h-3" /> {q.subject.name}
              </span>
            )}
          </div>
          {q.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {q.tags.slice(0, 2).map(tag => (
                <span key={tag} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs ${
                  dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  <FiTag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar — difficulty level */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs capitalize ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Difficulty
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diff.cls}`}>
              {q.difficulty}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${diff.bar} transition-all duration-700`}
              style={{ width: `${diff.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
        <button onClick={() => onView(q)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition ${
            dark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}>
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        {canManage && (
          <>
            <button onClick={() => onEdit(q)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(q)}
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
