import { useState, useEffect, useCallback } from 'react';
import { useTheme }  from '../../store/theme/ThemeContext';
import { useAuth }   from '../../store/auth/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { getDocuments }  from '../../api/document.api';
import { getAllSubjects } from '../../api/subject.api';
import { getCourse }     from '../../api/course.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiFilter, FiFileText,
  FiEye, FiEyeOff, FiArrowLeft, FiBook,
  FiBookOpen, FiCheckCircle, FiGrid, FiList, FiZap, FiAward,
} from 'react-icons/fi';

import DocumentCard   from './DocumentCard';
import DocumentCreate from './DocumentCreate';
import DocumentEdit   from './DocumentEdit';
import DocumentDelete from './DocumentDelete';
import DocumentView   from './DocumentView';
import SubjectPageLayout, { SkeletonCard, StatCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';

const CATEGORIES = [
  { value: '',           label: 'All Categories' },
  { value: 'notes',      label: 'Notes'          },
  { value: 'worksheet',  label: 'Worksheet'      },
  { value: 'past_paper', label: 'Past Paper'     },
  { value: 'syllabus',   label: 'Syllabus'       },
  { value: 'reference',  label: 'Reference'      },
  { value: 'other',      label: 'Other'          },
];
const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const LIMIT = 12;

// NAV links for scoped mode
const NAV_LINKS = (slug, courseSlug) => [
  { to: `/subjects/${slug}/courses/${courseSlug}/lessons`,
    label: 'Lessons', icon: FiBookOpen,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${slug}/quizzes`,
    label: 'Quizzes', icon: FiZap,
    color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
  { to: `/subjects/${slug}/exams`,
    label: 'Exams', icon: FiAward,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
];

export default function DocumentsPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { subjectSlug, courseSlug } = useParams();
  const isScoped = !!(subjectSlug && courseSlug);

  const [docs,      setDocs]      = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState('grid');

  const [courseCtx, setCourseCtx] = useState(null);

  // Filters (global mode only)
  const [search,     setSearch]     = useState('');
  const [subjectF,   setSubjectF]   = useState('');
  const [gradeF,     setGradeF]     = useState('');
  const [catF,       setCatF]       = useState('');
  const [showDrafts, setShowDrafts] = useState(canManage);
  const [showFilter, setShowFilter] = useState(false);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [viewDoc,    setViewDoc]    = useState(null);
  const [editDoc,    setEditDoc]    = useState(null);
  const [deleteDoc,  setDeleteDoc]  = useState(null);

  useEffect(() => {
    if (!isScoped) return;
    getCourse(courseSlug).then(res => setCourseCtx(res.data)).catch(() => {});
  }, [isScoped, courseSlug]);

  const loadDocs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (isScoped && courseCtx?._id) {
        params.course = courseCtx._id;
      } else {
        if (search)   params.search     = search;
        if (subjectF) params.subject    = subjectF;
        if (gradeF)   params.gradeLevel = gradeF;
        if (catF)     params.category   = catF;
        if (canManage && !showDrafts) params.isPublished = true;
      }
      const res = await getDocuments(params);
      setDocs(res.data || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load documents');
    } finally { setLoading(false); }
  }, [isScoped, courseCtx?._id, search, subjectF, gradeF, catF, showDrafts, canManage]);

  useEffect(() => { loadDocs(1); }, [loadDocs]);
  useEffect(() => {
    if (isScoped) return;
    getAllSubjects().then(res => setSubjects(res.data || [])).catch(() => {});
  }, [isScoped]);

  const clearFilters = () => { setSearch(''); setSubjectF(''); setGradeF(''); setCatF(''); };
  const hasFilter    = search || subjectF || gradeF || catF;
  const totalPages   = Math.ceil(total / LIMIT);

  const inputCls = `px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white`;

  // ── Build a fake subject object for scoped mode so SubjectPageLayout can render the breadcrumb
  const fakeSubject = courseCtx
    ? { name: courseCtx.title, gradeLevel: '', _id: courseCtx.subject?._id || courseCtx.subject }
    : null;

  const docStats = loading ? [] : [
    { value: total,                                   label: 'Total',     color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',     icon: FiFileText    },
    { value: docs.filter(d => d.isPublished).length, label: 'Published', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle },
    { value: docs.filter(d => !d.isPublished).length,label: 'Drafts',    color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',   icon: FiEye         },
    { value: totalPages > 1 ? `${page}/${totalPages}` : '1', label: 'Page',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', icon: FiBook },
  ];

  const grid = (
    <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {docs.map(doc => (
        <DocumentCard key={doc._id} doc={doc}
          onView={setViewDoc}
          onEdit={canManage ? setEditDoc   : () => {}}
          onDelete={canManage ? setDeleteDoc : () => {}}
          canManage={canManage} theme={theme} />
      ))}
    </div>
  );

  const pagination = totalPages > 1 && (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button onClick={() => loadDocs(page - 1)} disabled={page <= 1}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40
                   bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                   dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
        ← Prev
      </button>
      <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Page {page} of {totalPages}</span>
      <button onClick={() => loadDocs(page + 1)} disabled={page >= totalPages}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40
                   bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                   dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
        Next →
      </button>
    </div>
  );

  const empty = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
        <FiFileText className="w-7 h-7 text-blue-400 opacity-60" />
      </div>
      <p className="font-semibold text-gray-700 dark:text-slate-300">
        {hasFilter ? 'No documents match your filters' : 'No documents yet'}
      </p>
      <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
        {canManage ? 'Click "Upload Document" to add the first one' : 'No documents have been uploaded yet'}
      </p>
      {hasFilter && (
        <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
          Clear filters
        </button>
      )}
    </div>
  );

  const modals = (
    <>
      {showCreate && (
        <DocumentCreate
          subjects={subjects}
          defaultCourseId={courseCtx?._id}
          defaultSubjectId={courseCtx?.subject?._id || courseCtx?.subject}
          theme={theme}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadDocs(1); }}
        />
      )}
      {editDoc  && <DocumentEdit   doc={editDoc}   subjects={subjects} theme={theme} onClose={() => setEditDoc(null)}   onUpdated={() => { setEditDoc(null);   loadDocs(page); }} />}
      {deleteDoc && <DocumentDelete doc={deleteDoc} theme={theme}       onClose={() => setDeleteDoc(null)} onDeleted={() => { setDeleteDoc(null); loadDocs(page); }} />}
      {viewDoc  && <DocumentView   doc={viewDoc}   theme={theme}       onClose={() => setViewDoc(null)} />}
    </>
  );

  // ── SCOPED mode: use SubjectPageLayout ────────────────────────────────────
  if (isScoped) {
    return (
      <>
        <SubjectPageLayout
          subject={fakeSubject}
          subjectSlug={subjectSlug}
          section="Documents"
          icon={FiFileText}
          gradient="from-blue-500 to-indigo-600"
          accentColor="blue"
          total={total}
          loading={loading}
          itemLabel="document"
          stats={docStats}
          search={search}
          onSearch={setSearch}
          filterSlot={null}
          toolbarRight={<ViewToggle view={view} onChange={setView} />}
          navLinks={NAV_LINKS(subjectSlug, courseSlug)}
          showAction={canManage}
          actionLabel="Upload Document"
          onAction={() => setShowCreate(true)}
        >
          {loading ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : docs.length === 0 ? empty
            : <>{grid}{pagination}</>
          }
        </SubjectPageLayout>
        {modals}
      </>
    );
  }

  // ── GLOBAL mode: original layout with full filters ────────────────────────
  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-sm mt-0.5 text-gray-500 dark:text-slate-400">
              {loading ? '…' : `${total} document${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Upload Document
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search documents…"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                           dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                showFilter || hasFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}>
              <FiFilter className="w-4 h-4" />
              Filters{hasFilter ? ` (${[search,subjectF,gradeF,catF].filter(Boolean).length})` : ''}
            </button>
          </div>

          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1 items-center">
              <select value={catF}    onChange={e => setCatF(e.target.value)}    className={`${inputCls} flex-1 min-w-[140px]`}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={gradeF}  onChange={e => setGradeF(e.target.value)}  className={`${inputCls} flex-1 min-w-[120px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
              </select>
              {canManage && (
                <button onClick={() => setShowDrafts(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                    showDrafts
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                      : 'bg-amber-500 text-white border-amber-500'
                  }`}>
                  {showDrafts ? <><FiEye className="w-4 h-4" /> Showing drafts</> : <><FiEyeOff className="w-4 h-4" /> Hiding drafts</>}
                </button>
              )}
              {hasFilter && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition
                             border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : docs.length === 0 ? empty
          : <>{grid}{pagination}</>
        }
      </div>
      {modals}
    </div>
  );
}
