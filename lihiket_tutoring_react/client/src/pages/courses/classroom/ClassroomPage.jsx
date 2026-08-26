import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../store/theme/ThemeContext';
import { useAuth } from '../../../store/auth/AuthContext';
import { getSubjectById } from '../../../api/subject.api';
import { getCoursesBySubject } from '../../../api/course.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiBook, FiCheckCircle, FiUser,
  FiAlertCircle, FiLock,
} from 'react-icons/fi';
import CourseAccordion from './CourseAccordion';

export default function ClassroomPage() {
  const { subjectSlug: subjectId }  = useParams();
  const { theme }      = useTheme();
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const dark           = theme === 'dark';

  const [subject,  setSubject]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, courseRes] = await Promise.all([
        getSubjectById(subjectId),
        getCoursesBySubject(subjectId),
      ]);
      setSubject(subRes.data);
      setCourses(courseRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load classroom');
    } finally { setLoading(false); }
  }, [subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)}
            className={`p-2 rounded-xl border transition flex-shrink-0 ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              ðŸ« {subject?.name || 'Classroom'}
            </h1>
            {subject && (
              <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                {subject.gradeLevel} Â· {subject.category} Â· {loading ? 'â€¦' : `${courses.length} course${courses.length !== 1 ? 's' : ''}, ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading classroomâ€¦</p>
          </div>
        )}

        {!loading && error && (
          <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiLock className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold text-lg ${dark ? 'text-slate-300' : 'text-gray-700'}`}>Access Denied</p>
            <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{error}</p>
            <Link to="/subjects" className="inline-block mt-4 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">Browse Subjects</Link>
          </div>
        )}

        {/* Subject banner */}
        {!loading && !error && subject && (
          <div className={`rounded-2xl border p-5 shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <FiBook className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">{subject.gradeLevel}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">{subject.category}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3 inline mr-1" />Enrolled
                  </span>
                </div>
                {subject.description && <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-600'}`}>{subject.description}</p>}
                {subject.assignedTeachers?.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <FiUser className={`w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
                    {subject.assignedTeachers.map(t => (
                      <span key={t._id} className={`text-xs font-medium ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{t.firstName} {t.lastName}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No courses */}
        {!loading && !error && courses.length === 0 && (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No courses yet</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>Your teacher hasn't added any courses yet.</p>
          </div>
        )}

        {/* Courses */}
        {!loading && !error && courses.length > 0 && (
          <div className="space-y-4">
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>ðŸ“– Courses ({courses.length})</h2>
            {courses.map(course => (
              <CourseAccordion key={course._id} course={course} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

