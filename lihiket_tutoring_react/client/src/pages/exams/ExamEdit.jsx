import { useState, useEffect } from 'react';
import { updateExam, getExam } from '../../api/exam.api';
import toast from 'react-hot-toast';
import ExamForm from './ExamForm';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function ExamEdit({ exam, subjects, onClose, onUpdated, theme }) {
  const [saving,   setSaving]   = useState(false);
  const [full,     setFull]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const dark = theme === 'dark';

  // Fetch full exam with populated questions before opening form
  useEffect(() => {
    if (!exam?._id) return;
    setLoading(true);
    setFetchErr('');
    getExam(exam._id)
      .then(res => {
        const data = res.data || res;
        // Normalize questions: { question: obj, marks } → flat
        const normalized = {
          ...data,
          questions: (data.questions || []).map(entry => {
            if (entry.question && typeof entry.question === 'object') return { ...entry.question, marks: entry.marks ?? entry.question.marks ?? 1 };
            return entry;
          }).filter(q => q && q._id),
        };
        setFull(normalized);
      })
      .catch(err => setFetchErr(err.message || 'Failed to load exam'))
      .finally(() => setLoading(false));
  }, [exam?._id]);

  if (!exam) return null;

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await updateExam(exam._id, data);
      toast.success('Exam updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <FiLoader className="w-8 h-8 text-amber-500 animate-spin" />
        <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Loading exam data…</p>
      </div>
    </div>
  );

  if (fetchErr) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl shadow-2xl border max-w-sm w-full text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <FiAlertCircle className="w-9 h-9 text-red-400" />
        <p className="text-sm text-red-500 font-semibold">{fetchErr}</p>
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">Close</button>
      </div>
    </div>
  );

  return (
    <ExamForm
      title="Edit Exam"
      initial={full}
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
