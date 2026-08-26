import { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { deleteCourse } from '../../api/course.api';
import toast from 'react-hot-toast';

export default function CourseDelete({ course, onClose, onDeleted, theme }) {
  const dark = theme === 'dark';
  const [loading, setLoading] = useState(false);
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
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiTrash2 className="w-5 h-5" />
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Delete Course</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className={`flex gap-3 p-4 rounded-xl border ${dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              This will permanently delete <strong>"{course.title}"</strong> and all its lessons. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</> : <><FiTrash2 className="w-4 h-4" /> Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
