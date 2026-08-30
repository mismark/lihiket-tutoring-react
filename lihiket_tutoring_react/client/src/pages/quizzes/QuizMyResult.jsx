/**
 * Student view — their own past result(s) for a quiz.
 * Shows score, pass/fail, and a full answer review if the quiz has showAnswers=true.
 */
import { useState, useEffect } from 'react';
import {
  FiX, FiAward, FiCheckCircle, FiXCircle,
  FiLoader, FiAlertCircle, FiClock,
} from 'react-icons/fi';
import { getMyQuizResults } from '../../api/quiz.api';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) {
  if (!s) return '—';
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

export default function QuizMyResult({ quiz: quizProp, onClose, theme }) {
  const dark = theme === 'dark';
  const [quiz,    setQuiz]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [selIdx,  setSelIdx]  = useState(0); // which attempt to display

  useEffect(() => {
    if (!quizProp?._id) return;
    setLoading(true);
    getMyQuizResults(quizProp._id)
      .then(res => {
        // API returns { data: [result1, result2, ...] }
        // Wrap in a shape QuizMyResult expects: { myResults: [...], ...quizInfo }
        const results = res.data || [];
        setQuiz({ ...quizProp, myResults: results });
      })
      .catch(err => setError(err.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }, [quizProp?._id]);

  if (!quizProp) return null;

  const results   = quiz?.myResults || [];
  const result    = results[selIdx];
  const pct       = result && quiz?.totalMarks > 0
    ? Math.round((result.score / quiz.totalMarks) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              My Results — {quizProp.title}
            </h2>
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
              <FiAlertCircle className="w-9 h-9 text-red-400 opacity-70" />
              <p className="text-sm text-red-500 font-semibold">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500">
              <FiAward className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No attempts yet</p>
              <p className="text-xs">Take the quiz first to see your results here</p>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">

              {/* Attempt selector */}
              {results.length > 1 && (
                <div className={`flex gap-1.5 p-1 rounded-xl ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => setSelIdx(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                        selIdx === i
                          ? 'bg-blue-600 text-white shadow-sm'
                          : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                      }`}>
                      Attempt {r.attempt}
                    </button>
                  ))}
                </div>
              )}

              {/* Score card */}
              {result && (
                <>
                  <div className={`rounded-2xl border p-5 text-center ${
                    result.passed
                      ? dark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'
                      : dark ? 'border-red-500/30 bg-red-500/5'         : 'border-red-200 bg-red-50'
                  }`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      result.passed
                        ? 'bg-emerald-100 dark:bg-emerald-500/20'
                        : 'bg-red-100 dark:bg-red-500/20'
                    }`}>
                      {result.passed
                        ? <FiCheckCircle className="w-7 h-7 text-emerald-500" />
                        : <FiXCircle     className="w-7 h-7 text-red-500" />
                      }
                    </div>
                    <p className={`text-3xl font-extrabold leading-none mb-1.5 ${
                      result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.score} / {result.totalMarks}
                    </p>
                    <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {pct}% · {result.passed ? 'Passed' : 'Not passed'}
                    </p>

                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span className={`flex items-center gap-1.5 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <FiClock className="w-3.5 h-3.5" />
                        Time: {fmtTime(result.timeTaken)}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <FiAward className="w-3.5 h-3.5" />
                        Attempt {result.attempt}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          result.passed ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pass mark: {quiz?.passMark} marks ({quiz?.passMarkPercent}%)
                    </p>
                  </div>

                  {/* Answer review */}
                  {quiz?.showAnswers && result.answers?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400 dark:text-slate-500">
                        Answer Review
                      </p>
                      <div className="space-y-3">
                        {result.answers.map((a, idx) => {
                          const q = a.question;
                          if (!q?.text) return null;
                          return (
                            <div key={idx} className={`rounded-xl border p-4 text-sm ${
                              a.isCorrect
                                ? dark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'
                                : dark ? 'border-red-500/30 bg-red-500/5'         : 'border-red-200 bg-red-50'
                            }`}>
                              <div className="flex items-start gap-2 mb-2">
                                {a.isCorrect
                                  ? <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  : <FiXCircle     className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                }
                                <p className={`font-semibold leading-snug ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  Q{idx + 1}: {q.text}
                                </p>
                              </div>
                              <p className={`text-xs ml-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Your answer:{' '}
                                <span className={`font-bold ${
                                  a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {a.answer || '(no answer)'}
                                </span>
                              </p>
                              {!a.isCorrect && q.correctAnswer && (
                                <p className="text-xs ml-6 mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                  Correct: {q.correctAnswer}
                                </p>
                              )}
                              {q.explanation && (
                                <p className={`text-xs ml-6 mt-1 italic ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {q.explanation}
                                </p>
                              )}
                              <p className={`text-xs ml-6 mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {a.isCorrect ? `+${a.marks}` : '0'} / {a.marks} mark{a.marks !== 1 ? 's' : ''}
                              </p>
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
