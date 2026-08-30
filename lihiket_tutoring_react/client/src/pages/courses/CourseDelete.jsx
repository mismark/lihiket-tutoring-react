import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { deleteCourse } from '../../api/course.api';
import toast            from 'react-hot-toast';

export default function CourseDelete({ course, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!course) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCourse(course._id);
      toast.success('Course and all its lessons deleted');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">Delete Course</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning box */}
          <div className="flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/70">
                Deleting <strong>"{course.title}"</strong> will permanently remove the course
                and <strong>all {course.lessons?.length || 0} lesson{(course.lessons?.length || 0) !== 1 ? 's' : ''}</strong> inside it.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition shadow-md shadow-red-600/20 disabled:opacity-50">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
              : <><FiTrash2 className="w-4 h-4" /> Delete Course</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
