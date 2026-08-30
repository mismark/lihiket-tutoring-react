import { useState, useEffect } from 'react';
import {
  FiClock, FiBook, FiAward, FiEdit2, FiTrash2, FiEye, FiPlay,
  FiCheckCircle, FiXCircle, FiCalendar, FiBarChart2, FiLock,
} from 'react-icons/fi';
import ExamResults  from './ExamResults';
import ExamMyResult from './ExamMyResult';

const GRADIENTS = [
  'from-amber-500 to-orange-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
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

function useCountdown(targetDate) {
  const [diff, setDiff] = useState(null);
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => { const ms = new Date(targetDate) - Date.now(); setDiff(ms > 0 ? ms : 0); };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return diff;
}
function fmtCountdown(ms) {
  if (ms === null || ms === undefined) return null;
  if (ms <= 0) return 'Starting now';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m ${s % 60}s`;
}
function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ExamCard({ exam, canManage, onView, onEdit, onDelete, onTake, theme }) {
  const dark  = theme === 'dark';
  const r     = exam.myResult;
  const grad  = gradientFor(exam._id);
  const st    = STATUS[exam.status] || STATUS.draft;
  const pct   = r && exam.totalMarks > 0 ? Math.round((r.score / exam.totalMarks) * 100) : null;

  const msToStart   = useCountdown(exam.startTime && exam.status === 'published' ? exam.startTime : null);
  const isScheduled = exam.startTime && msToStart !== null && msToStart > 0;
  const isActive    = exam.status === 'published' && (!exam.startTime || msToStart === 0) && (!exam.endTime || new Date(exam.endTime) > new Date());

  const initials = exam.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  const [showResults,  setShowResults]  = useState(false);
  const [showMyResult, setShowMyResult] = useState(false);

  return (
    <>
      <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        exam.status === 'published'
          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/40'
          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
      }`}>

        {/* ── Colour banner ── */}
        <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
          <div className="absolute inset-0 bg-black/10" />
          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${
            exam.status === 'published' ? 'bg-black/20 text-white' : st.cls
          }`}>
            {isScheduled ? fmtCountdown(msToStart) : st.label}
          </span>
          {exam.startTime && (
            <span className="absolute top-3 left-3 flex items-center gap-1 text-white/70 text-xs">
              <FiCalendar className="w-3 h-3" /> {fmtDate(exam.startTime)}
            </span>
          )}
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
              {initials}
            </div>
            <div>
              <p className="text-white/75 text-xs font-medium">
                {exam.questionCount || 0} questions
              </p>
              <p className="text-white/50 text-xs">{exam.duration} min</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
              {exam.title}
            </h3>
            {exam.subject && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <FiBook className="w-3 h-3" /> {exam.subject.name}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <FiAward className="w-3 h-3" /> {exam.totalMarks} marks
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" /> {exam.duration} min
            </span>
          </div>

          {/* Student: my result (clickable) */}
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
                  {r.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white flex-shrink-0">
                {r.score}/{r.totalMarks}
                {pct !== null && <span className={`ml-1.5 text-xs font-semibold ${pct >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>({pct}%)</span>}
              </span>
            </button>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 dark:text-slate-500">Pass mark</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                {exam.passMarkPercent ?? 50}% ({exam.passMark} marks)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                style={{ width: `${exam.passMarkPercent ?? 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
          <button onClick={() => onView(exam)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                       text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
            <FiEye className="w-3.5 h-3.5" /> Details
          </button>

          {!canManage && isActive && !r && (
            <button onClick={() => onTake(exam)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold
                         text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
              <FiPlay className="w-3.5 h-3.5" /> Take Exam
            </button>
          )}

          {!canManage && isScheduled && !r && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-gray-400 dark:text-slate-600">
              <FiLock className="w-3.5 h-3.5" /> Scheduled
            </div>
          )}

          {!canManage && r && (
            <button onClick={() => setShowMyResult(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                         text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition">
              <FiAward className="w-3.5 h-3.5" /> My Result
            </button>
          )}

          {canManage && (
            <>
              <button onClick={() => onEdit(exam)}
                className="flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold
                           text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                <FiEdit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setShowResults(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold
                           text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
                <FiBarChart2 className="w-3.5 h-3.5" /> Results
              </button>
              <button onClick={() => onDelete(exam)}
                className="flex items-center justify-center px-3 py-3 text-red-500
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {showResults  && <ExamResults  exam={exam} theme={theme} onClose={() => setShowResults(false)}  />}
      {showMyResult && <ExamMyResult exam={exam} theme={theme} onClose={() => setShowMyResult(false)} />}
    </>
  );
}
