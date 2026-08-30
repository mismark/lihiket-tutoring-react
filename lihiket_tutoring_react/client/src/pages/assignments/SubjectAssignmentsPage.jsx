import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth  } from '../../store/auth/AuthContext';
import { getSubjectById } from '../../api/subject.api';
import { getAssignments } from '../../api/assignment.api';
import toast from 'react-hot-toast';
import {
  FiFileText, FiCheckCircle, FiClock, FiBook, FiZap, FiAward, FiCalendar, FiRadio,
} from 'react-icons/fi';

import SubjectPageLayout, { SkeletonCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';
import { EmptyState } from '../quizzes/SubjectQuizzesPage';
import AssignmentCard        from './AssignmentCard';
import AssignmentCreate      from './AssignmentCreate';
import AssignmentEdit        from './AssignmentEdit';
import AssignmentDelete      from './AssignmentDelete';
import AssignmentView        from './AssignmentView';
import AssignmentSubmitModal from './AssignmentSubmitModal';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft'     },
  { value: 'closed',    label: 'Closed'    },
];

const NAV_LINKS = (slug) => [
  { to: `/subjects/${slug}/courses`,      label: 'Courses', icon: FiBook,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${slug}/quizzes`,      label: 'Quizzes', icon: FiZap,
    color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
  { to: `/subjects/${slug}/exams`,        label: 'Exams',   icon: FiAward,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
  { to: `/subjects/${slug}/live-classes`, label: 'Live',    icon: FiRadio,
    color: 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-500/10' },
];

export default function SubjectAssignmentsPage() {
  const { subjectSlug } = useParams();
  const { theme }       = useTheme();
  const { user }        = useAuth();
  const canManage       = user?.role === 'admin' || user?.role === 'teacher';

  const [subject,     setSubject]     = useState(null);
  const [subjectId,   setSubjectId]   = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusF,     setStatusF]     = useState('');
  const [view,        setView]        = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewA,      setViewA]      = useState(null);
  const [editA,      setEditA]      = useState(null);
  const [deleteA,    setDeleteA]    = useState(null);
  const [submitA,    setSubmitA]    = useState(null);

  useEffect(() => {
    getSubjectById(subjectSlug)
      .then(res => { setSubject(res.data); setSubjectId(res.data._id); })
      .catch(() => toast.error('Subject not found'));
  }, [subjectSlug]);

  const loadAssignments = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const params = { subject: subjectId };
      if (statusF) params.status = statusF;
      const res = await getAssignments(params);
      setAssignments(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  }, [subjectId, statusF]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const filtered  = assignments.filter(a => !search.trim() || a.title.toLowerCase().includes(search.toLowerCase()));
  const published = assignments.filter(a => a.status === 'published').length;
  const submitted = assignments.filter(a => a.mySubmission).length;
  const hasFilter = search || statusF;

  const stats = loading ? [] : [
    { value: assignments.length, label: 'Total',     color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',       icon: FiFileText    },
    { value: published,          label: 'Published', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle },
    { value: assignments.filter(a => a.status === 'draft').length, label: 'Drafts',
      color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', icon: FiClock },
    { value: submitted,          label: canManage ? 'Submissions' : 'Submitted',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', icon: FiCalendar },
  ];

  return (
    <>
      <SubjectPageLayout
        subject={subject}
        subjectSlug={subjectSlug}
        section="Assignments"
        icon={FiFileText}
        gradient="from-blue-500 to-indigo-600"
        accentColor="blue"
        total={assignments.length}
        loading={loading}
        itemLabel="assignment"
        stats={stats}
        search={search}
        onSearch={setSearch}
        filterSlot={<FilterTabs tabs={STATUS_TABS} active={statusF} onChange={setStatusF} activeColor="bg-blue-600" />}
        toolbarRight={<ViewToggle view={view} onChange={setView} />}
        navLinks={NAV_LINKS(subjectSlug)}
        showAction={canManage}
        actionLabel="Create Assignment"
        onAction={() => setShowCreate(true)}
      >
        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">{filtered.length} of {assignments.length} assignments</p>
            <button onClick={() => { setSearch(''); setStatusF(''); }} className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition">Clear filters</button>
          </div>
        )}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiFileText} color="blue" hasFilter={hasFilter} canManage={canManage} noun="assignment"
            onCreate={() => setShowCreate(true)} onClear={() => { setSearch(''); setStatusF(''); }} />
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(a => (
              <AssignmentCard key={a._id} assignment={a} canManage={canManage} theme={theme}
                onView={setViewA} onEdit={setEditA} onDelete={setDeleteA} onSubmit={setSubmitA} />
            ))}
          </div>
        )}
      </SubjectPageLayout>

      {showCreate && <AssignmentCreate subjects={subject ? [subject] : []} theme={theme} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadAssignments(); }} />}
      {editA   && <AssignmentEdit assignment={editA} subjects={subject ? [subject] : []} theme={theme} onClose={() => setEditA(null)} onUpdated={() => { setEditA(null); loadAssignments(); }} />}
      {deleteA && <AssignmentDelete assignment={deleteA} theme={theme} onClose={() => setDeleteA(null)} onDeleted={() => { setDeleteA(null); loadAssignments(); }} />}
      {viewA   && <AssignmentView assignment={viewA} canManage={canManage} theme={theme}
        onClose={() => setViewA(null)}
        onEdit={() => { setViewA(null); setEditA(viewA); }}
        onSubmit={() => { setViewA(null); setSubmitA(viewA); }} />}
      {submitA && <AssignmentSubmitModal assignment={submitA} theme={theme}
        onClose={() => setSubmitA(null)} onSubmitted={() => { setSubmitA(null); loadAssignments(); }} />}
    </>
  );
}
