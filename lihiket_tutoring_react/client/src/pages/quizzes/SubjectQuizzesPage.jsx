import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth  } from '../../store/auth/AuthContext';
import { getSubjectById } from '../../api/subject.api';
import { getQuizzes }     from '../../api/quiz.api';
import toast from 'react-hot-toast';
import {
  FiZap, FiAward, FiCheckCircle, FiClock,
  FiBook, FiFileText, FiFilter, FiRadio,
} from 'react-icons/fi';

import SubjectPageLayout, { SkeletonCard, StatCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs  from '../../components/shared/FilterTabs';
import ViewToggle  from '../../components/shared/ViewToggle';
import QuizCard    from './QuizCard';
import QuizCreate  from './QuizCreate';
import QuizEdit    from './QuizEdit';
import QuizDelete  from './QuizDelete';
import QuizTake    from './QuizTake';
import QuizView    from './QuizView';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft'     },
  { value: 'closed',    label: 'Closed'    },
];

const NAV_LINKS = (slug) => [
  { to: `/subjects/${slug}/courses`,      label: 'Courses',      icon: FiBook,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${slug}/exams`,        label: 'Exams',        icon: FiAward,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
  { to: `/subjects/${slug}/assignments`,  label: 'Assignments',  icon: FiFileText,
    color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-blue-500/10' },
  { to: `/subjects/${slug}/live-classes`, label: 'Live',         icon: FiRadio,
    color: 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-500/10' },
];

export default function SubjectQuizzesPage() {
  const { subjectSlug } = useParams();
  const { theme }       = useTheme();
  const { user }        = useAuth();
  const canManage       = user?.role === 'admin' || user?.role === 'teacher';

  const [subject,   setSubject]   = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [quizzes,   setQuizzes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [view,      setView]      = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewQ,      setViewQ]      = useState(null);
  const [editQ,      setEditQ]      = useState(null);
  const [deleteQ,    setDeleteQ]    = useState(null);
  const [takeQ,      setTakeQ]      = useState(null);

  useEffect(() => {
    getSubjectById(subjectSlug)
      .then(res => { setSubject(res.data); setSubjectId(res.data._id); })
      .catch(() => toast.error('Subject not found'));
  }, [subjectSlug]);

  const loadQuizzes = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const params = { subject: subjectId };
      if (statusF) params.status = statusF;
      const res = await getQuizzes(params);
      setQuizzes(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load quizzes');
    } finally { setLoading(false); }
  }, [subjectId, statusF]);

  useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

  const filtered = quizzes.filter(q =>
    !search.trim() || q.title.toLowerCase().includes(search.toLowerCase())
  );
  const published = quizzes.filter(q => q.status === 'published').length;
  const drafts    = quizzes.filter(q => q.status === 'draft').length;
  const attempted = quizzes.filter(q => q.myResult).length;
  const hasFilter = search || statusF;

  const stats = loading ? [] : [
    { value: quizzes.length, label: 'Total Quizzes',  color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',  icon: FiZap          },
    { value: published,      label: 'Published',       color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle },
    { value: drafts,         label: 'Drafts',          color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',         icon: FiClock       },
    ...(canManage ? [] : [
      { value: attempted, label: 'Attempted', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400', icon: FiAward },
    ]),
  ];

  return (
    <>
      <SubjectPageLayout
        subject={subject}
        subjectSlug={subjectSlug}
        section="Quizzes"
        icon={FiZap}
        gradient="from-violet-500 to-purple-600"
        accentColor="violet"
        total={quizzes.length}
        loading={loading}
        itemLabel="quiz"
        stats={stats}
        search={search}
        onSearch={setSearch}
        filterSlot={
          <FilterTabs
            tabs={STATUS_TABS}
            active={statusF}
            onChange={setStatusF}
            activeColor="bg-violet-600"
          />
        }
        toolbarRight={<ViewToggle view={view} onChange={setView} />}
        navLinks={NAV_LINKS(subjectSlug)}
        showAction={canManage}
        actionLabel="Create Quiz"
        onAction={() => setShowCreate(true)}
      >
        {/* Result count */}
        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {filtered.length} of {quizzes.length} quizzes
            </p>
            <button onClick={() => { setSearch(''); setStatusF(''); }}
              className="text-xs font-semibold text-violet-500 hover:text-violet-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {/* Grid / skeleton / empty */}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiZap}
            color="violet"
            hasFilter={hasFilter}
            canManage={canManage}
            noun="quiz"
            onCreate={() => setShowCreate(true)}
            onClear={() => { setSearch(''); setStatusF(''); }}
          />
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(quiz => (
              <QuizCard key={quiz._id} quiz={quiz} canManage={canManage} theme={theme}
                onView={setViewQ} onEdit={setEditQ} onDelete={setDeleteQ} onTake={setTakeQ} />
            ))}
          </div>
        )}
      </SubjectPageLayout>

      {showCreate && <QuizCreate subjects={subject ? [subject] : []} theme={theme}
        onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadQuizzes(); }} />}
      {editQ   && <QuizEdit   quiz={editQ}   subjects={subject ? [subject] : []} theme={theme}
        onClose={() => setEditQ(null)}   onUpdated={() => { setEditQ(null);   loadQuizzes(); }} />}
      {deleteQ && <QuizDelete quiz={deleteQ} theme={theme}
        onClose={() => setDeleteQ(null)} onDeleted={() => { setDeleteQ(null); loadQuizzes(); }} />}
      {takeQ   && <QuizTake   quiz={takeQ}   theme={theme}
        onClose={() => setTakeQ(null)}   onSubmitted={loadQuizzes} />}
      {viewQ   && <QuizView   quiz={viewQ}   canManage={canManage} theme={theme}
        onClose={() => setViewQ(null)}
        onEdit={() => { setViewQ(null); setEditQ(viewQ); }}
        onTake={() => { setViewQ(null); setTakeQ(viewQ); }} />}
    </>
  );
}

// ── Shared empty state (used by all subject pages) ────────────────────────────
export function EmptyState({ icon: Icon, color, hasFilter, canManage, noun, onCreate, onClear, teacherMsg, studentMsg }) {
  const bgColor  = `bg-${color}-100 dark:bg-${color}-500/10`;
  const txtColor = `text-${color}-400`;
  const btnColor = `bg-${color}-600 hover:bg-${color}-700`;
  const lnkColor = `text-${color}-500 hover:text-${color}-600`;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-14 text-center shadow-sm">
      <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${txtColor} opacity-60`} />
      </div>
      <p className="font-semibold text-lg text-gray-700 dark:text-slate-300">
        {hasFilter ? `No ${noun}s match` : `No ${noun}s yet`}
      </p>
      <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
        {hasFilter
          ? 'Try a different filter or clear the search'
          : canManage
            ? (teacherMsg || `Create the first ${noun} for this subject`)
            : (studentMsg || `Your teacher has not published any ${noun}s yet`)}
      </p>
      {canManage && !hasFilter && onCreate && (
        <button onClick={onCreate}
          className={`mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold ${btnColor} text-white transition shadow-sm`}>
          + Create First {noun.charAt(0).toUpperCase() + noun.slice(1)}
        </button>
      )}
      {hasFilter && onClear && (
        <button onClick={onClear} className={`mt-4 text-sm font-semibold ${lnkColor} transition`}>
          Clear filters
        </button>
      )}
    </div>
  );
}
