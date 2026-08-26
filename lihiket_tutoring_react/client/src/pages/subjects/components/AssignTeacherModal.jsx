import { FiUserCheck, FiUserPlus, FiX, FiUsers } from 'react-icons/fi';

export default function AssignTeacherModal({ isOpen, onClose, teachers, onAssign, onRemove, selectedSubject, theme }) {
  if (!isOpen || !selectedSubject) return null;

  const assignedIds = new Set(
    (selectedSubject.assignedTeachers || []).map((t) => t._id?.toString())
  );

  const assignedTeachers = teachers.filter((t) => assignedIds.has(t._id?.toString()));
  const unassignedTeachers = teachers.filter((t) => !assignedIds.has(t._id?.toString()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Manage Teachers
            </h2>
            <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {selectedSubject.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Already-assigned teachers */}
          {assignedTeachers.length > 0 && (
            <div>
              <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <FiUserCheck className="w-3.5 h-3.5" /> Assigned ({assignedTeachers.length})
              </p>
              <div className="space-y-2">
                {assignedTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {teacher.email}
                      </p>
                    </div>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(teacher._id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unassigned teachers to assign */}
          <div>
            <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiUserPlus className="w-3.5 h-3.5" /> Available to assign
            </p>
            {unassignedTeachers.length === 0 ? (
              <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                {teachers.length === 0 ? 'No verified teachers available' : 'All teachers are already assigned'}
              </p>
            ) : (
              <div className="space-y-2">
                {unassignedTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-600 hover:border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    } transition`}
                  >
                    <div>
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {teacher.email}
                      </p>
                    </div>
                    <button
                      onClick={() => onAssign(teacher._id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 rounded-xl font-semibold transition ${
              theme === 'dark'
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
