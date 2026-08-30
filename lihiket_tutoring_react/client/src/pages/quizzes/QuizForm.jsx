import { useState, useEffect, useCallback } from 'react';
import {
  FiX, FiSave, FiDatabase, FiPlusCircle, FiSearch,
  FiCheck, FiTrash2, FiChevronDown, FiChevronUp,
  FiTag, FiAlertCircle, FiFilter,
} from 'react-icons/fi';
import { getQuestions, createQuestion } from '../../api/question.api';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPES        = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
const TYPE_LABELS  = { multiple_choice:'Multiple Choice', true_false:'True / False', short_answer:'Short Answer', essay:'Essay' };

// ── Shared toggle switch ──────────────────────────────────────────────────────
function Toggle({ name, checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border
                    border-slate-200 bg-slate-50
                    dark:border-slate-600 dark:bg-slate-900/50">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-slate-600
                        peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5
                        after:transition-all peer-checked:after:translate-x-4" />
      </label>
    </div>
  );
}

// ── Inline New Question Builder ────────────────────────────────────────────────
function NewQuestionBuilder({ subjects, onAdd }) {
  const [q, setQ] = useState({
    text: '', type: 'multiple_choice', difficulty: 'medium',
    marks: 1, subject: '', tags: '',
    options: ['', '', '', ''], correctAnswer: '', explanation: '',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const set = (k, v) => setQ(p => ({ ...p, [k]: v }));

  const setOption = (i, v) => setQ(p => {
    const opts = [...p.options];
    opts[i] = v;
    return { ...p, options: opts };
  });

  const handleAdd = async () => {
    if (!q.text.trim()) { setErr('Question text is required'); return; }
    if (q.type === 'multiple_choice' && !q.correctAnswer) { setErr('Correct answer is required'); return; }
    setErr('');
    setSaving(true);
    try {
      const optLabels = ['A', 'B', 'C', 'D'];

      const payload = {
        text:          q.text.trim(),
        type:          q.type,
        difficulty:    q.difficulty,
        marks:         Number(q.marks) || 1,
        subject:       q.subject || undefined,
        tags:          q.tags.split(',').map(t => t.trim()).filter(Boolean),
        // Transform plain strings → { label, text } objects that the schema expects
        options: q.type === 'multiple_choice'
          ? q.options
              .map((text, i) => ({ label: optLabels[i], text }))
              .filter(o => o.text.trim())
          : undefined,
        correctAnswer: q.correctAnswer || undefined,
        explanation:   q.explanation.trim() || undefined,
      };
      const res = await createQuestion(payload);
      const saved = res.data || res;
      onAdd(saved);
      // Reset form
      setQ({ text:'', type:'multiple_choice', difficulty:'medium', marks:1, subject:'', tags:'', options:['','','',''], correctAnswer:'', explanation:'' });
    } catch (e) {
      setErr(e.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-slate-200 text-slate-900 placeholder-slate-400
    dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500`;

  const optLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3
                    bg-slate-50 dark:bg-slate-900/40">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Create &amp; Add New Question
      </p>

      {/* Question text */}
      <textarea value={q.text} onChange={e => set('text', e.target.value)}
        placeholder="Enter question text…" rows={2}
        className={`${inputCls} resize-none`} />

      {/* Type / Difficulty / Marks / Subject */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Type</label>
          <select value={q.type} onChange={e => set('type', e.target.value)} className={inputCls}>
            {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Difficulty</label>
          <select value={q.difficulty} onChange={e => set('difficulty', e.target.value)} className={inputCls}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Marks</label>
          <input type="number" min={1} value={q.marks} onChange={e => set('marks', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Subject</label>
          <select value={q.subject} onChange={e => set('subject', e.target.value)} className={inputCls}>
            <option value="">Any</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Multiple choice options */}
      {q.type === 'multiple_choice' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Options (mark the correct one)</p>
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button type="button"
                onClick={() => set('correctAnswer', optLabels[i])}
                className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition ${
                  q.correctAnswer === optLabels[i]
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 text-slate-500'
                }`}>
                {optLabels[i]}
              </button>
              <input value={opt} onChange={e => setOption(i, e.target.value)}
                placeholder={`Option ${optLabels[i]}`}
                className={inputCls} />
            </div>
          ))}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Click a letter to mark it as the correct answer.
            {q.correctAnswer && <span className="ml-1 font-semibold text-emerald-500"> Correct: {q.correctAnswer}</span>}
          </p>
        </div>
      )}

      {/* True/False */}
      {q.type === 'true_false' && (
        <div className="flex gap-3">
          {['True','False'].map(v => (
            <button type="button" key={v}
              onClick={() => set('correctAnswer', v)}
              className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition ${
                q.correctAnswer === v
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Short answer correct answer */}
      {q.type === 'short_answer' && (
        <input value={q.correctAnswer} onChange={e => set('correctAnswer', e.target.value)}
          placeholder="Expected answer (for auto-grading)"
          className={inputCls} />
      )}

      {/* Explanation + Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={q.explanation} onChange={e => set('explanation', e.target.value)}
          placeholder="Explanation (optional)" className={inputCls} />
        <input value={q.tags} onChange={e => set('tags', e.target.value)}
          placeholder="Tags (comma separated)" className={inputCls} />
      </div>

      {err && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <FiAlertCircle className="w-3.5 h-3.5" /> {err}
        </p>
      )}

      <button type="button" onClick={handleAdd} disabled={saving || !q.text.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                   bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition">
        {saving
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <FiPlusCircle className="w-4 h-4" />}
        {saving ? 'Saving…' : 'Save to Bank & Add to Quiz'}
      </button>
    </div>
  );
}

// ── Question Bank importer ────────────────────────────────────────────────────
function BankImporter({ subjects, selectedIds, onToggle }) {
  const [bankQs,    setBankQs]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [typeF,     setTypeF]     = useState('');
  const [diffF,     setDiffF]     = useState('');
  const [subjectF,  setSubjectF]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQuestions({ limit: 200 });
      setBankQs(res.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bankQs.filter(q => {
    const s = search.toLowerCase();
    return (
      (!s || q.text.toLowerCase().includes(s) || q.tags?.some(t => t.toLowerCase().includes(s))) &&
      (!typeF    || q.type === typeF) &&
      (!diffF    || q.difficulty === diffF) &&
      (!subjectF || q.subject?._id === subjectF || q.subject === subjectF)
    );
  });

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white`;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search questions by text or tag…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                     bg-white border-slate-200 text-slate-900 placeholder-slate-400
                     dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={typeF} onChange={e => setTypeF(e.target.value)} className={`${inputCls} flex-1 min-w-[130px]`}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={diffF} onChange={e => setDiffF(e.target.value)} className={`${inputCls} flex-1 min-w-[110px]`}>
          <option value="">All Levels</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
        <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={`${inputCls} flex-1 min-w-[140px]`}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
          <FiDatabase className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{bankQs.length === 0 ? 'Question bank is empty. Create questions first.' : 'No questions match your filters.'}</p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60 max-h-80 overflow-y-auto">
          {filtered.map(q => {
            const sel = selectedIds.includes(q._id);
            return (
              <div key={q._id} onClick={() => onToggle(q)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
                  sel
                    ? 'bg-blue-50 dark:bg-blue-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                  sel ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {sel && <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{q.text}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      q.difficulty === 'easy'   ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      q.difficulty === 'medium' ? 'bg-amber-100   text-amber-700   dark:bg-amber-500/20   dark:text-amber-400'   :
                                                  'bg-red-100     text-red-700     dark:bg-red-500/20     dark:text-red-400'
                    }`}>{q.difficulty}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {TYPE_LABELS[q.type]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      {q.marks} mark{q.marks !== 1 ? 's' : ''}
                    </span>
                    {q.subject?.name && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">{q.subject.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
          {selectedIds.length} selected · Showing {filtered.length} of {bankQs.length}
        </p>
      )}
    </div>
  );
}

// ── Main QuizForm ─────────────────────────────────────────────────────────────
export default function QuizForm({ title, initial, subjects, onSubmit, onCancel, saving, theme }) {
  const dark = theme === 'dark';

  const [form, setForm] = useState({
    title: '', description: '', subject: '', gradeLevel: '',
    duration: '15', passMarkPercent: '50',
    allowRetake: true, showAnswers: true, status: 'draft',
  });

  // Selected questions: array of full question objects (so we can show preview)
  const [selectedQs, setSelectedQs] = useState([]);
  // Active tab in question section
  const [qTab, setQTab] = useState('bank'); // 'bank' | 'new'

  // Load initial values when editing
  useEffect(() => {
    if (!initial) return;
    setForm({
      title:           initial.title              || '',
      description:     initial.description        || '',
      subject:         initial.subject?._id       || initial.subject || '',
      gradeLevel:      initial.gradeLevel         || '',
      duration:        String(initial.duration    ?? 15),
      passMarkPercent: String(initial.passMarkPercent ?? 50),
      allowRetake:     initial.allowRetake        !== false,
      showAnswers:     initial.showAnswers         !== false,
      status:          initial.status             || 'draft',
    });
    if (initial.questions?.length) {
      // QuizEdit already normalizes to flat question objects before passing initial.
      // Guard: filter out anything that doesn't look like a full question object.
      const qs = initial.questions
        .map(q => {
          // If still a reference wrapper { question: {...}, marks } — unwrap
          if (q.question && typeof q.question === 'object') {
            return { ...q.question, marks: q.marks ?? q.question.marks ?? 1 };
          }
          return q;
        })
        .filter(q => q && q._id && q.text); // must have _id AND text to be usable
      setSelectedQs(qs);
    }
  }, [initial]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  // Toggle a question from the bank
  const handleToggleQ = (q) => {
    setSelectedQs(prev =>
      prev.some(x => x._id === q._id)
        ? prev.filter(x => x._id !== q._id)
        : [...prev, q]
    );
  };

  // Add a newly-created question (comes already saved to DB)
  const handleAddNewQ = (q) => {
    setSelectedQs(prev =>
      prev.some(x => x._id === q._id) ? prev : [...prev, q]
    );
    setQTab('bank'); // switch back to bank tab to see it listed
  };

  const removeQ = (id) => setSelectedQs(prev => prev.filter(x => x._id !== id));

  const totalMarks     = selectedQs.reduce((s, q) => s + (q.marks || 1), 0);
  const pct            = Math.min(100, Math.max(0, Number(form.passMarkPercent) || 0));
  const passMarkAbs    = Math.round((pct / 100) * totalMarks);

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      duration:        Number(form.duration),
      passMarkPercent: pct,
      questionIds:     selectedQs.map(q => q._id),
    });
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-slate-200 text-slate-900 placeholder-slate-400
    dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500`;
  const lbl = 'block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-3xl max-h-[96vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* ── Basic info ── */}
            <div>
              <label className={lbl}>Title <span className="text-red-400">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. Chapter 1 Quick Quiz" className={inputCls} maxLength={120} />
            </div>

            <div>
              <label className={lbl}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={2} className={`${inputCls} resize-none`}
                placeholder="Brief instructions for students…" maxLength={500} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className={lbl}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                  <option value="">— None —</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Grade</label>
                <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={inputCls}>
                  <option value="">Any</option>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Duration */}
              <div>
                <label className={lbl}>Duration (minutes)</label>
                <input type="number" name="duration" value={form.duration} onChange={handleChange}
                  min="1" className={inputCls} />
              </div>

              {/* Pass mark % */}
              <div>
                <label className={lbl}>
                  Pass Mark (%)
                  {totalMarks > 0 && (
                    <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                      = {passMarkAbs} / {totalMarks} marks
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" name="passMarkPercent" value={form.passMarkPercent}
                    onChange={handleChange} min="0" max="100" step="5"
                    className="flex-1 accent-blue-600" />
                  <div className="relative w-20 flex-shrink-0">
                    <input type="number" name="passMarkPercent" value={form.passMarkPercent}
                      onChange={handleChange} min="0" max="100"
                      className={`${inputCls} pr-7 text-center`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                {totalMarks > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Students need ≥ {pct}% ({passMarkAbs} marks) to pass
                  </p>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Toggle name="allowRetake" checked={form.allowRetake} onChange={handleChange}
                label="Allow Retakes" hint="Students can attempt multiple times" />
              <Toggle name="showAnswers" checked={form.showAnswers} onChange={handleChange}
                label="Show Answers After" hint="Show correct answers after submission" />
            </div>

            {/* ── Questions section ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Questions
                    {selectedQs.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                                       bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        {selectedQs.length} selected · {totalMarks} marks
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Import from your question bank or create new questions inline
                  </p>
                </div>
              </div>

              {/* Selected questions preview */}
              {selectedQs.length > 0 && (
                <div className="mb-3 border border-slate-200 dark:border-slate-700 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                  {selectedQs.map((q, i) => (
                    <div key={q._id} className="flex items-start gap-3 px-4 py-3 bg-white dark:bg-slate-800">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400
                                       flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{q.text}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {q.marks} mk
                        </span>
                        <button type="button" onClick={() => removeQ(q._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab switcher */}
              <div className={`flex gap-1 p-1 rounded-xl mb-3 ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                {[
                  { key: 'bank', label: 'Import from Bank', icon: FiDatabase },
                  { key: 'new',  label: 'Create New',       icon: FiPlusCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button type="button" key={key} onClick={() => setQTab(key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
                      qTab === key
                        ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                        : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {qTab === 'bank' ? (
                <BankImporter
                  subjects={subjects}
                  selectedIds={selectedQs.map(q => q._id)}
                  onToggle={handleToggleQ}
                />
              ) : (
                <NewQuestionBuilder
                  subjects={subjects}
                  onAdd={handleAddNewQ}
                />
              )}
            </div>

          </div>

          {/* Footer */}
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition
                         bg-slate-100 text-slate-700 hover:bg-slate-200
                         dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.title.trim()}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition
                         bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                         flex items-center justify-center gap-2 shadow-sm">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> Save Quiz</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
