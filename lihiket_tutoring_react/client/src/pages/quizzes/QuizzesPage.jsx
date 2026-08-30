import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getQuizzes } from '../../api/quiz.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiZap,
  FiCheckCircle, FiClock, FiBookOpen,
} from 'react-icons/fi';

import QuizCard   from './QuizCard';
import QuizCreate from './QuizCreate';
import QuizEdit   from './QuizEdit';
import QuizDelete from './QuizDelete';
import QuizTake   from './QuizTake';
import QuizView   from './QuizView';

const STATUS_TABS = [
  { value: '',          label: 'All'       },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft'     },
  { value: 'closed',    label: 'Closed'    },
];

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700/60 rounded" />
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700/60 rounded" />
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700/60 rounded" />
      </div>
      <div className="h-9 bg-slate-100 dark:bg-slate-700/60 rounded-xl mt-2" />
    </div>
  );
}

export default function QuizzesPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [quizzes,    setQuizzes]    = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusTab,  setStatusTab]  = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [viewQ,      setViewQ]      = useState(null);
  const [editQ,      setEditQ]      = useState(null);
  const [deleteQ,    setDeleteQ]    = useState(null);
  const [takeQ,      setTakeQ]      = useState(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab) params.status = statusTab;
      const res = await getQuizzes(params);
      setQuizzes(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => { loadQuizzes(); }, [loadQuizzes]);
  useEffect(() => {
    getAllSubjects().then(r => setSubjects(r.data || [])).catch(() => {});
  }, []);

  const filtered = quizzes.filter(q =>
    !search.trim() ||
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const published = quizzes.filter(q => q.status === 'published').length;
  const attempted = quizzes.filter(q => q.myResult).length;
  const hasFilter = search || statusTab;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* ── Hero header ── */}
      <div className={`border-b ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quizzes</h1>
                <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
                  {loading ? '…' : `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''}`}
                  {!canManage && published > 0 && ` · ${published} available`}
                </p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Create Quiz
              </button>
            )}
          </div>

          {/* Summary pills (student) */}
          {!canManage && !loading && quizzes.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: FiZap,         value: published,  label: 'Available',  color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
                { icon: FiCheckCircle, value: attempted,  label: 'Attempted',  color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
                { icon: FiClock,       value: quizzes.reduce((s,q)=>s+q.duration,0), label: 'Total mins', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
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

        {/* ── Search + status tabs ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or subject…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500
                         bg-white border-slate-200 text-slate-900 placeholder-slate-400
                         dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className={`flex gap-1 p-1 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-100'} flex-shrink-0`}>
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setStatusTab(t.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  statusTab === t.value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count when filtering */}
        {hasFilter && !loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} of {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
            </p>
            <button onClick={() => { setSearch(''); setStatusTab(''); }}
              className="text-xs font-semibold text-violet-500 hover:text-violet-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {/* ── Quiz grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <FiZap className="w-8 h-8 text-violet-400 opacity-60" />
            </div>
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">
              {hasFilter ? 'No quizzes match' : 'No quizzes yet'}
            </p>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {hasFilter
                ? 'Try a different search or status filter'
                : canManage
                  ? 'Create the first quiz — import from the question bank or write new questions'
                  : 'Your teacher has not published any quizzes yet'}
            </p>
            {canManage && !hasFilter && (
              <button onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Create First Quiz
              </button>
            )}
            {hasFilter && (
              <button onClick={() => { setSearch(''); setStatusTab(''); }}
                className="mt-4 text-sm font-semibold text-violet-500 hover:text-violet-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(quiz => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                canManage={canManage}
                theme={theme}
                onView={setViewQ}
                onEdit={setEditQ}
                onDelete={setDeleteQ}
                onTake={setTakeQ}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <QuizCreate subjects={subjects} theme={theme}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadQuizzes(); }} />
      )}
      {editQ && (
        <QuizEdit quiz={editQ} subjects={subjects} theme={theme}
          onClose={() => setEditQ(null)}
          onUpdated={() => { setEditQ(null); loadQuizzes(); }} />
      )}
      {deleteQ && (
        <QuizDelete quiz={deleteQ} theme={theme}
          onClose={() => setDeleteQ(null)}
          onDeleted={() => { setDeleteQ(null); loadQuizzes(); }} />
      )}
      {takeQ && (
        <QuizTake quiz={takeQ} theme={theme}
          onClose={() => setTakeQ(null)}
          onSubmitted={loadQuizzes} />
      )}
      {viewQ && (
        <QuizView quiz={viewQ} canManage={canManage} theme={theme}
          onClose={() => setViewQ(null)}
          onEdit={() => { setViewQ(null); setEditQ(viewQ); }}
          onTake={() => { setViewQ(null); setTakeQ(viewQ); }} />
      )}
    </div>
  );
}
