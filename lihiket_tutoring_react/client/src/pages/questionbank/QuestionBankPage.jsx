import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getQuestions } from '../../api/question.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiFilter, FiBookOpen,
} from 'react-icons/fi';

import QuestionCard   from './QuestionCard';
import QuestionCreate from './QuestionCreate';
import QuestionEdit   from './QuestionEdit';
import QuestionDelete from './QuestionDelete';
import QuestionView   from './QuestionView';

const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

const TYPES = [
  { value: 'multiple_choice', label: 'MCQ' },
  { value: 'true_false',      label: 'True/False' },
  { value: 'short_answer',    label: 'Short Answer' },
  { value: 'essay',           label: 'Essay' },
];

export default function QuestionBankPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';

  const canManage = user?.role === 'teacher'; // only teachers manage questions

  const [questions,  setQuestions]  = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);

  // Filters
  const [search,     setSearch]     = useState('');
  const [subjectF,   setSubjectF]   = useState('');
  const [gradeF,     setGradeF]     = useState('');
  const [diffF,      setDiffF]      = useState('');
  const [typeF,      setTypeF]      = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Modal state
  const [viewQ,   setViewQ]   = useState(null);
  const [editQ,   setEditQ]   = useState(null);
  const [deleteQ, setDeleteQ] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const LIMIT = 12;

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
    } finally {
      setLoading(false);
    }
  }, [search, subjectF, gradeF, diffF, typeF]);

  useEffect(() => { loadQuestions(1); }, [loadQuestions]);

  useEffect(() => {
    // Teachers: only show their assigned subjects in the filter/form dropdowns
    getAllSubjects()
      .then(res => {
        const all = res.data || [];
        if (user?.role === 'teacher') {
          const assigned = all.filter(s =>
            s.assignedTeachers?.some(
              t => t._id === user.id || t._id?.toString() === user.id?.toString()
            )
          );
          setSubjects(assigned);
        } else {
          setSubjects(all);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const clearFilters = () => {
    setSearch(''); setSubjectF(''); setGradeF(''); setDiffF(''); setTypeF('');
  };

  const hasFilter = search || subjectF || gradeF || diffF || typeF;
  const totalPages = Math.ceil(total / LIMIT);

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
         : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              🗂️ Question Bank
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {loading ? '…' : `${total} question${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm"
            >
              <FiPlus className="w-4 h-4" /> Add Question
            </button>
          )}
        </div>

        {/* ── Search + filter bar ── */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions…"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                       : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                showFilter || hasFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                         : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FiFilter className="w-4 h-4" />
              Filters{hasFilter ? ` (${[subjectF,gradeF,diffF,typeF].filter(Boolean).length})` : ''}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1">
              <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
              </select>
              <select value={gradeF} onChange={e => setGradeF(e.target.value)} className={`${inputCls} flex-1 min-w-[130px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={diffF} onChange={e => setDiffF(e.target.value)} className={`${inputCls} flex-1 min-w-[130px]`}>
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select value={typeF} onChange={e => setTypeF(e.target.value)} className={`${inputCls} flex-1 min-w-[140px]`}>
                <option value="">All Types</option>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {hasFilter && (
                <button onClick={clearFilters}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                    dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                         : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}>
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading questions…</p>
          </div>
        ) : questions.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiBookOpen className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              {hasFilter ? 'No questions match your filters' : 'No questions yet'}
            </p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              {hasFilter ? 'Try different filters' : canManage ? 'Click "+ Add Question" to build your question bank' : 'No questions available'}
            </p>
            {hasFilter && (
              <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map(q => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  onView={setViewQ}
                  onEdit={canManage ? setEditQ : () => {}}
                  onDelete={canManage ? setDeleteQ : () => {}}
                  theme={theme}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => loadQuestions(page - 1)}
                  disabled={page <= 1}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${
                    dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                         : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >← Prev</button>
                <span className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => loadQuestions(page + 1)}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${
                    dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                         : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <QuestionCreate
          subjects={subjects}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadQuestions(1); }}
          theme={theme}
        />
      )}
      {editQ && (
        <QuestionEdit
          question={editQ}
          subjects={subjects}
          onClose={() => setEditQ(null)}
          onUpdated={() => { setEditQ(null); loadQuestions(page); }}
          theme={theme}
        />
      )}
      {deleteQ && (
        <QuestionDelete
          question={deleteQ}
          onClose={() => setDeleteQ(null)}
          onDeleted={() => { setDeleteQ(null); loadQuestions(page); }}
          theme={theme}
        />
      )}
      {viewQ && (
        <QuestionView
          question={viewQ}
          onClose={() => setViewQ(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
