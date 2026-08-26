import { useState } from 'react';
import { deleteSubject } from '../../api/subject.api';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';

export default function SubjectDelete({ isOpen, onClose, subject, onSuccess, theme }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!subject) return;

    setLoading(true);
    try {
      await deleteSubject(subject._id);
      toast.success('Subject deleted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl w-full max-w-md`}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTrash2 className={`w-5 h-5 text-red-500`} />
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delete Subject
            </h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className={`flex items-start gap-4 mb-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border`}>
            <FiAlertTriangle className={`w-6 h-6 text-red-500 flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Are you sure you want to delete this subject?
              </p>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                This action cannot be undone. All data associated with this subject will be permanently removed.
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'} mb-4`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
              Subject: <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{subject.name}</span>
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              Code: <span className="font-mono">{subject.code}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete Subject</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
