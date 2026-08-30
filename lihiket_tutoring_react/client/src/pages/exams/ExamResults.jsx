import { useState, useEffect } from 'react';
import {
  FiX, FiUsers, FiAward, FiTrendingUp, FiLoader,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiClock,
  FiBarChart2, FiDownload,
} from 'react-icons/fi';
import { getExamResults } from '../../api/exam.api';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) { if (!s) return '—'; return `${pad(Math.floor(s/60))}:${pad(s%60)}`; }

function PassBadge({ passed }) {
  return passed
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"><FiCheckCircle className="w-3 h-3"/>Passed</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"><FiXCircle className="w-3 h-3"/>Failed</span>;
}

// Simple bar chart using divs
function ScoreDistribution({ results, totalMarks, dark }) {
  if (!results.length) return null;
  const buckets = [
    { label: '0–49%',   min: 0,  max: 49,  color: 'bg-red-400'    },
    { label: '50–64%',  min: 50, max: 64,  color: 'bg-amber-400'  },
    { label: '65–79%',  min: 65, max: 79,  color: 'bg-blue-400'   },
    { label: '80–89%',  min: 80, max: 89,  color: 'bg-emerald-400'},
    { label: '90–100%', min: 90, max: 100, color: 'bg-emerald-600'},
  ];
  const counts = buckets.map(b =>
    results.filter(r => {
      const p = totalMarks > 0 ? Math.round((r.score / totalMarks) * 100) : 0;
      return p >= b.min && p <= b.max;
    }).length
  );
  const max = Math.max(...counts, 1);

  return (
    <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <FiBarChart2 className={`w-4 h-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
        <p className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Score Distribution
        </p>
      </div>
      <div className="flex items-end gap-2 h-24">
        {buckets.map((b, i) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              {counts[i] || ''}
            </span>
            <div className="w-full flex items-end" style={{ height: '60px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${b.color} opacity-80`}
                style={{ height: `${(counts[i] / max) * 60}px`, minHeight: counts[i] > 0 ? '4px' : '0' }}
              />
            </div>
            <span className={`text-xs text-center leading-tight ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExamResults({ exam, onClose, theme }) {
  const dark = theme === 'dark';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [view,    setView]    = useState('table'); // 'table' | 'chart'

  useEffect(() => {
    if (!exam?._id) return;
    setLoading(true);
    getExamResults(exam._id)
      .then(res => setResults((res.data || []).sort((a, b) => b.score - a.score)))
      .catch(err => setError(err.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [exam?._id]);

  if (!exam) return null;

  const total      = results.length;
  const passed     = results.filter(r => r.passed).length;
  const failed     = total - passed;
  const avgScore   = total ? Math.round(results.reduce((s, r) => s + r.score, 0) / total * 10) / 10 : 0;
  const highScore  = total ? Math.max(...results.map(r => r.score)) : 0;
  const passRate   = total ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <FiBarChart2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Exam Results
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-9 truncate">{exam.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 ml-9 mt-0.5">
                {exam.totalMarks} total marks · Pass: {exam.passMark} ({exam.passMarkPercent ?? 50}%)
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition flex-shrink-0">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <FiLoader className="w-7 h-7 text-amber-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FiAlertCircle className="w-10 h-10 text-red-400 opacity-70" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
              <FiUsers className="w-12 h-12 opacity-25" />
              <p className="text-base font-semibold">No submissions yet</p>
              <p className="text-sm">Results will appear here once students submit</p>
            </div>
          ) : (
            <div className="px-6 pt-5 pb-6 space-y-5">

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: FiUsers,      label: 'Submitted',  value: total,                              color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'           },
                  { icon: FiTrendingUp, label: 'Pass Rate',  value: `${passRate}%`,                     color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
                  { icon: FiAward,      label: 'Avg Score',  value: `${avgScore}/${exam.totalMarks}`,   color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'         },
                  { icon: FiAward,      label: 'High Score', value: `${highScore}/${exam.totalMarks}`,  color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'     },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold leading-none text-slate-900 dark:text-white">{s.value}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pass / Fail summary bar */}
              <div className={`rounded-xl p-4 ${dark ? 'bg-slate-700/40' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">{passed} passed ({passRate}%)</span>
                  <span className="text-red-500">{failed} failed</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden bg-red-200 dark:bg-red-500/20">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${passRate}%` }} />
                </div>
              </div>

              {/* Score distribution chart */}
              <ScoreDistribution results={results} totalMarks={exam.totalMarks} dark={dark} />

              {/* Results table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Student Results
                  </p>
                  <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sorted by score
                  </span>
                </div>
                <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b ${
                    dark ? 'bg-slate-900/50 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Student</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-1 text-center">%</div>
                    <div className="col-span-2 text-center">Result</div>
                    <div className="col-span-1 text-center">Att.</div>
                    <div className="col-span-1 text-center">Time</div>
                  </div>
                  <div className={`divide-y ${dark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                    {results.map((r, i) => {
                      const pct = exam.totalMarks > 0 ? Math.round((r.score / exam.totalMarks) * 100) : 0;
                      const s   = r.student;
                      const rankColors = ['text-amber-500', 'text-slate-400', 'text-orange-600'];
                      return (
                        <div key={r._id}
                          className={`grid grid-cols-12 gap-2 items-center px-4 py-3.5 transition-colors ${
                            dark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/80'
                          }`}>
                          <div className="col-span-1">
                            <span className={`text-xs font-bold tabular-nums ${rankColors[i] || (dark ? 'text-slate-500' : 'text-slate-400')}`}>
                              {i + 1}
                            </span>
                          </div>
                          <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {s?.firstName?.[0]}{s?.lastName?.[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                                {s?.firstName} {s?.lastName}
                              </p>
                              <p className="text-xs truncate text-slate-400 dark:text-slate-500">
                                {s?.gradeLevel}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{r.score}</span>
                            <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>/{r.totalMarks}</span>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className={`text-xs font-extrabold ${
                              pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'
                            }`}>{pct}%</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <PassBadge passed={r.passed} />
                          </div>
                          <div className="col-span-1 text-center text-xs text-slate-400 dark:text-slate-500">
                            {r.attempt || 1}
                          </div>
                          <div className="col-span-1 text-center flex items-center justify-center gap-0.5 text-xs text-slate-400 dark:text-slate-500">
                            <FiClock className="w-3 h-3" />{fmtTime(r.timeTaken)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
