import { useState, useEffect } from 'react';
import {
  FiX, FiAward, FiCheckCircle, FiXCircle,
  FiLoader, FiAlertCircle, FiClock, FiHash,
} from 'react-icons/fi';
import { getMyExamResults } from '../../api/exam.api';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) { if (!s) return '—'; return `${pad(Math.floor(s/60))}:${pad(s%60)}`; }

export default function ExamMyResult({ exam: examProp, onClose, theme }) {
  const dark = theme === 'dark';
  const [results, setResults] = useState([]);
  const [selIdx,  setSelIdx]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!examProp?._id) return;
    setLoading(true);
    getMyExamResults(examProp._id)
      .then(res => setResults(res.data || []))
      .catch(err => setError(err.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }, [examProp?._id]);

  if (!examProp) return null;

  const result      = results[selIdx];
  const pct         = result && examProp.totalMarks > 0 ? Math.round((result.score / examProp.totalMarks) * 100) : 0;
  const passMarkPct = examProp.passMarkPercent ?? 50;
  const correctCount = (result?.answers || []).filter(a => a.isCorrect).length;
  const wrongCount   = (result?.answers || []).length - correctCount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <FiAward className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">My Exam Result</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{examProp.title}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition flex-shrink-0">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <FiLoader className="w-7 h-7 text-amber-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <FiAlertCircle className="w-9 h-9 text-red-400 opacity-70" />
              <p className="text-sm text-red-500 font-semibold">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <FiAward className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-base font-semibold">No attempts yet</p>
              <p className="text-sm">Take the exam first to see your result here</p>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">

              {/* Attempt tabs */}
              {results.length > 1 && (
                <div className={`flex gap-1 p-1 rounded-xl ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => setSelIdx(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                        selIdx === i
                          ? 'bg-amber-500 text-white shadow-sm'
                          : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                      }`}>
                      Attempt {r.attempt || i + 1}
                    </button>
                  ))}
                </div>
              )}

              {result && (
                <>
                  {/* Score hero card */}
                  <div className={`rounded-2xl overflow-hidden border ${
                    result.passed
                      ? dark ? 'border-emerald-500/30' : 'border-emerald-200'
                      : dark ? 'border-red-500/30'     : 'border-red-200'
                  }`}>
                    {/* Top colour band */}
                    <div className={`h-2 ${result.passed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />

                    <div className={`p-6 text-center ${
                      result.passed
                        ? dark ? 'bg-emerald-500/5' : 'bg-emerald-50'
                        : dark ? 'bg-red-500/5'     : 'bg-red-50'
                    }`}>
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-4 shadow-md ${
                        result.passed
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30'
                      }`}>
                        {result.passed
                          ? <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                          : <FiXCircle     className="w-8 h-8 text-red-500" />
                        }
                      </div>

                      {/* Score */}
                      <p className={`text-5xl font-black leading-none mb-1 ${
                        result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.score}
                        <span className={`text-xl font-medium ml-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          / {result.totalMarks}
                        </span>
                      </p>

                      <p className={`text-base font-bold mb-0.5 ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pct}% · {result.passed ? 'Passed! 🎉' : 'Not passed'}
                      </p>

                      {/* Sub stats */}
                      <div className="flex items-center justify-center gap-5 mt-3">
                        <div className="text-center">
                          <p className="text-sm font-extrabold text-emerald-500">{correctCount}</p>
                          <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Correct</p>
                        </div>
                        <div className={`w-px h-6 ${dark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                        <div className="text-center">
                          <p className="text-sm font-extrabold text-red-500">{wrongCount}</p>
                          <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Wrong</p>
                        </div>
                        <div className={`w-px h-6 ${dark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                        <div className="text-center">
                          <p className={`text-sm font-extrabold flex items-center gap-1 justify-center ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <FiClock className="w-3.5 h-3.5" /> {fmtTime(result.timeTaken)}
                          </p>
                          <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Time</p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-4 mx-auto max-w-xs">
                        <div className="h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400 z-10 opacity-70"
                            style={{ left: `${passMarkPct}%` }} />
                          <div className={`h-full rounded-full transition-all duration-700 ease-out ${result.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
                          <span>0</span>
                          <span>Pass: {examProp.passMark} ({passMarkPct}%)</span>
                          <span>{examProp.totalMarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer review */}
                  {examProp.allowReview && result.answers?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400 dark:text-slate-500">
                        Answer Review
                      </p>
                      <div className="space-y-3">
                        {result.answers.map((a, idx) => {
                          const q = a.question;
                          if (!q?.text) return null;
                          return (
                            <div key={idx} className={`rounded-2xl border overflow-hidden ${
                              a.isCorrect
                                ? dark ? 'border-emerald-500/25' : 'border-emerald-200'
                                : dark ? 'border-red-500/25'     : 'border-red-200'
                            }`}>
                              <div className={`flex items-center justify-between px-4 py-2 ${
                                a.isCorrect
                                  ? dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                  : dark ? 'bg-red-500/10'     : 'bg-red-50'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${a.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {a.isCorrect
                                      ? <FiCheckCircle className="w-2.5 h-2.5 text-white" />
                                      : <FiXCircle     className="w-2.5 h-2.5 text-white" />
                                    }
                                  </div>
                                  <span className={`text-xs font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Q{idx+1}</span>
                                </div>
                                <span className={`text-xs font-bold ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                  {a.isCorrect ? `+${a.marks}` : '0'}/{a.marks}
                                </span>
                              </div>
                              <div className={`px-4 py-3 ${dark ? '' : 'bg-white'}`}>
                                <p className={`text-sm font-medium mb-2 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{q.text}</p>
                                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  Your answer:{' '}
                                  <span className={`font-semibold ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {a.answer || '(no answer)'}
                                  </span>
                                </p>
                                {!a.isCorrect && q.correctAnswer && (
                                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    Correct: {q.correctAnswer}
                                  </p>
                                )}
                                {q.explanation && (
                                  <p className={`text-xs italic mt-1.5 leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {q.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
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
