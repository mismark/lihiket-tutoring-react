import { useState, useRef, useCallback } from 'react';
import { FiClock, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { submitQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';

function pad(n) { return String(n).padStart(2,'0'); }

function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef();
  ref.current = { left, onExpire };
  useState(() => {
    const t = setInterval(() => {
      setLeft(v => {
        if (v <= 1) { clearInterval(t); ref.current.onExpire(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  });
  const m = Math.floor(left / 60), s = left % 60;
  return <span className={`font-mono text-sm font-bold ${left < 60 ? 'text-red-500 animate-pulse' : ''}`}>{pad(m)}:{pad(s)}</span>;
}

function ReviewScreen({ result, quiz, onClose, theme }) {
  const dark = theme === 'dark';
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-5 border-b text-center ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
            {result.passed ? <FiCheckCircle className="w-7 h-7 text-emerald-500" /> : <FiXCircle className="w-7 h-7 text-amber-500" />}
          </div>
          <p className={`text-2xl font-extrabold ${result.passed ? 'text-emerald-500' : 'text-amber-500'}`}>{result.score} / {result.totalMarks}</p>
          <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{result.passed ? '🎉 Passed!' : 'Keep practising!'} · Attempt {result.attempt}</p>
        </div>

        {quiz.showAnswers && result.answers?.length > 0 && (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {result.answers.map((a, idx) => {
              const q = a.question;
              if (!q?.text) return null;
              return (
                <div key={idx} className={`rounded-xl border p-4 ${a.isCorrect ? dark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50' : dark ? 'border-red-500/30 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                  <p className={`text-xs font-bold mb-2 ${dark ? 'text-slate-300' : 'text-gray-800'}`}>Q{idx + 1}: {q.text}</p>
                  <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-600'}`}>Your answer: <span className="font-semibold">{a.answer || '(no answer)'}</span></p>
                  {!a.isCorrect && <p className={`text-xs mt-1 font-semibold text-emerald-600 dark:text-emerald-400`}>Correct: {q.correctAnswer}</p>}
                  {q.explanation && <p className={`text-xs mt-1 italic ${dark ? 'text-slate-500' : 'text-gray-500'}`}>{q.explanation}</p>}
                </div>
              );
            })}
          </div>
        )}

        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function QuizTake({ quiz, onClose, onSubmitted, theme }) {
  const dark      = theme === 'dark';
  const started   = useRef(Date.now());
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  if (!quiz) return null;

  const qs = quiz.questions || [];

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    if (!auto && !window.confirm('Submit this quiz?')) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - started.current) / 1000);
      const res = await submitQuiz(quiz._id, { answers, timeTaken });
      setResult(res.data);
      toast.success('Quiz submitted!');
      onSubmitted?.();
    } catch (err) { toast.error(err.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  }, [answers, quiz._id, submitting, onSubmitted]);

  if (result) return <ReviewScreen result={result} quiz={quiz} onClose={onClose} theme={theme} />;

  const answered = Object.values(answers).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[94vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

        <div className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div>
            <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</p>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{answered}/{qs.length} answered</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <FiClock className="w-4 h-4 text-blue-500" />
              <Timer seconds={quiz.duration * 60} onExpire={() => handleSubmit(true)} />
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {qs.map((item, idx) => {
            const q = item.question;
            const ans = answers[q._id] || '';
            return (
              <div key={q._id} className={`rounded-xl border p-4 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
                <p className={`text-sm font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  <span className={`mr-2 text-xs font-bold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>Q{idx + 1}</span>
                  {q.text}
                </p>
                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.options?.map(opt => (
                      <label key={opt.label} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${ans === opt.label ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : dark ? 'border-slate-700 hover:bg-slate-700/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name={`q_${q._id}`} value={opt.label} checked={ans === opt.label} onChange={() => setAnswers(p => ({ ...p, [q._id]: opt.label }))} className="sr-only" />
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${ans === opt.label ? 'bg-blue-600 border-blue-600 text-white' : dark ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'}`}>{opt.label}</span>
                        <span className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True','False'].map(v => (
                      <button key={v} type="button" onClick={() => setAnswers(p => ({ ...p, [q._id]: v }))}
                        className={`flex-1 py-2 rounded-xl font-semibold text-sm border transition ${ans === v ? 'bg-blue-600 border-blue-600 text-white' : dark ? 'border-slate-700 text-slate-300 hover:border-blue-500' : 'border-gray-200 text-gray-700 hover:border-blue-400'}`}>{v}</button>
                    ))}
                  </div>
                )}
                {(q.type === 'short_answer' || q.type === 'essay') && (
                  <textarea value={ans} onChange={e => setAnswers(p => ({ ...p, [q._id]: e.target.value }))}
                    rows={q.type === 'essay' ? 3 : 2} placeholder="Your answer…"
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${dark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : `Submit (${answered}/${qs.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
