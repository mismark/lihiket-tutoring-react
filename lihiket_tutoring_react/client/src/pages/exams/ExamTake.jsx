import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiClock, FiX, FiCheckCircle, FiXCircle, FiLoader,
  FiAlertCircle, FiChevronLeft, FiChevronRight, FiSend,
  FiAward, FiHash, FiInfo, FiPlay,
} from 'react-icons/fi';
import { getExam, submitExam } from '../../api/exam.api';
import toast from 'react-hot-toast';

function pad(n) { return String(n).padStart(2, '0'); }

// ── Circular countdown timer ──────────────────────────────────────────────────
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
  const urgent = left <= 120;
  const danger = left <= 60;
  const arc    = 2 * Math.PI * 13;
  const color  = danger ? 'text-red-500' : urgent ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-9 h-9 flex-shrink-0">
        <svg className="absolute inset-0 w-9 h-9 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-slate-200 dark:text-slate-700" />
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeDasharray={arc}
            strokeDashoffset={arc * (1 - pct / 100)}
            className={danger ? 'text-red-500' : urgent ? 'text-amber-500' : 'text-emerald-500'}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiClock className={`w-3.5 h-3.5 ${danger ? 'text-red-500 animate-pulse' : urgent ? 'text-amber-500' : 'text-emerald-500'}`} />
        </div>
      </div>
      <span className={`font-mono text-sm font-extrabold tabular-nums ${
        danger ? 'text-red-500 animate-pulse' : urgent ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'
      }`}>
        {pad(Math.floor(left / 60))}:{pad(left % 60)}
      </span>
    </div>
  );
}

// ── Pre-exam start screen ─────────────────────────────────────────────────────
function StartScreen({ exam, onStart, onClose, theme }) {
  const dark = theme === 'dark';
  const qs   = exam.questions || [];

  const rules = [
    `This exam has ${qs.length} question${qs.length !== 1 ? 's' : ''} worth ${exam.totalMarks} marks total.`,
    `You have ${exam.duration} minutes to complete it.`,
    `Pass mark is ${exam.passMark} marks (${exam.passMarkPercent ?? 50}%).`,
    'Once submitted, your answers cannot be changed.',
    exam.allowReview ? 'You can review correct answers after submission.' : 'Correct answers will not be shown after submission.',
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Hero */}
        <div className={`relative overflow-hidden px-8 py-8 rounded-t-2xl ${
          dark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10' : 'bg-gradient-to-br from-amber-50 to-orange-50'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <FiAward className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl font-extrabold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
                {exam.title}
              </h2>
              {exam.subject && (
                <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {exam.subject.name} {exam.subject.gradeLevel && `· ${exam.subject.gradeLevel}`}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FiClock, label: 'Duration',   value: `${exam.duration} min` },
              { icon: FiHash,  label: 'Questions',  value: qs.length             },
              { icon: FiAward, label: 'Total Marks', value: exam.totalMarks      },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${dark ? 'bg-slate-700/60' : 'bg-white/70 backdrop-blur-sm'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
                <p className={`text-base font-extrabold leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="px-6 py-5 space-y-4">
          {exam.description && (
            <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              {exam.description}
            </p>
          )}

          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiInfo className="w-3.5 h-3.5" /> Before you begin
            </p>
            <ul className="space-y-2">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>{i + 1}</span>
                  <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {exam.instructions && (
            <div className={`rounded-xl p-4 border ${dark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                Examiner Instructions
              </p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-blue-300' : 'text-blue-800'}`}>
                {exam.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex gap-3 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            Cancel
          </button>
          <button onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm
                       bg-amber-500 hover:bg-amber-600 text-white transition shadow-md shadow-amber-500/25">
            <FiPlay className="w-4 h-4" /> Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post-exam review screen ───────────────────────────────────────────────────
function ReviewScreen({ result, exam, onClose, theme }) {
  const dark = theme === 'dark';
  const pct  = exam.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
  const passMarkPct = exam.passMarkPercent ?? (exam.totalMarks > 0 ? Math.round((exam.passMark / exam.totalMarks) * 100) : 50);
  const correctCount = (result.answers || []).filter(a => a.isCorrect).length;
  const wrongCount   = (result.answers || []).filter(a => !a.isCorrect).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[94vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Score hero */}
        <div className={`relative overflow-hidden px-8 py-8 rounded-t-2xl text-center ${
          result.passed
            ? dark ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
            : dark ? 'bg-gradient-to-br from-red-500/15 to-orange-500/10'   : 'bg-gradient-to-br from-red-50 to-orange-50'
        }`}>
          {/* Trophy / X icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 shadow-lg ${
            result.passed
              ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30'
          }`}>
            {result.passed
              ? <FiCheckCircle className="w-9 h-9 text-emerald-500" />
              : <FiXCircle     className="w-9 h-9 text-red-500" />
            }
          </div>

          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
            result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {result.passed ? 'Congratulations!' : 'Not quite there'}
          </p>
          <p className={`text-5xl font-black leading-none mb-2 ${
            result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {result.score}
            <span className={`text-2xl font-medium ml-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              / {result.totalMarks}
            </span>
          </p>
          <p className={`text-base font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
            {pct}% · {result.passed ? 'Passed' : 'Failed'}
          </p>

          {/* Score bar */}
          <div className="mt-5 mx-auto max-w-xs">
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
              {/* Pass mark line */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-slate-600 dark:bg-slate-300 z-10 opacity-60"
                style={{ left: `${passMarkPct}%` }} />
              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${result.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              <span>0</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                Pass: {exam.passMark} ({passMarkPct}%)
              </span>
              <span>{exam.totalMarks}</span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-500">{correctCount}</p>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Correct</p>
            </div>
            <div className={`w-px h-8 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="text-center">
              <p className="text-lg font-extrabold text-red-500">{wrongCount}</p>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Wrong</p>
            </div>
            <div className={`w-px h-8 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="text-center">
              <p className="text-lg font-extrabold text-slate-500 dark:text-slate-400">
                {(result.answers || []).length - correctCount - wrongCount}
              </p>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Skipped</p>
            </div>
          </div>
        </div>

        {/* Answer review */}
        {exam.allowReview && result.answers?.length > 0 ? (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Answer Review
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <FiCheckCircle className="w-3.5 h-3.5" /> {correctCount}
                </span>
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <FiXCircle className="w-3.5 h-3.5" /> {wrongCount}
                </span>
              </div>
            </div>
            {result.answers.map((a, idx) => {
              const q = a.question;
              if (!q?.text) return null;
              return (
                <div key={idx} className={`rounded-2xl border overflow-hidden ${
                  a.isCorrect
                    ? dark ? 'border-emerald-500/25' : 'border-emerald-200'
                    : dark ? 'border-red-500/25'     : 'border-red-200'
                }`}>
                  {/* Question header bar */}
                  <div className={`flex items-center justify-between px-4 py-2.5 ${
                    a.isCorrect
                      ? dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                      : dark ? 'bg-red-500/10'     : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${a.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {a.isCorrect
                          ? <FiCheckCircle className="w-3 h-3 text-white" />
                          : <FiXCircle     className="w-3 h-3 text-white" />
                        }
                      </div>
                      <span className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Question {idx + 1}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {a.isCorrect ? `+${a.marks}` : '0'} / {a.marks} marks
                    </span>
                  </div>
                  <div className={`px-4 py-3 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
                    <p className={`text-sm font-semibold mb-2 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{q.text}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Your answer:{' '}
                      <span className={`font-semibold ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {a.answer || '(no answer)'}
                      </span>
                    </p>
                    {!a.isCorrect && q.correctAnswer && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Correct answer: {q.correctAnswer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className={`text-xs mt-1.5 italic leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center py-10 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {exam.allowReview ? 'No answers to review' : 'Answer review is disabled for this exam'}
          </div>
        )}

        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ExamTake ─────────────────────────────────────────────────────────────
export default function ExamTake({ exam: examProp, onClose, onSubmitted, theme }) {
  const dark = theme === 'dark';

  const [exam,       setExam]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState('');
  const [started,    setStarted]    = useState(false); // show start screen first
  const [answers,    setAnswers]    = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);
  const startedAt = useRef(null);

  useEffect(() => {
    if (!examProp?._id) return;
    setLoading(true);
    setFetchErr('');
    getExam(examProp._id)
      .then(res => setExam(res.data || res))
      .catch(err => setFetchErr(err.message || 'Failed to load exam'))
      .finally(() => setLoading(false));
  }, [examProp?._id]);

  const handleStart = () => {
    startedAt.current = Date.now();
    setStarted(true);
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || !exam) return;
    if (!auto && !window.confirm('Submit this exam? Your answers cannot be changed after submitting.')) return;
    setSubmitting(true);
    try {
      const timeTaken = startedAt.current ? Math.floor((Date.now() - startedAt.current) / 1000) : 0;
      const res = await submitExam(exam._id, { answers, timeTaken });
      setResult(res.data || res);
      toast.success('Exam submitted successfully!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  }, [answers, exam, submitting, onSubmitted]);

  if (!examProp) return null;

  // Loading state
  if (loading) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <FiLoader className="w-8 h-8 text-amber-500 animate-spin" />
        <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Loading exam…</p>
      </div>
    </div>
  );

  // Error state
  if (fetchErr) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border max-w-sm w-full text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <FiAlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-semibold text-red-500">{fetchErr}</p>
        <button onClick={onClose} className={`px-6 py-2.5 rounded-xl text-sm font-semibold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} transition`}>
          Close
        </button>
      </div>
    </div>
  );

  // Show start screen before exam begins
  if (!started) return <StartScreen exam={exam} onStart={handleStart} onClose={onClose} theme={theme} />;

  // Show review screen after submission
  if (result) return <ReviewScreen result={result} exam={exam} onClose={onClose} theme={theme} />;

  const qs           = exam?.questions || [];
  const totalQ       = qs.length;
  const answered     = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;
  const item         = qs[currentIdx];
  const q            = item?.question && typeof item.question === 'object' ? item.question : item;
  const marks        = item?.marks || q?.marks || 1;
  const ans          = q ? (answers[q._id] || '') : '';
  const progressPct  = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[96vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* ── Top bar ── */}
        <div className={`px-5 pt-4 pb-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            {/* Exam title + progress */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
                <FiAward className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate max-w-[180px] ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {exam.title}
                </p>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {answered}/{totalQ} answered
                </p>
              </div>
            </div>
            {/* Timer + close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Timer totalSeconds={exam.duration * 60} onExpire={() => handleSubmit(true)} />
              <button onClick={onClose}
                className={`p-2 rounded-lg transition ml-1 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>

          {/* Question navigator dots */}
          {totalQ > 0 && totalQ <= 30 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {qs.map((item, i) => {
                const qi   = item?.question?._id || item?._id;
                const sel  = i === currentIdx;
                const done = qi ? !!answers[qi] : false;
                return (
                  <button key={i} onClick={() => setCurrentIdx(i)}
                    title={`Question ${i + 1}${done ? ' (answered)' : ''}`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      sel  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30' :
                      done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                             dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          )}
          {totalQ > 30 && (
            <p className={`text-xs mt-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Question {currentIdx + 1} of {totalQ}
            </p>
          )}
        </div>

        {/* ── Question body ── */}
        {totalQ === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 py-16">
            <FiAlertCircle className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">This exam has no questions</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Question number + text */}
            <div className="flex items-start gap-3 mb-6">
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>
                {currentIdx + 1}
              </div>
              <div className="flex-1">
                <p className={`text-base font-semibold leading-relaxed ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {q?.text}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-xs font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {marks} mark{marks !== 1 ? 's' : ''}
                  </span>
                  {q?.difficulty && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      q.difficulty === 'easy'   ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Multiple choice */}
            {q?.type === 'multiple_choice' && (
              <div className="space-y-3">
                {(q.options || []).map((opt, oi) => {
                  const selected = ans === opt.label;
                  return (
                    <label key={opt.label}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selected
                          ? dark ? 'border-amber-500 bg-amber-500/10' : 'border-amber-400 bg-amber-50 shadow-sm'
                          : dark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/30' : 'border-slate-200 hover:border-amber-200 hover:bg-amber-50/50'
                      }`}>
                      <input type="radio" name={`q_${q._id}`} value={opt.label}
                        checked={selected}
                        onChange={() => setAnswers(p => ({ ...p, [q._id]: opt.label }))}
                        className="sr-only" />
                      {/* Option letter circle */}
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-extrabold flex-shrink-0 transition-all ${
                        selected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : dark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
                      }`}>
                        {opt.label}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {opt.text}
                      </span>
                      {selected && <FiCheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>
            )}

            {/* True / False */}
            {q?.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map(v => {
                  const selected = ans === v;
                  return (
                    <button key={v} type="button"
                      onClick={() => setAnswers(p => ({ ...p, [q._id]: v }))}
                      className={`py-6 rounded-2xl font-bold text-lg border-2 transition-all ${
                        selected
                          ? v === 'True'
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25'
                          : dark
                            ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
                            : 'border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}>
                      {v === 'True' ? '✓  True' : '✗  False'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short answer / Essay */}
            {(q?.type === 'short_answer' || q?.type === 'essay') && (
              <div>
                <textarea
                  value={ans}
                  onChange={e => setAnswers(p => ({ ...p, [q._id]: e.target.value }))}
                  rows={q.type === 'essay' ? 6 : 3}
                  placeholder={q.type === 'essay' ? 'Write your full answer here…' : 'Type your answer…'}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm resize-none
                              focus:outline-none focus:border-amber-500 transition ${
                    dark
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
                {ans && (
                  <p className={`text-xs mt-1.5 text-right ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {ans.length} characters
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation footer ── */}
        <div className={`px-5 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            {/* Prev */}
            <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-30 ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:hover:bg-slate-700'
                     : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:hover:bg-slate-100'
              }`}>
              <FiChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Page indicator */}
            <div className="flex-1 text-center">
              <span className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentIdx + 1} / {totalQ}
              </span>
            </div>

            {/* Next or Submit */}
            {currentIdx < totalQ - 1 ? (
              <button onClick={() => setCurrentIdx(i => Math.min(totalQ - 1, i + 1))}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                Next <FiChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                  : <><FiSend className="w-4 h-4" /> Submit ({answered}/{totalQ})</>
                }
              </button>
            )}
          </div>

          {/* Submit early link */}
          {currentIdx < totalQ - 1 && totalQ > 1 && (
            <button onClick={() => handleSubmit(false)}
              disabled={submitting}
              className={`w-full mt-2 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
                dark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                     : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}>
              Submit exam early ({answered}/{totalQ} answered)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
