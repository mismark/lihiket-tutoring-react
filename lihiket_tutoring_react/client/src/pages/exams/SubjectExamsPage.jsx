import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth  } from '../../store/auth/AuthContext';
import { getSubjectById } from '../../api/subject.api';
import { getExams }       from '../../api/exam.api';
import toast from 'react-hot-toast';
import {
  FiAward, FiCheckCircle, FiClock, FiBook, FiZap, FiFileText, FiRadio,
} from 'react-icons/fi';

import SubjectPageLayout, { SkeletonCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';
import { EmptyState } from '../quizzes/SubjectQuizzesPage';
import ExamCard   from './ExamCard';
import ExamCreate from './ExamCreate';
import ExamEdit   from './ExamEdit';
import ExamDelete from './ExamDelete';
import ExamTake   from './ExamTake';
import ExamView   from './ExamView';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft'     },
  { value: 'closed',    label: 'Closed'    },
];

const NAV_LINKS = (slug) => [
  { to: `/subjects/${slug}/courses`,      label: 'Courses',  icon: FiBook,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${slug}/quizzes`,      label: 'Quizzes',  icon: FiZap,
    color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
  { to: `/subjects/${slug}/assignments`,  label: 'Tasks',    icon: FiFileText,
    color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-blue-500/10' },
  { to: `/subjects/${slug}/live-classes`, label: 'Live',     icon: FiRadio,
    color: 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-500/10' },
];

export default function SubjectExamsPage() {
  const { subjectSlug } = useParams();
  const { theme }       = useTheme();
  const { user }        = useAuth();
  const canManage       = user?.role === 'admin' || user?.role === 'teacher';

  const [subject,   setSubject]   = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [exams,     setExams]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [view,      setView]      = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewE,      setViewE]      = useState(null);
  const [editE,      setEditE]      = useState(null);
  const [deleteE,    setDeleteE]    = useState(null);
  const [takeE,      setTakeE]      = useState(null);

  useEffect(() => {
    getSubjectById(subjectSlug)
      .then(res => { setSubject(res.data); setSubjectId(res.data._id); })
      .catch(() => toast.error('Subject not found'));
  }, [subjectSlug]);

  const loadExams = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const params = { subject: subjectId };
      if (statusF) params.status = statusF;
      const res = await getExams(params);
      setExams(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load exams');
    } finally { setLoading(false); }
  }, [subjectId, statusF]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const filtered  = exams.filter(e => !search.trim() || e.title.toLowerCase().includes(search.toLowerCase()));
  const published = exams.filter(e => e.status === 'published').length;
  const drafts    = exams.filter(e => e.status === 'draft').length;
  const hasFilter = search || statusF;

  const stats = loading ? [] : [
    { value: exams.length, label: 'Total Exams', color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',       icon: FiAward       },
    { value: published,    label: 'Published',   color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle },
    { value: drafts,       label: 'Drafts',      color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',           icon: FiClock       },
    { value: exams.filter(e => e.myResult).length, label: canManage ? 'Submitted' : 'Completed',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', icon: FiAward },
  ];

  return (
    <>
      <SubjectPageLayout
        subject={subject}
        subjectSlug={subjectSlug}
        section="Exams"
        icon={FiAward}
        gradient="from-amber-500 to-orange-600"
        accentColor="amber"
        total={exams.length}
        loading={loading}
        itemLabel="exam"
        stats={stats}
        search={search}
        onSearch={setSearch}
        filterSlot={<FilterTabs tabs={STATUS_TABS} active={statusF} onChange={setStatusF} activeColor="bg-amber-500" />}
        toolbarRight={<ViewToggle view={view} onChange={setView} />}
        navLinks={NAV_LINKS(subjectSlug)}
        showAction={canManage}
        actionLabel="Create Exam"
        onAction={() => setShowCreate(true)}
      >
        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">{filtered.length} of {exams.length} exams</p>
            <button onClick={() => { setSearch(''); setStatusF(''); }} className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition">Clear filters</button>
          </div>
        )}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiAward} color="amber" hasFilter={hasFilter} canManage={canManage} noun="exam"
            onCreate={() => setShowCreate(true)} onClear={() => { setSearch(''); setStatusF(''); }} />
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(exam => (
              <ExamCard key={exam._id} exam={exam} canManage={canManage} theme={theme}
                onView={setViewE} onEdit={setEditE} onDelete={setDeleteE} onTake={setTakeE} />
            ))}
          </div>
        )}
      </SubjectPageLayout>

      {showCreate && <ExamCreate subjects={subject ? [subject] : []} theme={theme} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadExams(); }} />}
      {editE   && <ExamEdit   exam={editE}   subjects={subject ? [subject] : []} theme={theme} onClose={() => setEditE(null)}   onUpdated={() => { setEditE(null);   loadExams(); }} />}
      {deleteE && <ExamDelete exam={deleteE} theme={theme} onClose={() => setDeleteE(null)} onDeleted={() => { setDeleteE(null); loadExams(); }} />}
      {takeE   && <ExamTake   exam={takeE}   theme={theme} onClose={() => setTakeE(null)}   onSubmitted={loadExams} />}
      {viewE   && <ExamView   exam={viewE}   canManage={canManage} theme={theme} onClose={() => setViewE(null)}
        onEdit={() => { setViewE(null); setEditE(viewE); }} onTake={() => { setViewE(null); setTakeE(viewE); }} />}
    </>
  );
}
