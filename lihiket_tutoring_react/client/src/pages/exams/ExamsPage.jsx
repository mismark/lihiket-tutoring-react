import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getExams } from '../../api/exam.api';
import { getAllSubjects } from '../../api/subject.api';
import { getQuestions } from '../../api/question.api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiX, FiFilter, FiAward } from 'react-icons/fi';

import ExamCard   from './ExamCard';
import ExamCreate from './ExamCreate';
import ExamEdit   from './ExamEdit';
import ExamDelete from './ExamDelete';
import ExamTake   from './ExamTake';
import ExamView   from './ExamView';

const STATUSES = [{value:'',label:'All'},{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'closed',label:'Closed'}];

export default function ExamsPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [exams,     setExams]     = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [showFilter,setShowFilter]= useState(false);

  const [showCreate,setShowCreate]= useState(false);
  const [viewE,     setViewE]     = useState(null);
  const [editE,     setEditE]     = useState(null);
  const [deleteE,   setDeleteE]   = useState(null);
  const [takeE,     setTakeE]     = useState(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const res = await getExams(params);
      setExams(res.data || []);
    } catch (err) { toast.error(err.message || 'Failed to load exams'); }
    finally { setLoading(false); }
  }, [statusF]);

  useEffect(() => { loadExams(); }, [loadExams]);

  useEffect(() => {
    getAllSubjects().then(r => setSubjects(r.data || [])).catch(() => {});
    if (canManage) getQuestions({ limit: 200 }).then(r => setQuestions(r.data || [])).catch(() => {});
  }, [canManage]);

  const filtered = exams.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return e.title.toLowerCase().includes(s) || e.subject?.name?.toLowerCase().includes(s);
  });

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>📝 Exams</h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {loading ? '…' : `${exams.length} exam${exams.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm">
              <FiPlus className="w-4 h-4" /> Create Exam
            </button>
          )}
        </div>

        {/* Search + filter */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams…"
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

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiAward className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{search || statusF ? 'No exams match' : 'No exams yet'}</p>
            {canManage && !search && !statusF && (
              <button onClick={() => setShowCreate(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiPlus className="w-4 h-4" /> Create First Exam
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

      {showCreate && <ExamCreate subjects={subjects} questions={questions} theme={theme} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadExams(); }} />}
      {editE   && <ExamEdit   exam={editE}   subjects={subjects} questions={questions} theme={theme} onClose={() => setEditE(null)}   onUpdated={() => { setEditE(null);   loadExams(); }} />}
      {deleteE && <ExamDelete exam={deleteE} theme={theme} onClose={() => setDeleteE(null)} onDeleted={() => { setDeleteE(null); loadExams(); }} />}
      {takeE   && <ExamTake   exam={takeE}   theme={theme} onClose={() => setTakeE(null)}   onSubmitted={loadExams} />}
      {viewE   && <ExamView   exam={viewE}   canManage={canManage} theme={theme} onClose={() => setViewE(null)} onEdit={() => { setViewE(null); setEditE(viewE); }} onTake={() => { setViewE(null); setTakeE(viewE); }} />}
    </div>
  );
}
