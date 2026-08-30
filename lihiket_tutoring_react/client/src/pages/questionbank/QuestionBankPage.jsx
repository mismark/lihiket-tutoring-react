import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getQuestions } from '../../api/question.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiDatabase, FiBookOpen,
  FiCheckCircle, FiAlertCircle, FiGrid, FiList,
} from 'react-icons/fi';

import QuestionCard   from './QuestionCard';
import QuestionCreate from './QuestionCreate';
import QuestionEdit   from './QuestionEdit';
import QuestionDelete from './QuestionDelete';
import QuestionView   from './QuestionView';
import { StatCard, SkeletonCard } from '../../components/shared/SubjectPageLayout';
import FilterTabs from '../../components/shared/FilterTabs';
import ViewToggle from '../../components/shared/ViewToggle';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];

const TYPE_TABS = [
  { value: '',                label: 'All Types'     },
  { value: 'multiple_choice', label: 'MCQ'           },
  { value: 'true_false',      label: 'True/False'    },
  { value: 'short_answer',    label: 'Short Answer'  },
  { value: 'essay',           label: 'Essay'         },
];

const DIFF_TABS = [
  { value: '',       label: 'All'    },
  { value: 'easy',   label: 'Easy'   },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard'   },
];

const LIMIT = 12;

export default function QuestionBankPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'teacher' || user?.role === 'admin';

  const [questions, setQuestions] = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [view,      setView]      = useState('grid');

  // Filters
  const [search,   setSearch]   = useState('');
  const [subjectF, setSubjectF] = useState('');
  const [gradeF,   setGradeF]   = useState('');
  const [diffF,    setDiffF]    = useState('');
  const [typeF,    setTypeF]    = useState('');
  const [showMore, setShowMore] = useState(false); // show grade/subject filters

  // Modals
  const [viewQ,      setViewQ]      = useState(null);
  const [editQ,      setEditQ]      = useState(null);
  const [deleteQ,    setDeleteQ]    = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadQuestions = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (search)   params.search     = search;
      if (subjectF) params.subject    = subjectF;
      if (gradeF)   params.gradeLevel = gradeF;
      if (diffF)    params.difficulty = diffF;
      if (typeF)    params.type       = typeF;
      const res = await getQuestions(params);
      setQuestions(res.data || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load questions');
    } finally { setLoading(false); }
  }, [search, subjectF, gradeF, diffF, typeF]);

  useEffect(() => { loadQuestions(1); }, [loadQuestions]);

  useEffect(() => {
    if (!user?.id) return;
    getAllSubjects()
      .then(res => {
        const all = res.data || [];
        if (user?.role === 'teacher') {
          setSubjects(all.filter(s =>
            s.assignedTeachers?.some(t => {
              const tid = (t._id || t.id || '').toString();
              const uid = (user.id || user._id || '').toString();
              return tid && uid && tid === uid;
            })
          ));
        } else {
          setSubjects(all);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const clearFilters = () => { setSearch(''); setSubjectF(''); setGradeF(''); setDiffF(''); setTypeF(''); };
  const hasFilter    = search || subjectF || gradeF || diffF || typeF;
  const totalPages   = Math.ceil(total / LIMIT);

  // Stats (approximate from current page — rough counts)
  const stats = loading ? [] : [
    { value: total,                                             label: 'Total Questions', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',         icon: FiDatabase      },
    { value: questions.filter(q => q.difficulty === 'easy').length,   label: 'Easy',    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: FiCheckCircle   },
    { value: questions.filter(q => q.difficulty === 'medium').length, label: 'Medium',  color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',         icon: FiAlertCircle   },
    { value: questions.filter(q => q.difficulty === 'hard').length,   label: 'Hard',    color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',                 icon: FiAlertCircle   },
  ];

  const inputCls = `px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                <FiDatabase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Question Bank
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {loading ? '…' : (
                    <><span className="font-semibold text-blue-600 dark:text-blue-400">{total} question{total !== 1 ? 's' : ''}</span>
                    {subjects.length > 0 && <> · {subjects.length} subject{subjects.length !== 1 ? 's' : ''}</>}</>
                  )}
                </p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition
                           shadow-lg shadow-blue-600/25 active:scale-[0.98]">
                <FiPlus className="w-4 h-4" /> Add Question
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* ── Stat cards ── */}
        {!loading && questions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => <StatCard key={i} value={s.value} label={s.label} color={s.color} icon={s.icon} />)}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="space-y-3">
          {/* Row 1: search + type tabs + view toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                           bg-white border-slate-200 text-slate-900 placeholder-slate-400
                           dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Difficulty tabs */}
            <FilterTabs tabs={DIFF_TABS} active={diffF} onChange={setDiffF} activeColor="bg-blue-600" />

            {/* View toggle */}
            <ViewToggle view={view} onChange={setView} />

            {/* More filters toggle */}
            <button
              onClick={() => setShowMore(v => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                showMore || (subjectF || gradeF || typeF)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              More filters{(subjectF || gradeF || typeF) ? ' ✓' : ''}
            </button>
          </div>

          {/* Row 2: type + subject + grade filters (collapsible) */}
          {showMore && (
            <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Type */}
              <select value={typeF} onChange={e => setTypeF(e.target.value)} className={`${inputCls} flex-1 min-w-[140px]`}>
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
              </select>
              {/* Subject */}
              <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
              </select>
              {/* Grade */}
              <select value={gradeF} onChange={e => setGradeF(e.target.value)} className={`${inputCls} flex-1 min-w-[120px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {hasFilter && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <FiX className="w-4 h-4" /> Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        {hasFilter && !loading && (
          <div className="flex items-center justify-between -mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {questions.length} of {total} questions
            </p>
            <button onClick={clearFilters} className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition">
              Clear filters
            </button>
          </div>
        )}

        {/* ── Grid / List ── */}
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <FiDatabase className="w-8 h-8 text-blue-400 opacity-60" />
            </div>
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">
              {hasFilter ? 'No questions match' : 'No questions yet'}
            </p>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {hasFilter
                ? 'Try different filters or clear the search'
                : canManage
                  ? 'Click "+ Add Question" to start building your question bank'
                  : 'No questions available yet'}
            </p>
            {canManage && !hasFilter && (
              <button onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-blue-500 to-indigo-600 text-white transition shadow-sm">
                <FiPlus className="w-4 h-4" /> Add First Question
              </button>
            )}
            {hasFilter && (
              <button onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {questions.map(q => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  canManage={canManage}
                  onView={setViewQ}
                  onEdit={canManage ? setEditQ   : () => {}}
                  onDelete={canManage ? setDeleteQ : () => {}}
                  theme={theme}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => loadQuestions(page - 1)} disabled={page <= 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition disabled:opacity-40
                             bg-white border-slate-200 text-slate-700 hover:bg-slate-50
                             dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                  ← Prev
                </button>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {page} / {totalPages}
                </span>
                <button onClick={() => loadQuestions(page + 1)} disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition disabled:opacity-40
                             bg-white border-slate-200 text-slate-700 hover:bg-slate-50
                             dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <QuestionCreate subjects={subjects} theme={theme}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadQuestions(1); }} />
      )}
      {editQ && (
        <QuestionEdit question={editQ} subjects={subjects} theme={theme}
          onClose={() => setEditQ(null)}
          onUpdated={() => { setEditQ(null); loadQuestions(page); }} />
      )}
      {deleteQ && (
        <QuestionDelete question={deleteQ} theme={theme}
          onClose={() => setDeleteQ(null)}
          onDeleted={() => { setDeleteQ(null); loadQuestions(page); }} />
      )}
      {viewQ && (
        <QuestionView question={viewQ} theme={theme}
          onClose={() => setViewQ(null)} />
      )}
    </div>
  );
}
