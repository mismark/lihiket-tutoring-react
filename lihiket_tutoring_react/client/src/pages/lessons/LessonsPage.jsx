import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getLessonsByCourse } from '../../api/lesson.api';
import { getCourse } from '../../api/course.api';
import toast from 'react-hot-toast';
import {
  FiBookOpen, FiVideo, FiFileText, FiLayers,
  FiEye, FiEyeOff, FiCheckCircle, FiBook,
  FiZap, FiAward, FiList,
} from 'react-icons/fi';

import SubjectPageLayout, { SkeletonCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';
import LessonCard   from './LessonCard';
import LessonCreate from './LessonCreate';
import LessonEdit   from './LessonEdit';
import LessonDelete from './LessonDelete';
import LessonView   from './LessonView';

const TYPE_TABS = [
  { value: '',         label: 'All'      },
  { value: 'video',    label: 'Video'    },
  { value: 'document', label: 'Document' },
  { value: 'text',     label: 'Text'     },
];

const NAV_LINKS = (subjectId, courseSlug) => [
  { to: `/subjects/${subjectId}/courses`,
    label: 'Courses', icon: FiBook,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${subjectId}/courses/${courseSlug}/documents`,
    label: 'Documents', icon: FiFileText,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
  { to: `/subjects/${subjectId}/quizzes`,
    label: 'Quizzes', icon: FiZap,
    color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
  { to: `/subjects/${subjectId}/exams`,
    label: 'Exams', icon: FiAward,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
  { to: `/subjects/${subjectId}/assignments`,
    label: 'Assignments', icon: FiList,
    color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-blue-500/10' },
];

export default function LessonsPage() {
  const { subjectSlug: subjectId, courseSlug: courseId } = useParams();
  const { theme } = useTheme();
  const { user }  = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [course,  setCourse]  = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showDrafts, setShowDrafts] = useState(true);
  const [view,       setView]       = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewL,      setViewL]      = useState(null);
  const [editL,      setEditL]      = useState(null);
  const [deleteL,    setDeleteL]    = useState(null);

  const loadData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        getCourse(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load lessons');
    } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = lessons.filter(l => {
    const q = search.trim().toLowerCase();
    return (
      (!q || l.title.toLowerCase().includes(q) || l.content?.toLowerCase().includes(q)) &&
      (!typeFilter || l.type === typeFilter) &&
      (showDrafts || l.isPublished)
    );
  });

  const hasFilter = search || typeFilter || !showDrafts;

  const stats = loading ? [] : [
    { value: lessons.length,                         label: 'Total',     color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',     icon: FiBookOpen    },
    { value: lessons.filter(l => l.isPublished).length, label: 'Published', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle },
    { value: lessons.filter(l => l.type === 'video').length,    label: 'Videos',    color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400', icon: FiVideo    },
    { value: lessons.filter(l => l.type === 'document').length, label: 'Documents', color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',   icon: FiFileText },
  ];

  // Build a fake subject for the breadcrumb (course title becomes the subject name)
  const fakeSubject = course
    ? { name: course.title, gradeLevel: '', _id: course.subject }
    : null;

  return (
    <>
      <SubjectPageLayout
        subject={fakeSubject}
        subjectSlug={subjectId}
        section="Lessons"
        icon={FiBookOpen}
        gradient="from-blue-500 to-cyan-500"
        accentColor="blue"
        total={lessons.length}
        loading={loading}
        itemLabel="lesson"
        stats={stats}
        search={search}
        onSearch={setSearch}
        filterSlot={
          <FilterTabs
            tabs={TYPE_TABS}
            active={typeFilter}
            onChange={setTypeFilter}
            activeColor="bg-blue-600"
          />
        }
        toolbarRight={
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={() => setShowDrafts(v => !v)}
                title={showDrafts ? 'Hide drafts' : 'Show drafts'}
                className={`p-2 rounded-xl border transition ${
                  showDrafts
                    ? 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                    : 'bg-amber-500 border-amber-500 text-white'
                }`}>
                {showDrafts ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
              </button>
            )}
            <ViewToggle view={view} onChange={setView} />
          </div>
        }
        navLinks={NAV_LINKS(subjectId, courseId)}
        showAction={canManage}
        actionLabel="Add Lesson"
        onAction={() => setShowCreate(true)}
      >
        {/* Result count */}
        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {filtered.length} of {lessons.length} lessons
            </p>
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setShowDrafts(true); }}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-8 h-8 text-blue-400 opacity-60" />
            </div>
            <p className="font-semibold text-lg text-gray-700 dark:text-slate-300">
              {hasFilter ? 'No lessons match your filters' : 'No lessons yet'}
            </p>
            <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
              {hasFilter
                ? 'Try different filters'
                : canManage
                  ? 'Click "+ Add Lesson" to create the first lesson'
                  : "Your teacher hasn't added lessons yet"}
            </p>
            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setTypeFilter(''); setShowDrafts(true); }}
                className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(lesson => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                index={lessons.indexOf(lesson)}
                onView={setViewL}
                onEdit={canManage   ? setEditL   : () => {}}
                onDelete={canManage ? setDeleteL : () => {}}
                theme={theme}
              />
            ))}
          </div>
        )}
      </SubjectPageLayout>

      {showCreate && (
        <LessonCreate
          courses={course ? [course] : []}
          defaultCourseId={courseId}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadData(); }}
          theme={theme}
        />
      )}
      {editL && (
        <LessonEdit
          lesson={editL}
          courses={course ? [course] : []}
          onClose={() => setEditL(null)}
          onUpdated={() => { setEditL(null); loadData(); }}
          theme={theme}
        />
      )}
      {deleteL && (
        <LessonDelete
          lesson={deleteL}
          onClose={() => setDeleteL(null)}
          onDeleted={() => { setDeleteL(null); loadData(); }}
          theme={theme}
        />
      )}
      {viewL && (
        <LessonView
          lesson={viewL}
          onClose={() => setViewL(null)}
          theme={theme}
        />
      )}
    </>
  );
}
