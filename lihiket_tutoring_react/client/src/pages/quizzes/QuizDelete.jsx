import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { deleteQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';

export default function QuizDelete({ quiz, onClose, onDeleted, theme }) {
  const dark = theme === 'dark';
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!quiz) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteQuiz(quiz._id);
      toast.success('Quiz deleted');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Delete Quiz</h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className={`flex gap-3 p-4 rounded-xl border ${
            dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
          }`}>
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-1">This cannot be undone</p>
              <p className={dark ? 'text-slate-300' : 'text-slate-600'}>
                Permanently delete <strong>"{quiz.title}"</strong> and{' '}
                <strong>all student results</strong> for this quiz?
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 px-6 py-4 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50
                       bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                       hover:bg-slate-200 dark:hover:bg-slate-600">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50
                       bg-red-600 hover:bg-red-700 text-white shadow-sm
                       flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
              : <><FiTrash2 className="w-4 h-4" /> Delete Quiz</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
