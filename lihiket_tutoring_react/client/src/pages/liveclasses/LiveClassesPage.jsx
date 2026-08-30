import { useState, useEffect, useCallback } from 'react';
import useLiveClassStatus from '../../hooks/useLiveClassStatus';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getLiveClasses } from '../../api/liveclass.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiRadio, FiCalendar,
  FiCheckCircle, FiClock,
} from 'react-icons/fi';

import LiveClassCard   from './LiveClassCard';
import LiveClassCreate from './LiveClassCreate';
import LiveClassEdit   from './LiveClassEdit';
import LiveClassDelete from './LiveClassDelete';
import LiveClassView   from './LiveClassView';
import FilterTabs  from '../../components/shared/FilterTabs';
import ViewToggle  from '../../components/shared/ViewToggle';
import { SkeletonCard, StatCard } from '../../components/shared/SubjectPageLayout';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live',      label: 'Live Now'  },
  { value: 'ended',     label: 'Ended'     },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function LiveClassesPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [classes,  setClasses]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('');
  const [view,     setView]     = useState('grid');

  const [showCreate, setShowCreate] = useState(false);
  const [viewLC,     setViewLC]     = useState(null);
  const [editLC,     setEditLC]     = useState(null);
  const [deleteLC,   setDeleteLC]   = useState(null);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const res = await getLiveClasses(params);
      setClasses(res.data || []);
    } catch (err) { toast.error(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [statusF]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => {
    getAllSubjects().then(r => setSubjects(r.data || [])).catch(() => {});
  }, []);

  // ── Real-time status updates from server job (scheduled→live→ended) ──────
  const handleStatusChange = useCallback((id, status) => {
    setClasses(prev => prev.map(c => c._id === id ? { ...c, status } : c));
  }, []);
  useLiveClassStatus(handleStatusChange);

  const filtered  = classes.filter(c =>
    !search.trim() ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const liveNow   = classes.filter(c => c.status === 'live').length;
  const scheduled = classes.filter(c => c.status === 'scheduled').length;
  const ended     = classes.filter(c => c.status === 'ended').length;
  const hasFilter = search || statusF;

  const stats = loading ? [] : [
    { value: classes.length, label: 'Total',     color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',           icon: FiRadio       },
    { value: liveNow,        label: 'Live Now',   color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',           icon: FiRadio       },
    { value: scheduled,      label: 'Scheduled',  color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',       icon: FiCalendar    },
    { value: ended,          label: 'Recordings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', icon: FiCheckCircle },
  ];

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* ── Hero banner ── */}
      <div className={`relative overflow-hidden border-b ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/20 flex-shrink-0">
                <FiRadio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Live Classes
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {loading ? '…' : (
                    <>
                      <span className="font-semibold text-red-600 dark:text-red-400">{classes.length} classes</span>
                      {liveNow > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                          {liveNow} live now
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90
                           transition shadow-lg shadow-red-600/25 active:scale-[0.98]">
                <FiPlus className="w-4 h-4" /> Schedule Class
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* Stats */}
        {!loading && classes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => <StatCard key={i} value={s.value} label={s.label} color={s.color} icon={s.icon} />)}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classes…"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm
                         bg-white border-slate-200 text-slate-900 placeholder-slate-400
                         dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <FilterTabs tabs={STATUS_TABS} active={statusF} onChange={setStatusF} activeColor="bg-red-600" />
          <ViewToggle view={view} onChange={setView} />
        </div>

        {/* Live banner */}
        {!loading && liveNow > 0 && !statusF && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 -mt-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {liveNow} class{liveNow !== 1 ? 'es' : ''} happening right now — join before it ends!
            </p>
          </div>
        )}

        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} of {classes.length} classes</p>
            <button onClick={() => { setSearch(''); setStatusF(''); }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <FiRadio className="w-8 h-8 text-red-400 opacity-60" />
            </div>
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">
              {hasFilter ? 'No classes match' : 'No live classes yet'}
            </p>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {hasFilter
                ? 'Try a different filter or clear the search'
                : canManage ? 'Schedule the first live class' : 'Your teacher has not scheduled any live classes yet'}
            </p>
            {canManage && !hasFilter && (
              <button onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-red-500 to-rose-600 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Schedule First Class
              </button>
            )}
            {hasFilter && (
              <button onClick={() => { setSearch(''); setStatusF(''); }}
                className="mt-4 text-sm font-semibold text-red-500 hover:text-red-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(lc => (
              <LiveClassCard key={lc._id} lc={lc} canManage={canManage} theme={theme}
                onView={setViewLC} onEdit={setEditLC} onDelete={setDeleteLC} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <LiveClassCreate subjects={subjects} theme={theme}
        onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadClasses(); }} />}
      {editLC   && <LiveClassEdit   liveClass={editLC}   subjects={subjects} theme={theme}
        onClose={() => setEditLC(null)}   onUpdated={() => { setEditLC(null);   loadClasses(); }} />}
      {deleteLC && <LiveClassDelete liveClass={deleteLC} theme={theme}
        onClose={() => setDeleteLC(null)} onDeleted={() => { setDeleteLC(null); loadClasses(); }} />}
      {viewLC   && <LiveClassView   lc={viewLC} canManage={canManage} theme={theme}
        onClose={() => setViewLC(null)} onEdit={() => { setViewLC(null); setEditLC(viewLC); }} />}
    </div>
  );
}
