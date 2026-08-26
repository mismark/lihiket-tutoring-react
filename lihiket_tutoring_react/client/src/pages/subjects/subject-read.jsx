import { useState, useEffect } from 'react';
import { getSubjectById } from '../../api/subject.api';
import { FiBook, FiCode, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SubjectRead({ subjectId, theme, onBack }) {
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubject();
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await getSubjectById(subjectId);
      setSubject(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subject details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-12 text-center`}>
        <FiBook className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{error || 'Subject not found'}</p>
        <button
          onClick={onBack}
          className={`mt-4 px-4 py-2 rounded-lg font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm`}>
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Subject Details
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <FiBook className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {subject.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                <FiCode className="w-3.5 h-3.5" />
                {subject.code}
              </span>
              {subject.gradeLevel && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  {subject.gradeLevel}
                </span>
              )}
              {subject.category && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                  {subject.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {subject.description && (
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Description
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
              {subject.description}
            </p>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            Price
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            !subject.price || subject.price === 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}>
            {!subject.price || subject.price === 0 ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
          </span>
        </div>

        {subject.assignedTeachers && subject.assignedTeachers.length > 0 && (
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Assigned Teachers
            </h4>
            <div className="space-y-2">
              {subject.assignedTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {teacher.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Created: {new Date(subject.createdAt).toLocaleDateString()}
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Last Updated: {new Date(subject.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
