import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth  } from '../../store/auth/AuthContext';
import { getSubjectById } from '../../api/subject.api';
import { getLiveClasses } from '../../api/liveclass.api';
import useLiveClassStatus from '../../hooks/useLiveClassStatus';
import toast from 'react-hot-toast';
import {
  FiRadio, FiBook, FiZap, FiAward, FiFileText,
  FiCheckCircle, FiClock, FiCalendar,
} from 'react-icons/fi';

import SubjectPageLayout, { SkeletonCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';
import { EmptyState } from '../quizzes/SubjectQuizzesPage';
import LiveClassCard   from './LiveClassCard';
import LiveClassCreate from './LiveClassCreate';
import LiveClassEdit   from './LiveClassEdit';
import LiveClassDelete from './LiveClassDelete';
import LiveClassView   from './LiveClassView';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live',      label: 'Live Now'  },
  { value: 'ended',     label: 'Ended'     },
  { value: 'cancelled', label: 'Cancelled' },
];

const NAV_LINKS = (slug) => [
  { to: `/subjects/${slug}/courses`,     label: 'Courses',     icon: FiBook,
    color: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600' },
  { to: `/subjects/${slug}/quizzes`,     label: 'Quizzes',     icon: FiZap,
    color: 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-violet-400 dark:hover:bg-violet-500/10' },
  { to: `/subjects/${slug}/exams`,       label: 'Exams',       icon: FiAward,
    color: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400 dark:hover:bg-amber-500/10' },
  { to: `/subjects/${slug}/assignments`, label: 'Assignments', icon: FiFileText,
    color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-blue-500/10' },
];

export default function SubjectLiveClassesPage() {
  const { subjectSlug } = useParams();
  const { theme }       = useTheme();
  const { user }        = useAuth();
  const canManage       = user?.role === 'admin' || user?.role === 'teacher';

  const [subject,   setSubject]   = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [view,      setView]      = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewLC,     setViewLC]     = useState(null);
  const [editLC,     setEditLC]     = useState(null);
  const [deleteLC,   setDeleteLC]   = useState(null);

  useEffect(() => {
    getSubjectById(subjectSlug)
      .then(res => { setSubject(res.data); setSubjectId(res.data._id); })
      .catch(() => toast.error('Subject not found'));
  }, [subjectSlug]);

  const loadClasses = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const params = { subject: subjectId };
      if (statusF) params.status = statusF;
      const res = await getLiveClasses(params);
      setClasses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load live classes');
    } finally { setLoading(false); }
  }, [subjectId, statusF]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  // Real-time: server job pushes scheduled→live→ended every 30s
  const handleStatusChange = useCallback((id, status) => {
    setClasses(prev => prev.map(c => c._id === id ? { ...c, status } : c));
  }, []);
  useLiveClassStatus(handleStatusChange);

  const filtered  = classes.filter(c =>
    !search.trim() ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase())
  );
  const liveNow   = classes.filter(c => c.status === 'live').length;
  const scheduled = classes.filter(c => c.status === 'scheduled').length;
  const ended     = classes.filter(c => c.status === 'ended').length;
  const hasFilter = search || statusF;

  const stats = loading ? [] : [
    { value: classes.length, label: 'Total',     color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',         icon: FiRadio    },
    { value: liveNow,        label: 'Live Now',   color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',         icon: FiRadio    },
    { value: scheduled,      label: 'Scheduled',  color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',     icon: FiCalendar },
    { value: ended,          label: 'Recordings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', icon: FiCheckCircle },
  ];

  return (
    <>
      <SubjectPageLayout
        subject={subject}
        subjectSlug={subjectSlug}
        section="Live Classes"
        icon={FiRadio}
        gradient="from-red-500 to-rose-600"
        accentColor="red"
        total={classes.length}
        loading={loading}
        itemLabel="class"
        stats={stats}
        search={search}
        onSearch={setSearch}
        filterSlot={
          <FilterTabs
            tabs={STATUS_TABS}
            active={statusF}
            onChange={setStatusF}
            activeColor="bg-red-600"
          />
        }
        toolbarRight={<ViewToggle view={view} onChange={setView} />}
        navLinks={NAV_LINKS(subjectSlug)}
        showAction={canManage}
        actionLabel="Schedule Class"
        onAction={() => setShowCreate(true)}
      >
        {/* Live now banner */}
        {!loading && liveNow > 0 && !statusF && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 -mt-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {liveNow} class{liveNow !== 1 ? 'es' : ''} live right now — join before it ends!
            </p>
          </div>
        )}

        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {filtered.length} of {classes.length} classes
            </p>
            <button onClick={() => { setSearch(''); setStatusF(''); }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiRadio}
            color="red"
            hasFilter={hasFilter}
            canManage={canManage}
            noun="live class"
            onCreate={() => setShowCreate(true)}
            onClear={() => { setSearch(''); setStatusF(''); }}
            teacherMsg="Schedule the first live class for this subject"
            studentMsg="Your teacher has not scheduled any live classes yet"
          />
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(lc => (
              <LiveClassCard key={lc._id} lc={lc} canManage={canManage} theme={theme}
                onView={setViewLC} onEdit={setEditLC} onDelete={setDeleteLC} />
            ))}
          </div>
        )}
      </SubjectPageLayout>

      {showCreate && <LiveClassCreate subjects={subject ? [subject] : []} theme={theme}
        onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadClasses(); }} />}
      {editLC   && <LiveClassEdit   liveClass={editLC}   subjects={subject ? [subject] : []} theme={theme}
        onClose={() => setEditLC(null)}   onUpdated={() => { setEditLC(null);   loadClasses(); }} />}
      {deleteLC && <LiveClassDelete liveClass={deleteLC} theme={theme}
        onClose={() => setDeleteLC(null)} onDeleted={() => { setDeleteLC(null); loadClasses(); }} />}
      {viewLC   && <LiveClassView   lc={viewLC} canManage={canManage} theme={theme}
        onClose={() => setViewLC(null)} onEdit={() => { setViewLC(null); setEditLC(viewLC); }} />}
    </>
  );
}
