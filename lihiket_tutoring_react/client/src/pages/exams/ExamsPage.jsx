import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getExams } from '../../api/exam.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiAward,
  FiCheckCircle, FiClock, FiBookOpen,
} from 'react-icons/fi';

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

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
        </div>
        <div className="h-9 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [exams,     setExams]     = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusTab, setStatusTab] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [viewE,      setViewE]      = useState(null);
  const [editE,      setEditE]      = useState(null);
  const [deleteE,    setDeleteE]    = useState(null);
  const [takeE,      setTakeE]      = useState(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab) params.status = statusTab;
      const res = await getExams(params);
      setExams(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => { loadExams(); }, [loadExams]);
  useEffect(() => {
    getAllSubjects().then(r => setSubjects(r.data || [])).catch(() => {});
  }, []);

  const filtered = exams.filter(e =>
    !search.trim() ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const published = exams.filter(e => e.status === 'published').length;
  const attempted = exams.filter(e => e.myResult).length;
  const hasFilter = search || statusTab;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* ── Hero header ── */}
      <div className={`border-b ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <FiAward className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exams</h1>
                <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
                  {loading ? '…' : `${exams.length} exam${exams.length !== 1 ? 's' : ''}`}
                  {!canManage && published > 0 && ` · ${published} available`}
                </p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Create Exam
              </button>
            )}
          </div>

          {/* Student stats */}
          {!canManage && !loading && exams.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: FiAward,       value: published, label: 'Available',  color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
                { icon: FiCheckCircle, value: attempted, label: 'Completed',  color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
                { icon: FiClock,       value: exams.reduce((s,e)=>s+e.duration,0), label: 'Total mins', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${p.color}`}>
                    <p.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold leading-none text-slate-900 dark:text-white">{p.value}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{p.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-5">

        {/* Search + status tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or subject…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500
                         bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm
                         dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className={`flex gap-1 p-1 rounded-xl flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setStatusTab(t.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  statusTab === t.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {hasFilter && !loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} of {exams.length} exam{exams.length !== 1 ? 's' : ''}
            </p>
            <button onClick={() => { setSearch(''); setStatusTab(''); }}
              className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-8 h-8 text-amber-400 opacity-60" />
            </div>
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">
              {hasFilter ? 'No exams match' : 'No exams yet'}
            </p>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {hasFilter
                ? 'Try a different search or status filter'
                : canManage
                  ? 'Create the first exam — import from question bank or write new questions'
                  : 'Your teacher has not published any exams yet'}
            </p>
            {canManage && !hasFilter && (
              <button onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Create First Exam
              </button>
            )}
            {hasFilter && (
              <button onClick={() => { setSearch(''); setStatusTab(''); }}
                className="mt-4 text-sm font-semibold text-amber-500 hover:text-amber-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(exam => (
              <ExamCard key={exam._id} exam={exam} canManage={canManage} theme={theme}
                onView={setViewE} onEdit={setEditE} onDelete={setDeleteE} onTake={setTakeE} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <ExamCreate subjects={subjects} theme={theme} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadExams(); }} />}
      {editE   && <ExamEdit   exam={editE}   subjects={subjects} theme={theme} onClose={() => setEditE(null)}   onUpdated={() => { setEditE(null);   loadExams(); }} />}
      {deleteE && <ExamDelete exam={deleteE} theme={theme} onClose={() => setDeleteE(null)} onDeleted={() => { setDeleteE(null); loadExams(); }} />}
      {takeE   && <ExamTake   exam={takeE}   theme={theme} onClose={() => setTakeE(null)}   onSubmitted={loadExams} />}
      {viewE   && <ExamView   exam={viewE}   canManage={canManage} theme={theme} onClose={() => setViewE(null)} onEdit={() => { setViewE(null); setEditE(viewE); }} onTake={() => { setViewE(null); setTakeE(viewE); }} />}
    </div>
  );
}
