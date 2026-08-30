import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { getSubjectById }       from '../../api/subject.api';
import { getCoursesBySubject }  from '../../api/course.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiPlus, FiEye, FiBook, FiBookOpen,
  FiSearch, FiX, FiGrid, FiList,
  FiFilter, FiCheckCircle, FiClock, FiZap, FiAward, FiBriefcase, FiRadio,
} from 'react-icons/fi';

import CourseCard   from './CourseCard';
import CourseCreate from './CourseCreate';
import CourseEdit   from './CourseEdit';
import CourseDelete from './CourseDelete';

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({ value, label, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-slate-700/60 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 dark:bg-slate-700/60 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CourseManagePage() {
  const { subjectSlug: subjectId } = useParams();
  const navigate   = useNavigate();
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const dark       = theme === 'dark';

  const canManage  = user?.role === 'admin' || user?.role === 'teacher';

  const [subject,  setSubject]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  // UI state
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all'); // all | published | draft
  const [view,       setView]       = useState('grid');  // grid | list

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editC,      setEditC]      = useState(null);
  const [deleteC,    setDeleteC]    = useState(null);

  // ── Load data ──────────────────────────────────────────────────────────────
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
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalLessons  = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);
  const publishedCount = courses.filter(c => c.isPublished).length;
  const draftCount     = courses.filter(c => !c.isPublished).length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = courses;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    if (filter === 'published') list = list.filter(c =>  c.isPublished);
    if (filter === 'draft')     list = list.filter(c => !c.isPublished);
    return list;
  }, [courses, search, filter]);

  const hasFilter = search || filter !== 'all';

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>

      {/* ── Hero banner ── */}
      <div className={`relative overflow-hidden border-b ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Decorative gradient blob */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb + back */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate(-1)}
              className={`p-2 rounded-xl border transition flex-shrink-0 ${
                dark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                     : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}>
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
              <Link to="/subjects" className="hover:text-blue-500 transition">Subjects</Link>
              <span>/</span>
              <span className="text-gray-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                {subject?.name || '…'}
              </span>
              <span>/</span>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Courses</span>
            </nav>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <FiBook className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {subject?.name || 'Courses'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {subject?.gradeLevel && <span className="font-medium">{subject.gradeLevel}</span>}
                  {subject?.category   && <> · {subject.category}</>}
                  {!loading && <> · <span className="text-blue-600 dark:text-blue-400 font-semibold">{courses.length} courses</span></>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={`/subjects/${subjectId}/quizzes`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-violet-300 border-slate-600 hover:bg-slate-600'
                       : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 shadow-sm'
                }`}>
                <FiZap className="w-4 h-4" /> Quizzes
              </Link>
              <Link to={`/subjects/${subjectId}/exams`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-amber-300 border-slate-600 hover:bg-slate-600'
                       : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm'
                }`}>
                <FiAward className="w-4 h-4" /> Exams
              </Link>
              <Link to={`/subjects/${subjectId}/assignments`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-blue-300 border-slate-600 hover:bg-slate-600'
                       : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-sm'
                }`}>
                <FiBriefcase className="w-4 h-4" /> Assignments
              </Link>
              <Link to={`/subjects/${subjectId}/live-classes`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-red-300 border-slate-600 hover:bg-slate-600'
                       : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-sm'
                }`}>
                <FiRadio className="w-4 h-4" /> Live
              </Link>
              <Link to={`/subjects/${subjectId}/classroom`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                       : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}>
                <FiEye className="w-4 h-4" /> Preview
              </Link>
              {canManage && (
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 text-sm">
                  <FiPlus className="w-4 h-4" /> New Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* ── Stats ── */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat value={courses.length}   label="Total Courses"     color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"     icon={FiBook}         />
            <Stat value={totalLessons}     label="Total Lessons"     color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" icon={FiBookOpen}  />
            <Stat value={publishedCount}   label="Published"         color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"   icon={FiCheckCircle}  />
            <Stat value={draftCount}       label="Drafts"            color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"   icon={FiClock}        />
          </div>
        )}

        {/* ── Toolbar: search + filter + view toggle ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                     : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {[
              { key: 'all',       label: 'All'       },
              { key: 'published', label: 'Published' },
              { key: 'draft',     label: 'Drafts'    },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === f.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <button onClick={() => setView('grid')} title="Grid view"
              className={`p-2 rounded-lg transition ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <FiGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} title="List view"
              className={`p-2 rounded-lg transition ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className={`grid gap-4 ${
            view === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              dark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              {hasFilter
                ? <FiFilter className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                : <FiBook   className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
              }
            </div>
            <h3 className={`font-bold text-lg ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
              {hasFilter ? 'No courses match' : 'No courses yet'}
            </h3>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {hasFilter
                ? 'Try adjusting your search or filters'
                : canManage ? 'Create the first course for this subject' : "Your teacher hasn't added courses yet"
              }
            </p>
            {hasFilter ? (
              <button
                onClick={() => { setSearch(''); setFilter('all'); }}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                Clear filters
              </button>
            ) : canManage ? (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiPlus className="w-4 h-4" /> Create First Course
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="flex items-center justify-between">
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                {hasFilter
                  ? `${filtered.length} of ${courses.length} courses`
                  : `${courses.length} course${courses.length !== 1 ? 's' : ''}`
                }
              </p>
              {hasFilter && (
                <button onClick={() => { setSearch(''); setFilter('all'); }}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition">
                  Clear filters
                </button>
              )}
            </div>

            {/* Cards */}
            <div className={`grid gap-4 ${
              view === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {filtered.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  subjectId={subjectId}
                  view={view}
                  onEdit={setEditC}
                  onDelete={setDeleteC}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CourseCreate
          subjectId={subjectId}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadData(); }}
        />
      )}
      {editC && (
        <CourseEdit
          course={editC}
          onClose={() => setEditC(null)}
          onUpdated={() => { setEditC(null); loadData(); }}
        />
      )}
      {deleteC && (
        <CourseDelete
          course={deleteC}
          onClose={() => setDeleteC(null)}
          onDeleted={() => { setDeleteC(null); loadData(); }}
        />
      )}
    </div>
  );
}
