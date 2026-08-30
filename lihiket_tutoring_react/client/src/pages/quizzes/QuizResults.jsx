/**
 * Teacher / Admin view — all student results for a quiz.
 * Shows a ranked table with score, percentage, pass/fail, attempt count, time taken.
 */
import { useState, useEffect } from 'react';
import {
  FiX, FiUsers, FiAward, FiTrendingUp, FiLoader,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiClock,
} from 'react-icons/fi';
import { getQuizResults } from '../../api/quiz.api';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

function Badge({ passed }) {
  return passed
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"><FiCheckCircle className="w-3 h-3" /> Passed</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"><FiXCircle className="w-3 h-3" /> Failed</span>;
}

export default function QuizResults({ quiz, onClose, theme }) {
  const dark = theme === 'dark';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!quiz?._id) return;
    setLoading(true);
    getQuizResults(quiz._id)
      .then(res => setResults(res.data || []))
      .catch(err => setError(err.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [quiz?._id]);

  if (!quiz) return null;

  // Aggregate stats
  const totalStudents = results.length;
  const passed        = results.filter(r => r.passed).length;
  const avgScore      = totalStudents
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalStudents * 10) / 10
    : 0;
  const passRate = totalStudents ? Math.round((passed / totalStudents) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              Results — {quiz.title}
            </h2>
            <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
              {quiz.totalMarks} total marks · Pass mark: {quiz.passMark} ({quiz.passMarkPercent}%)
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition flex-shrink-0">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FiLoader className="w-7 h-7 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <FiAlertCircle className="w-10 h-10 text-red-400 opacity-70" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Stats row */}
              {totalStudents > 0 && (
                <div className="grid grid-cols-3 gap-3 px-6 pt-5 pb-3">
                  {[
                    { icon: FiUsers,     label: 'Submissions', value: totalStudents, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
                    { icon: FiAward,     label: 'Avg Score',   value: `${avgScore} / ${quiz.totalMarks}`, color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
                    { icon: FiTrendingUp,label: 'Pass Rate',   value: `${passRate}%`, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold leading-none text-slate-900 dark:text-white">{s.value}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results table */}
              {totalStudents === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500">
                  <FiUsers className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">No submissions yet</p>
                  <p className="text-xs">Results will appear here once students submit the quiz</p>
                </div>
              ) : (
                <div className="px-6 pb-6 mt-3">
                  <div className={`rounded-2xl border overflow-hidden ${
                    dark ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    {/* Table header */}
                    <div className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider ${
                      dark ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-50 text-slate-500'
                    }`}>
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Student</div>
                      <div className="col-span-2 text-center">Score</div>
                      <div className="col-span-1 text-center">%</div>
                      <div className="col-span-2 text-center">Result</div>
                      <div className="col-span-1 text-center">Att.</div>
                      <div className="col-span-1 text-center">Time</div>
                    </div>

                    {/* Rows */}
                    <div className={`divide-y ${dark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                      {results.map((r, i) => {
                        const pct = quiz.totalMarks > 0
                          ? Math.round((r.score / quiz.totalMarks) * 100)
                          : 0;
                        const s = r.student;
                        return (
                          <div key={r._id}
                            className={`grid grid-cols-12 gap-2 items-center px-4 py-3 text-sm transition ${
                              dark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                            }`}>
                            {/* Rank */}
                            <div className="col-span-1">
                              <span className={`text-xs font-bold ${
                                i === 0 ? 'text-amber-500' :
                                i === 1 ? 'text-slate-400' :
                                i === 2 ? 'text-orange-400' :
                                dark ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {i + 1}
                              </span>
                            </div>
                            {/* Student */}
                            <div className="col-span-4 flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {s?.firstName?.[0]}{s?.lastName?.[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                                  {s?.firstName} {s?.lastName}
                                </p>
                                <p className="text-xs truncate text-slate-400 dark:text-slate-500">{s?.gradeLevel}</p>
                              </div>
                            </div>
                            {/* Score */}
                            <div className="col-span-2 text-center font-bold text-slate-900 dark:text-white">
                              {r.score} / {r.totalMarks}
                            </div>
                            {/* Pct */}
                            <div className="col-span-1 text-center">
                              <span className={`text-xs font-bold ${
                                pct >= 80 ? 'text-emerald-500' :
                                pct >= 50 ? 'text-amber-500'   :
                                            'text-red-500'
                              }`}>{pct}%</span>
                            </div>
                            {/* Pass/Fail */}
                            <div className="col-span-2 text-center">
                              <Badge passed={r.passed} />
                            </div>
                            {/* Attempt */}
                            <div className="col-span-1 text-center text-xs text-slate-400 dark:text-slate-500">
                              {r.attempt}
                            </div>
                            {/* Time */}
                            <div className="col-span-1 text-center flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <FiClock className="w-3 h-3" />
                              {fmtTime(r.timeTaken)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                    Sorted by score (highest first)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition
                       bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                       hover:bg-slate-200 dark:hover:bg-slate-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
