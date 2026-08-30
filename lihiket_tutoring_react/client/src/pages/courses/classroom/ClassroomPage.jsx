import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../store/theme/ThemeContext';
import { useAuth }  from '../../../store/auth/AuthContext';
import { getSubjectById }      from '../../../api/subject.api';
import { getCoursesBySubject } from '../../../api/course.api';
import {
  FiArrowLeft, FiBook, FiCheckCircle, FiUser,
  FiAlertCircle, FiLock, FiLayers, FiBookOpen,
  FiZap, FiAward, FiFileText, FiRadio, FiVideo,
} from 'react-icons/fi';
import CourseAccordion from './CourseAccordion';
import { StatCard } from '../../../components/shared/SubjectPageLayout';

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 animate-pulse shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="space-y-2">
        <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/60 rounded" />
      </div>
    </div>
  );
}
function SkeletonAccordion() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-24 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-700/60 rounded" />
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full" />
      </div>
    </div>
  );
}

export default function ClassroomPage() {
  const { subjectSlug: subjectId } = useParams();
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const dark       = theme === 'dark';

  const [subject, setSubject] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

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
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);
  const totalVideos  = courses.reduce((s, c) => s + (c.lessons?.filter(l => l.type === 'video').length || 0), 0);
  const totalDocs    = courses.reduce((s, c) => s + (c.lessons?.filter(l => l.type === 'document').length || 0), 0);

  // cross-nav links
  const navLinks = [
    { to: `/subjects/${subjectId}/courses`,      label: 'Courses',      icon: FiBook,     color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
    { to: `/subjects/${subjectId}/quizzes`,      label: 'Quizzes',      icon: FiZap,      color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
    { to: `/subjects/${subjectId}/exams`,        label: 'Exams',        icon: FiAward,    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
    { to: `/subjects/${subjectId}/assignments`,  label: 'Assignments',  icon: FiFileText, color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-blue-500/10' },
    { to: `/subjects/${subjectId}/live-classes`, label: 'Live',         icon: FiRadio,    color: 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate(-1)}
              className="p-2 rounded-xl border transition flex-shrink-0 shadow-sm
                         bg-white border-slate-200 text-slate-600 hover:bg-slate-50
                         dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Link to="/subjects" className="hover:text-blue-500 transition">Subjects</Link>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                {subject?.name || '…'}
              </span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">Classroom</span>
            </nav>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                <FiBookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {subject?.name || 'Classroom'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subject?.gradeLevel && <span className="font-medium">{subject.gradeLevel}</span>}
                  {subject?.category   && <> · {subject.category}</>}
                  {!loading && courses.length > 0 && (
                    <> · <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {courses.length} course{courses.length !== 1 ? 's' : ''}, {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                    </span></>
                  )}
                </p>
              </div>
            </div>

            {/* Cross-nav links */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {navLinks.map(nl => (
                <Link key={nl.to} to={nl.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition ${nl.color}`}>
                  <nl.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{nl.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* ── Stats ── */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard value={courses.length}  label="Courses"   color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"         icon={FiBook}      />
            <StatCard value={totalLessons}    label="Lessons"   color="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"  icon={FiBookOpen}  />
            <StatCard value={totalVideos}     label="Videos"    color="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"  icon={FiVideo}     />
            <StatCard value={totalDocs}       label="Documents" color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"      icon={FiFileText}  />
          </div>
        )}
        {loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
          </div>
        )}

        {/* ── Subject info card ── */}
        {!loading && !error && subject && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FiBook className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  {subject.gradeLevel && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      {subject.gradeLevel}
                    </span>
                  )}
                  {subject.category && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                      {subject.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Enrolled
                  </span>
                </div>
                {subject.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{subject.description}</p>
                )}
                {subject.assignedTeachers?.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <FiUser className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    {subject.assignedTeachers.map(t => (
                      <span key={t._id} className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {t.firstName} {t.lastName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">Access Denied</p>
            <p className="text-sm mt-2 text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{error}</p>
            <Link to="/subjects"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
              Browse Subjects
            </Link>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && courses.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No courses yet</p>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              Your teacher hasn't added any courses yet.
            </p>
          </div>
        )}

        {/* ── Loading courses ── */}
        {loading && !error && (
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            {[1,2,3].map(i => <SkeletonAccordion key={i} />)}
          </div>
        )}

        {/* ── Course list ── */}
        {!loading && !error && courses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Course Content
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <FiLayers className="w-3.5 h-3.5" />
                {courses.length} course{courses.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </div>
            </div>
            {courses.map(course => (
              <CourseAccordion key={course._id} course={course} theme={theme} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
