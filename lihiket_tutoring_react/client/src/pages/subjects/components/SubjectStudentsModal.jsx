import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../store/auth/AuthContext';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';
import {
  FiX, FiUsers, FiSearch, FiMail, FiPhone,
  FiTrash2, FiRefreshCw, FiUser, FiCalendar,
} from 'react-icons/fi';

export default function SubjectStudentsModal({ isOpen, onClose, subject, theme }) {
  const dark = theme === 'dark';
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [removing,    setRemoving]    = useState(null); // studentId being removed

  const fetchEnrollments = useCallback(async () => {
    if (!subject?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/enrollments/subject/${subject._id}`);
      setEnrollments(res.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load enrolled students');
    } finally {
      setLoading(false);
    }
  }, [subject?._id]);

  useEffect(() => {
    if (isOpen) { setSearch(''); fetchEnrollments(); }
  }, [isOpen, fetchEnrollments]);

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from "${subject.name}"?`)) return;
    setRemoving(studentId);
    try {
      await axios.delete(`/enrollments/subject/${subject._id}/student/${studentId}`);
      toast.success(`${studentName} removed from subject`);
      setEnrollments(prev => prev.filter(e => e.student._id !== studentId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove student');
    } finally {
      setRemoving(null);
    }
  };

  if (!isOpen || !subject) return null;

  const filtered = enrollments.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const s = e.student;
    return (
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q)  ||
      s.email?.toLowerCase().includes(q)     ||
      s.gradeLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* ── Header ── */}
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Enrolled Students
            </h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {subject.name} · {subject.gradeLevel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEnrollments}
              title="Refresh"
              className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Search + count bar ── */}
        <div className={`px-6 py-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or grade…"
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
              dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {loading ? '…' : `${filtered.length} / ${enrollments.length}`}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading students…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FiUsers className={`w-12 h-12 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                {search ? 'No students match your search' : 'No students enrolled yet'}
              </p>
              <p className={`text-sm ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
                {search ? 'Try a different search term' : 'Students will appear here once they enroll'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(({ student, enrolledAt }) => {
                const fullName = `${student.firstName} ${student.lastName}`;
                const isRemoving = removing === student._id;
                return (
                  <div
                    key={student._id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition ${
                      dark ? 'bg-slate-700/40 border-slate-600 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {fullName}
                        </p>
                        {student.gradeLevel && (
                          <span className="px-1.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                            {student.gradeLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {student.email && (
                          <a
                            href={`mailto:${student.email}`}
                            className={`flex items-center gap-1 text-xs hover:text-blue-500 transition-colors ${dark ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            <FiMail className="w-3 h-3" /> {student.email}
                          </a>
                        )}
                        {student.phone && (
                          <a
                            href={`tel:${student.phone}`}
                            className={`flex items-center gap-1 text-xs hover:text-emerald-500 transition-colors ${dark ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            <FiPhone className="w-3 h-3" /> {student.phone}
                          </a>
                        )}
                        {enrolledAt && (
                          <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                            <FiCalendar className="w-3 h-3" />
                            Enrolled {new Date(enrolledAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button — admin only */}
                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(student._id, fullName)}
                        disabled={isRemoving}
                        title="Remove from subject"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50 flex-shrink-0"
                      >
                        {isRemoving
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <FiTrash2 className="w-4 h-4" />
                        }
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
