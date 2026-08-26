import { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { deleteUser } from '../../../api/user.api';
import toast from 'react-hot-toast';

export default function UserDeleteModal({ user, onClose, onDeleted, theme }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const fullName   = `${user.firstName} ${user.lastName}`;
  const isReady    = confirm.trim().toLowerCase() === fullName.toLowerCase();
  const dark       = theme === 'dark';

  const handleDelete = async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      await deleteUser(user._id, user.userType);
      toast.success(`${fullName} deleted successfully`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiTrash2 className="w-5 h-5" />
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Delete User</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Warning */}
          <div className={`flex gap-3 p-4 rounded-xl border ${
            dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
          }`}>
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
                This action is permanent and cannot be undone.
              </p>
              <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                All data associated with this account will be permanently removed from the system.
              </p>
            </div>
          </div>

          {/* User summary */}
          <div className={`p-4 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Deleting account:</p>
            <p className={`text-base font-bold mt-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{fullName}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
              dark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
            }`}>{user.userType}</span>
          </div>

          {/* Confirmation input */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              Type <span className="font-bold text-red-500">{fullName}</span> to confirm deletion
            </label>
            <input
              type="text"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={fullName}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                isReady
                  ? 'border-red-500 focus:ring-red-500/30'
                  : dark
                    ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isReady || loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
                : <><FiTrash2 className="w-4 h-4" /> Delete Permanently</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
