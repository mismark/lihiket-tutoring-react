import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getLessonsByCourse } from '../../api/lesson.api';
import { getCourse } from '../../api/course.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiPlus, FiSearch, FiX,
  FiVideo, FiFileText, FiBookOpen, FiBook,
  FiEye, FiEyeOff, FiFilter,
} from 'react-icons/fi';

import LessonCard   from './LessonCard';
import LessonCreate from './LessonCreate';
import LessonEdit   from './LessonEdit';
import LessonDelete from './LessonDelete';
import LessonView   from './LessonView';

const TYPE_OPTS = [
  { value: '',          label: 'All Types'  },
  { value: 'video',     label: 'Video'      },
  { value: 'document',  label: 'Document'   },
  { value: 'text',      label: 'Text'       },
  { value: 'mixed',     label: 'Mixed'      },
];

export default function LessonsPage() {
  const { subjectSlug: subjectId, courseSlug: courseId } = useParams();
  const navigate      = useNavigate();
  const { theme }     = useTheme();
  const { user }      = useAuth();
  const dark          = theme === 'dark';
  const canManage     = user?.role === 'admin' || user?.role === 'teacher';

  const [course,   setCourse]   = useState(null);
  const [lessons,  setLessons]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  // filters
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [showDrafts,  setShowDrafts]  = useState(true);
  const [showFilter,  setShowFilter]  = useState(false);

  // modals
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
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side filter
  const filtered = lessons.filter(l => {
    const q   = search.trim().toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || l.content?.toLowerCase().includes(q);
    const matchType   = !typeFilter || l.type === typeFilter;
    const matchDraft  = showDrafts || l.isPublished;
    return matchSearch && matchType && matchDraft;
  });

  const hasFilter = search || typeFilter || !showDrafts;

  const stats = {
    total:     lessons.length,
    published: lessons.filter(l => l.isPublished).length,
    videos:    lessons.filter(l => l.type === 'video').length,
    docs:      lessons.filter(l => l.type === 'document').length,
  };

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
         : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(`/subjects/${subjectId}/courses`)}
            className={`p-2 rounded-xl border transition flex-shrink-0 ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              ðŸ“ Lessons
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {course
                ? <><span className="font-semibold">{course.title}</span> Â· {loading ? 'â€¦' : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}`}</>
                : 'â€¦'
              }
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {course && (
              <Link
                to={`/subjects/${subjectId}/classroom`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
              >
                <FiEye className="w-4 h-4" /> Preview
              </Link>
            )}
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm">
                <FiPlus className="w-4 h-4" /> Add Lesson
              </button>
            )}
          </div>
        </div>

        {/* â”€â”€ Stats row â”€â”€ */}
        {!loading && lessons.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total',     value: stats.total,     color: 'text-blue-500'    },
              { label: 'Published', value: stats.published, color: 'text-emerald-500' },
              { label: 'Videos',    value: stats.videos,    color: 'text-indigo-500'  },
              { label: 'Documents', value: stats.docs,      color: 'text-amber-500'   },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className={`text-xs font-medium mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ Search + filter â”€â”€ */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or contentâ€¦"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                showFilter || hasFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}>
              <FiFilter className="w-4 h-4" />
              Filters{hasFilter ? ` (${[search,typeFilter,!showDrafts].filter(Boolean).length})` : ''}
            </button>
          </div>

          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1 items-center">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={`${inputCls} min-w-[140px]`}>
                {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button onClick={() => setShowDrafts(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                  showDrafts
                    ? dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-amber-500 text-white border-amber-500'
                }`}>
                {showDrafts ? <><FiEye className="w-4 h-4" /> Showing drafts</> : <><FiEyeOff className="w-4 h-4" /> Hiding drafts</>}
              </button>
              {hasFilter && (
                <button onClick={() => { setSearch(''); setTypeFilter(''); setShowDrafts(true); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* â”€â”€ Content â”€â”€ */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading lessonsâ€¦</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiBookOpen className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              {hasFilter ? 'No lessons match your filters' : 'No lessons yet'}
            </p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              {hasFilter ? 'Try different filters' : canManage ? 'Click "+ Add Lesson" to create the first lesson' : 'Your teacher hasn\'t added lessons yet'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setTypeFilter(''); setShowDrafts(true); }}
                className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((lesson, idx) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  index={lessons.indexOf(lesson)} // preserve original order index
                  onView={setViewL}
                  onEdit={canManage ? setEditL   : () => {}}
                  onDelete={canManage ? setDeleteL : () => {}}
                  theme={theme}
                />
              ))}
            </div>
            <p className={`text-center text-sm ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {hasFilter ? `${filtered.length} of ${lessons.length} lessons` : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}`}
            </p>
          </>
        )}
      </div>

      {/* â”€â”€ Modals â”€â”€ */}
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
    </div>
  );
}

