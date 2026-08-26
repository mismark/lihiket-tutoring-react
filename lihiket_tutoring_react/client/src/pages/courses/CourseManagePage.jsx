import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getSubjectById } from '../../api/subject.api';
import { getCoursesBySubject } from '../../api/course.api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiEye, FiBook } from 'react-icons/fi';

import CourseCard   from './CourseCard';
import CourseCreate from './CourseCreate';
import CourseEdit   from './CourseEdit';
import CourseDelete from './CourseDelete';

export default function CourseManagePage() {
  const { subjectSlug: subjectId } = useParams();
  const navigate      = useNavigate();
  const { theme }     = useTheme();
  const dark          = theme === 'dark';

  const [subject,  setSubject]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editC,      setEditC]      = useState(null);
  const [deleteC,    setDeleteC]    = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, courseRes] = await Promise.all([
        getSubjectById(subjectId),
        getCoursesBySubject(subjectId),
      ]);
      setSubject(subRes.data);
      setCourses(courseRes.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally { setLoading(false); }
  }, [subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)}
            className={`p-2 rounded-xl border transition flex-shrink-0 ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>ðŸ“– Courses</h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {subject
                ? <><span className="font-semibold">{subject.name}</span> Â· {subject.gradeLevel} Â· {loading ? 'â€¦' : `${courses.length} courses, ${totalLessons} lessons`}</>
                : 'â€¦'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/subjects/${subjectId}/classroom`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
              <FiEye className="w-4 h-4" /> Preview
            </Link>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm">
              <FiPlus className="w-4 h-4" /> New Course
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Courses',   value: courses.length,                              color: 'text-blue-500'    },
              { label: 'Lessons',   value: totalLessons,                                color: 'text-emerald-500' },
              { label: 'Published', value: courses.filter(c => c.isPublished).length,  color: 'text-amber-500'   },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className={`text-xs font-medium mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiBook className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No courses yet</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
              <FiPlus className="w-4 h-4" /> Create First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                subjectId={subjectId}
                onEdit={setEditC}
                onDelete={setDeleteC}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CourseCreate subjectId={subjectId} theme={theme}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadData(); }} />
      )}
      {editC && (
        <CourseEdit course={editC} theme={theme}
          onClose={() => setEditC(null)}
          onUpdated={() => { setEditC(null); loadData(); }} />
      )}
      {deleteC && (
        <CourseDelete course={deleteC} theme={theme}
          onClose={() => setDeleteC(null)}
          onDeleted={() => { setDeleteC(null); loadData(); }} />
      )}
    </div>
  );
}

