import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiClock, FiX, FiCheckCircle, FiXCircle, FiLoader,
  FiAlertCircle, FiChevronLeft, FiChevronRight, FiSend,
  FiAward, FiZap,
} from 'react-icons/fi';
import { getQuiz, submitQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';

function pad(n) { return String(n).padStart(2, '0'); }

// ── Countdown ─────────────────────────────────────────────────────────────────
function Timer({ totalSeconds, onExpire }) {
  const [left, setLeft] = useState(totalSeconds);
  const cbRef = useRef(onExpire);
  useEffect(() => { cbRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (totalSeconds <= 0) return;
    const t = setInterval(() => {
      setLeft(v => {
        if (v <= 1) { clearInterval(t); cbRef.current?.(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [totalSeconds]);

  const pct    = totalSeconds > 0 ? (left / totalSeconds) * 100 : 0;
  const urgent = left <= 60 && left > 0;
  const color  = left > totalSeconds * 0.5 ? 'text-emerald-500' : left > totalSeconds * 0.2 ? 'text-amber-500' : 'text-red-500 animate-pulse';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center relative flex-shrink-0`}>
        <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="text-slate-200 dark:text-slate-700" />
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            className={urgent ? 'text-red-500' : 'text-blue-500'}
            strokeLinecap="round" />
        </svg>
        <FiClock className={`w-3.5 h-3.5 relative ${urgent ? 'text-red-500' : 'text-blue-500'}`} />
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${color}`}>
        {pad(Math.floor(left / 60))}:{pad(left % 60)}
      </span>
    </div>
  );
}

// ── Result / Review screen ────────────────────────────────────────────────────
function ReviewScreen({ result, quiz, onClose, theme }) {
  const dark = theme === 'dark';
  const pct  = quiz.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
  const passMarkPct = quiz.totalMarks > 0 ? Math.round((quiz.passMark / quiz.totalMarks) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[94vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Score hero */}
        <div className={`relative overflow-hidden px-8 py-8 border-b text-center flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          {/* Subtle bg tint */}
          <div className={`absolute inset-0 ${result.passed ? 'bg-emerald-500/5' : 'bg-amber-500/5'}`} />

          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${
              result.passed
                ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30'
            }`}>
              {result.passed
                ? <FiCheckCircle className="w-9 h-9 text-emerald-500" />
                : <FiXCircle     className="w-9 h-9 text-amber-500" />
              }
            </div>
            <p className={`text-4xl font-extrabold leading-none mb-2 ${
              result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {result.score} <span className="text-xl font-medium opacity-60">/ {result.totalMarks}</span>
            </p>
            <p className={`text-base font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              {pct}% · {result.passed ? 'Passed 🎉' : 'Not passed'} · Attempt {result.attempt}
            </p>

            {/* Score bar */}
            <div className="mt-4 mx-auto max-w-xs">
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                {/* Pass mark marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400 z-10"
                  style={{ left: `${passMarkPct}%` }} />
                <div className={`h-full rounded-full transition-all duration-1000 ${
                  result.passed ? 'bg-emerald-500' : 'bg-amber-500'
                }`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span>0</span>
                <span className="flex items-center gap-1">
                  Pass: {quiz.passMark} ({passMarkPct}%)
                </span>
                <span>{quiz.totalMarks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answer review */}
        {quiz.showAnswers && result.answers?.length > 0 ? (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Answer Review
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  {result.answers.filter(a => a.isCorrect).length} correct
                </span>
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <FiXCircle className="w-3.5 h-3.5" />
                  {result.answers.filter(a => !a.isCorrect).length} wrong
                </span>
              </div>
            </div>
            {result.answers.map((a, idx) => {
              const q = a.question;
              if (!q?.text) return null;
              return (
                <div key={idx} className={`rounded-xl border p-4 ${
                  a.isCorrect
                    ? dark ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'
                    : dark ? 'border-red-500/25 bg-red-500/5'         : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      a.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {a.isCorrect
                        ? <FiCheckCircle className="w-3 h-3 text-white" />
                        : <FiXCircle     className="w-3 h-3 text-white" />
                      }
                    </div>
                    <p className={`text-sm font-semibold leading-snug ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Q{idx + 1}: {q.text}
                    </p>
                    <span className={`ml-auto text-xs font-bold flex-shrink-0 ${
                      a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}>
                      {a.isCorrect ? `+${a.marks}` : '0'}/{a.marks}
                    </span>
                  </div>
                  <div className="ml-7.5 space-y-1 pl-0.5">
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Your answer:{' '}
                      <span className={`font-semibold ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {a.answer || '(no answer)'}
                      </span>
                    </p>
                    {!a.isCorrect && q.correctAnswer && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Correct: {q.correctAnswer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className={`text-xs italic ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {quiz.showAnswers ? 'No answers to review' : 'Answer review is not available for this quiz'}
          </div>
        )}

        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main QuizTake ─────────────────────────────────────────────────────────────
export default function QuizTake({ quiz: quizProp, onClose, onSubmitted, theme }) {
  const dark = theme === 'dark';

  const [quiz,       setQuiz]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState('');
  const [answers,    setAnswers]    = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);  // active question index
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);
  const started = useRef(Date.now());

  // Fetch full quiz with populated questions
  useEffect(() => {
    if (!quizProp?._id) return;
    setLoading(true);
    setFetchErr('');
    getQuiz(quizProp._id)
      .then(res => setQuiz(res.data || res))
      .catch(err => setFetchErr(err.message || 'Failed to load quiz questions'))
      .finally(() => setLoading(false));
  }, [quizProp?._id]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || !quiz) return;
    if (!auto && !window.confirm('Submit this quiz now? You cannot change your answers after submitting.')) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - started.current) / 1000);
      const res = await submitQuiz(quiz._id, { answers, timeTaken });
      setResult(res.data || res);
      toast.success('Quiz submitted!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [answers, quiz, submitting, onSubmitted]);

  if (!quizProp) return null;

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <FiLoader className="w-8 h-8 text-violet-500 animate-spin" />
        <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Loading questions…</p>
      </div>
    </div>
  );

  if (fetchErr) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border max-w-sm w-full text-center ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <FiAlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-semibold text-red-500">{fetchErr}</p>
        <button onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
          Close
        </button>
      </div>
    </div>
  );

  if (result) return <ReviewScreen result={result} quiz={quiz} onClose={onClose} theme={theme} />;

  const qs         = quiz?.questions || [];
  const totalQ     = qs.length;
  const answered   = Object.values(answers).filter(v => v !== '' && v !== undefined).length;
  const item       = qs[currentIdx];
  const q          = item?.question && typeof item.question === 'object' ? item.question : item;
  const marks      = item?.marks || q?.marks || 1;
  const ans        = q ? (answers[q._id] || '') : '';
  const progressPct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[96vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* ── Top bar ── */}
        <div className={`px-5 pt-4 pb-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? 'bg-violet-500/15' : 'bg-violet-100'}`}>
                <FiZap className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              </div>
              <div>
                <p className={`text-sm font-bold max-w-[200px] truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {quiz.title}
                </p>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {answered}/{totalQ} answered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer totalSeconds={quiz.duration * 60} onExpire={() => handleSubmit(true)} />
              <button onClick={onClose}
                className={`p-2 rounded-lg transition ml-1 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>

          {/* Question dots */}
          {totalQ <= 20 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {qs.map((item, i) => {
                const qi  = item?.question?._id || item?._id;
                const sel = i === currentIdx;
                const done = qi ? !!answers[qi] : false;
                return (
                  <button key={i} onClick={() => setCurrentIdx(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      sel  ? 'bg-violet-600 text-white shadow-sm' :
                      done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                             dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Question ── */}
        {totalQ === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 py-16">
            <FiAlertCircle className="w-10 h-10 opacity-40" />
            <p className="text-sm">This quiz has no questions.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Question header */}
            <div className="flex items-start gap-3 mb-5">
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                dark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
              }`}>
                {currentIdx + 1}
              </div>
              <div className="flex-1">
                <p className={`text-base font-semibold leading-relaxed ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {q?.text}
                </p>
                <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {marks} mark{marks !== 1 ? 's' : ''}
                  {q?.difficulty && <span className="ml-2 capitalize">{q.difficulty}</span>}
                </p>
              </div>
            </div>

            {/* Multiple choice */}
            {q?.type === 'multiple_choice' && (
              <div className="space-y-2.5">
                {(q.options || []).map(opt => (
                  <label key={opt.label}
                    className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      ans === opt.label
                        ? dark ? 'border-violet-500 bg-violet-500/10 shadow-sm' : 'border-violet-400 bg-violet-50 shadow-sm'
                        : dark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/40' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <input type="radio" name={`q_${q._id}`} value={opt.label}
                      checked={ans === opt.label}
                      onChange={() => setAnswers(p => ({ ...p, [q._id]: opt.label }))}
                      className="sr-only" />
                    <span className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-all ${
                      ans === opt.label
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : dark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
                    }`}>
                      {opt.label}
                    </span>
                    <span className={`text-sm font-medium ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {opt.text}
                    </span>
                    {ans === opt.label && (
                      <FiCheckCircle className="w-4 h-4 text-violet-500 ml-auto flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* True / False */}
            {q?.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {['True', 'False'].map(v => (
                  <button key={v} type="button"
                    onClick={() => setAnswers(p => ({ ...p, [q._id]: v }))}
                    className={`py-5 rounded-2xl font-bold text-base border-2 transition-all ${
                      ans === v
                        ? v === 'True'
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                          : 'bg-red-500 border-red-500 text-white shadow-md'
                        : dark ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
                               : 'border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                    }`}>
                    {v === 'True' ? '✓ True' : '✗ False'}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer / Essay */}
            {(q?.type === 'short_answer' || q?.type === 'essay') && (
              <textarea
                value={ans}
                onChange={e => setAnswers(p => ({ ...p, [q._id]: e.target.value }))}
                rows={q.type === 'essay' ? 5 : 2}
                placeholder="Type your answer here…"
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none
                            focus:outline-none focus:ring-2 focus:ring-violet-500 transition ${
                  dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                       : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            )}
          </div>
        )}

        {/* ── Navigation footer ── */}
        <div className={`px-5 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:hover:bg-slate-700'
                     : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:hover:bg-slate-100'
              }`}>
              <FiChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex-1 text-center">
              <span className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentIdx + 1} of {totalQ}
              </span>
            </div>

            {currentIdx < totalQ - 1 ? (
              <button
                onClick={() => setCurrentIdx(i => Math.min(totalQ - 1, i + 1))}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                Next <FiChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50
                           bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                  : <><FiSend className="w-4 h-4" /> Submit ({answered}/{totalQ})</>
                }
              </button>
            )}
          </div>

          {/* Submit from any question */}
          {currentIdx < totalQ - 1 && (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className={`w-full mt-2.5 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
                dark ? 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                     : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}>
              Submit early ({answered}/{totalQ} answered)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
