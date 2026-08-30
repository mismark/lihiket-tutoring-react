import { useState } from 'react';
import {
  FiClock, FiAward, FiEdit2, FiTrash2, FiEye, FiPlay,
  FiRefreshCw, FiCheckCircle, FiXCircle, FiBook,
  FiBarChart2, FiHash, FiZap,
} from 'react-icons/fi';
import QuizResults  from './QuizResults';
import QuizMyResult from './QuizMyResult';

const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];
function gradientFor(id = '') {
  const sum = (id + '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

const STATUS = {
  draft:     { label: 'Draft',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  published: { label: 'Published', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  closed:    { label: 'Closed',    cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

export default function QuizCard({ quiz, canManage, onView, onEdit, onDelete, onTake, theme }) {
  const dark  = theme === 'dark';
  const r     = quiz.myResult;
  const grad  = gradientFor(quiz._id);
  const st    = STATUS[quiz.status] || STATUS.draft;
  const pct   = r && quiz.totalMarks > 0 ? Math.round((r.score / quiz.totalMarks) * 100) : null;

  const initials = quiz.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  const [showResults,  setShowResults]  = useState(false);
  const [showMyResult, setShowMyResult] = useState(false);

  return (
    <>
      <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        quiz.status === 'published'
          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500/40'
          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
      }`}>

        {/* ── Colour banner ── */}
        <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
          <div className="absolute inset-0 bg-black/10" />
          {/* Status badge */}
          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${
            quiz.status === 'published' ? 'bg-black/20 text-white' : st.cls
          }`}>
            {st.label}
          </span>
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
              {initials}
            </div>
            <div>
              <p className="text-white/75 text-xs font-medium">
                {quiz.questionCount || 0} questions
              </p>
              <p className="text-white/50 text-xs">{quiz.duration} min</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
              {quiz.title}
            </h3>
            {quiz.subject && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <FiBook className="w-3 h-3" /> {quiz.subject.name}
              </p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <FiAward className="w-3 h-3" /> {quiz.totalMarks} marks
              </span>
              {quiz.allowRetake && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FiRefreshCw className="w-3 h-3" /> Retakes
                </span>
              )}
            </div>
          </div>

          {/* Student: result card (clickable) */}
          {!canManage && r && (
            <button onClick={() => setShowMyResult(true)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left w-full transition ${
                r.passed
                  ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15'
                  : 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:hover:bg-red-500/15'
              }`}>
              <div className="flex items-center gap-2">
                {r.passed
                  ? <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <FiXCircle     className="w-4 h-4 text-red-500 flex-shrink-0" />
                }
                <span className={`text-xs font-bold ${r.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {r.passed ? 'Passed' : 'Not passed'} · Attempt {r.attempt}
                </span>
              </div>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white flex-shrink-0">
                {r.score}/{r.totalMarks}
              </span>
            </button>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 dark:text-slate-500">Difficulty</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                {quiz.passMarkPercent ?? 50}% pass mark
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                style={{ width: `${quiz.passMarkPercent ?? 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
          <button onClick={() => onView(quiz)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                       text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
            <FiEye className="w-3.5 h-3.5" /> Details
          </button>

          {!canManage && quiz.status === 'published' && (quiz.allowRetake || !r) && (
            <button onClick={() => onTake(quiz)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold
                         text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition">
              {r ? <><FiRefreshCw className="w-3.5 h-3.5" /> Retake</> : <><FiPlay className="w-3.5 h-3.5" /> Start</>}
            </button>
          )}

          {!canManage && r && !quiz.allowRetake && (
            <button onClick={() => setShowMyResult(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                         text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition">
              <FiAward className="w-3.5 h-3.5" /> My Result
            </button>
          )}

          {canManage && (
            <>
              <button onClick={() => onEdit(quiz)}
                className="flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold
                           text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                <FiEdit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setShowResults(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold
                           text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition">
                <FiBarChart2 className="w-3.5 h-3.5" /> Results
              </button>
              <button onClick={() => onDelete(quiz)}
                className="flex items-center justify-center px-3 py-3 text-red-500
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {showResults  && <QuizResults  quiz={quiz} theme={theme} onClose={() => setShowResults(false)}  />}
      {showMyResult && <QuizMyResult quiz={quiz} theme={theme} onClose={() => setShowMyResult(false)} />}
    </>
  );
}
