/** Student exam-taking UI with countdown timer and auto-submit */
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiClock, FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { submitExam } from '../../api/exam.api';
import toast from 'react-hot-toast';

function pad(n) { return String(n).padStart(2, '0'); }

function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setInterval(() => setLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [left, onExpire]);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const urgent = left < 120;
  return (
    <span className={`font-mono text-sm font-bold ${urgent ? 'text-red-500 animate-pulse' : ''}`}>
      {h > 0 && `${pad(h)}:`}{pad(m)}:{pad(s)}
    </span>
  );
}

export default function ExamTake({ exam, onClose, onSubmitted, theme }) {
  const dark      = theme === 'dark';
  const started   = useRef(Date.now());
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  if (!exam) return null;

  const qs = exam.questions || [];

  const handleExpire = useCallback(() => {
    if (!done) handleSubmit(true);
  }, [done]);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    if (!auto && !window.confirm('Submit this exam? You cannot change your answers after submission.')) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - started.current) / 1000);
      const res = await submitExam(exam._id, { answers, timeTaken });
      setResult(res.data);
      setDone(true);
      toast.success('Exam submitted!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const answered = Object.keys(answers).filter(k => answers[k]).length;

  /* Result screen */
  if (done && result) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-8 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
            {result.passed ? <FiCheckCircle className="w-8 h-8 text-emerald-500" /> : <FiAlertTriangle className="w-8 h-8 text-red-500" />}
          </div>
          <h2 className={`text-xl font-extrabold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{result.passed ? '🎉 Passed!' : 'Not Passed'}</h2>
          <p className={`text-4xl font-extrabold mb-1 ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
            {result.score} <span className={`text-lg ${dark ? 'text-slate-400' : 'text-gray-400'}`}>/ {result.totalMarks}</span>
          </p>
          <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Pass mark: {exam.passMark}</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[94vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h2>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{answered}/{qs.length} answered</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <FiClock className="w-4 h-4 text-blue-500" />
              <Timer seconds={exam.duration * 60} onExpire={handleExpire} />
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Instructions */}
        {exam.instructions && (
          <div className={`px-6 py-3 border-b text-sm ${dark ? 'border-slate-700 text-slate-300 bg-slate-700/30' : 'border-gray-100 text-gray-600 bg-blue-50'}`}>
            {exam.instructions}
          </div>
        )}

        {/* Questions */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {qs.map((item, idx) => {
            const q   = item.question;
            const ans = answers[q._id] || '';
            return (
              <div key={q._id} className={`rounded-xl border p-4 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
                <p className={`text-sm font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  <span className={`mr-2 text-xs font-bold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>Q{idx + 1}</span>
                  {q.text}
                  <span className={`ml-2 text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>({item.marks} mark{item.marks !== 1 ? 's' : ''})</span>
                </p>

                {/* MCQ */}
                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.options?.map(opt => (
                      <label key={opt.label} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        ans === opt.label ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : dark ? 'border-slate-700 hover:bg-slate-700/40' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name={`q_${q._id}`} value={opt.label} checked={ans === opt.label}
                          onChange={() => setAnswers(p => ({ ...p, [q._id]: opt.label }))} className="sr-only" />
                        <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${ans === opt.label ? 'bg-blue-600 border-blue-600 text-white' : dark ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'}`}>{opt.label}</span>
                        <span className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True','False'].map(v => (
                      <button key={v} type="button" onClick={() => setAnswers(p => ({ ...p, [q._id]: v }))}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition border ${ans === v ? 'bg-blue-600 border-blue-600 text-white' : dark ? 'border-slate-700 text-slate-300 hover:border-blue-500' : 'border-gray-200 text-gray-700 hover:border-blue-400'}`}>{v}</button>
                    ))}
                  </div>
                )}

                {/* Short / Essay */}
                {(q.type === 'short_answer' || q.type === 'essay') && (
                  <textarea value={ans} onChange={e => setAnswers(p => ({ ...p, [q._id]: e.target.value }))}
                    rows={q.type === 'essay' ? 4 : 2} placeholder="Type your answer…"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${dark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : `Submit Exam (${answered}/${qs.length} answered)`}
          </button>
        </div>
      </div>
    </div>
  );
}
