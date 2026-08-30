import { useState, useEffect } from 'react';
import { updateQuiz, getQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';
import QuizForm from './QuizForm';
import { FiLoader } from 'react-icons/fi';

export default function QuizEdit({ quiz, subjects, onClose, onUpdated, theme }) {
  const [saving,   setSaving]   = useState(false);
  const [full,     setFull]     = useState(null);   // fully-populated quiz with questions
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState('');

  // Fetch the full quiz (with populated questions) the moment the modal opens
  useEffect(() => {
    if (!quiz?._id) return;
    setLoading(true);
    setFetchErr('');

    getQuiz(quiz._id)
      .then(res => {
        const data = res.data || res;
        // Normalize: questions may come as { question: { _id, text, ... }, marks }
        // Flatten to plain question objects so QuizForm can work with them directly
        const normalized = {
          ...data,
          questions: (data.questions || []).map(entry => {
            // populated: entry = { question: { _id, text, marks, ... }, marks }
            if (entry.question && typeof entry.question === 'object') {
              return { ...entry.question, marks: entry.marks ?? entry.question.marks ?? 1 };
            }
            // already flat (unlikely but safe)
            return entry;
          }).filter(q => q && q._id),
        };
        setFull(normalized);
      })
      .catch(err => setFetchErr(err.message || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [quiz?._id]);

  if (!quiz) return null;

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await updateQuiz(quiz._id, data);
      toast.success('Quiz updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const dark = theme === 'dark';

  // Show a loading overlay while fetching the full quiz
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            Loading quiz data…
          </p>
        </div>
      </div>
    );
  }

  // Show error if fetch failed
  if (fetchErr) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border max-w-sm w-full text-center ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <p className="text-red-500 font-semibold">{fetchErr}</p>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizForm
      title="Edit Quiz"
      initial={full}
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
