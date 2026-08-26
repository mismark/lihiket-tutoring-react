import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getLiveClasses } from '../../api/liveclass.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiX, FiFilter, FiVideo } from 'react-icons/fi';

import LiveClassCard   from './LiveClassCard';
import LiveClassCreate from './LiveClassCreate';
import LiveClassEdit   from './LiveClassEdit';
import LiveClassDelete from './LiveClassDelete';
import LiveClassView   from './LiveClassView';

const STATUSES = [
  {value:'',         label:'All'        },
  {value:'scheduled',label:'Scheduled'  },
  {value:'live',     label:'Live Now'   },
  {value:'ended',    label:'Ended'      },
  {value:'cancelled',label:'Cancelled'  },
];

export default function LiveClassesPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [classes,    setClasses]    = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [showFilter, setShowFilter] = useState(false);

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

  const filtered = classes.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  // Separate live from upcoming
  const live      = filtered.filter(c => c.status === 'live');
  const upcoming  = filtered.filter(c => c.status === 'scheduled');
  const past      = filtered.filter(c => c.status === 'ended' || c.status === 'cancelled');

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'
  }`;

  const renderGroup = (label, items) => items.length === 0 ? null : (
    <div>
      <h2 className={`text-sm font-bold mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{label} ({items.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(lc => (
          <LiveClassCard key={lc._id} lc={lc} canManage={canManage} theme={theme}
            onView={setViewLC} onEdit={setEditLC} onDelete={setDeleteLC} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>🎙️ Live Classes</h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {loading ? '…' : `${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
              {live.length > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">🔴 {live.length} live now</span>}
            </p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm">
              <FiPlus className="w-4 h-4" /> Schedule Class
            </button>
          )}
        </div>

        {/* Search + filter */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classes…"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX className="w-4 h-4" /></button>}
            </div>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${showFilter || statusF ? 'bg-blue-600 text-white border-blue-600' : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
              <FiFilter className="w-4 h-4" /> Filters{statusF ? ' (1)' : ''}
            </button>
          </div>
          {showFilter && (
            <div className="flex flex-wrap gap-3">
              <select value={statusF} onChange={e => setStatusF(e.target.value)} className={`${inputCls} min-w-[140px]`}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {statusF && <button onClick={() => setStatusF('')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}><FiX className="w-4 h-4" /> Clear</button>}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiVideo className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{search || statusF ? 'No classes match' : 'No live classes yet'}</p>
            {canManage && !search && !statusF && (
              <button onClick={() => setShowCreate(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiPlus className="w-4 h-4" /> Schedule First Class
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-7">
            {renderGroup('🔴 Live Now', live)}
            {renderGroup('📅 Upcoming', upcoming)}
            {renderGroup('📼 Past Classes', past)}
          </div>
        )}
      </div>

      {showCreate && <LiveClassCreate subjects={subjects} theme={theme} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadClasses(); }} />}
      {editLC   && <LiveClassEdit   liveClass={editLC}   subjects={subjects} theme={theme} onClose={() => setEditLC(null)}   onUpdated={() => { setEditLC(null);   loadClasses(); }} />}
      {deleteLC && <LiveClassDelete liveClass={deleteLC} theme={theme} onClose={() => setDeleteLC(null)} onDeleted={() => { setDeleteLC(null); loadClasses(); }} />}
      {viewLC   && <LiveClassView   lc={viewLC} canManage={canManage} theme={theme} onClose={() => setViewLC(null)} onEdit={() => { setViewLC(null); setEditLC(viewLC); }} />}
    </div>
  );
}
