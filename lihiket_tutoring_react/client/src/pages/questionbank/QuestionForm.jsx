/**
 * Shared form component used by both QuestionCreate and QuestionEdit.
 * Handles all question types, dynamic options for MCQ, tag input.
 */
import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false',      label: 'True / False'          },
  { value: 'short_answer',    label: 'Short Answer'           },
  { value: 'essay',           label: 'Essay'                  },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

const LABELS = ['A','B','C','D','E'];

const emptyOption = (idx) => ({ label: LABELS[idx], text: '' });

export default function QuestionForm({
  initial, subjects, onSubmit, onCancel, saving, theme, title,
}) {
  const dark = theme === 'dark';

  const [form, setForm] = useState({
    text:          '',
    type:          'multiple_choice',
    options:       [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)],
    correctAnswer: '',
    explanation:   '',
    subject:       '',
    gradeLevel:    '',
    difficulty:    'medium',
    tags:          '',
    marks:         '1',
  });

  // Pre-fill when editing
  useEffect(() => {
    if (!initial) return;
    setForm({
      text:          initial.text          || '',
      type:          initial.type          || 'multiple_choice',
      options:       initial.options?.length
                       ? initial.options
                       : [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)],
      correctAnswer: initial.correctAnswer || '',
      explanation:   initial.explanation   || '',
      subject:       initial.subject?._id  || initial.subject || '',
      gradeLevel:    initial.gradeLevel    || '',
      difficulty:    initial.difficulty    || 'medium',
      tags:          Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
      marks:         String(initial.marks ?? 1),
    });
  }, [initial]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleChange = e => {
    const { name, value } = e.target;
    set(name, value);
    // Reset correctAnswer when type changes
    if (name === 'type') set('correctAnswer', '');
  };

  const addOption = () => {
    if (form.options.length >= 5) return;
    setForm(p => ({
      ...p,
      options: [...p.options, emptyOption(p.options.length)],
    }));
  };

  const removeOption = (idx) => {
    setForm(p => {
      const opts = p.options.filter((_, i) => i !== idx)
        .map((o, i) => ({ ...o, label: LABELS[i] }));
      return {
        ...p,
        options: opts,
        correctAnswer: p.correctAnswer === LABELS[idx] ? '' : p.correctAnswer,
      };
    });
  };

  const updateOption = (idx, text) => {
    setForm(p => ({
      ...p,
      options: p.options.map((o, i) => i === idx ? { ...o, text } : o),
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...form,
      marks:   Number(form.marks) || 1,
      options: form.type === 'multiple_choice' ? form.options : [],
      tags:    form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
         : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[94vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button type="button" onClick={onCancel}
            className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Question text */}
            <div>
              <label className={lbl}>Question Text *</label>
              <textarea name="text" value={form.text} onChange={handleChange} required rows={3}
                placeholder="Enter your question here…"
                className={`${inputCls} resize-none`} />
            </div>

            {/* Type + Difficulty + Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Type *</label>
                <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Difficulty</label>
                <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputCls}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Marks</label>
                <input type="number" name="marks" value={form.marks} onChange={handleChange}
                  min="0" step="0.5" className={inputCls} />
              </div>
            </div>

            {/* Subject + Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                  <option value="">— None —</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Grade Level</label>
                <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={inputCls}>
                  <option value="">— Any —</option>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* ── MCQ Options ── */}
            {form.type === 'multiple_choice' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={lbl}>Options *</label>
                  {form.options.length < 5 && (
                    <button type="button" onClick={addOption}
                      className={`flex items-center gap-1 text-xs font-semibold transition ${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                      <FiPlus className="w-3.5 h-3.5" /> Add option
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {/* Label circle */}
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                        form.correctAnswer === opt.label
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : dark ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'
                      }`}>{opt.label}</span>
                      {/* Text input */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => updateOption(idx, e.target.value)}
                        placeholder={`Option ${opt.label}`}
                        className={`flex-1 ${inputCls}`}
                      />
                      {/* Mark correct */}
                      <button type="button"
                        onClick={() => set('correctAnswer', opt.label)}
                        title="Mark as correct answer"
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                          form.correctAnswer === opt.label
                            ? 'bg-emerald-500 text-white'
                            : dark ? 'bg-slate-700 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                                   : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                        }`}>
                        ✓
                      </button>
                      {/* Remove */}
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex-shrink-0">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Click ✓ next to the correct option to mark it as the answer.
                </p>
              </div>
            )}

            {/* True / False */}
            {form.type === 'true_false' && (
              <div>
                <label className={lbl}>Correct Answer *</label>
                <div className="flex gap-3">
                  {['True', 'False'].map(val => (
                    <button type="button" key={val}
                      onClick={() => set('correctAnswer', val)}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition border ${
                        form.correctAnswer === val
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : dark ? 'border-slate-600 text-slate-300 hover:border-emerald-500/50'
                                 : 'border-gray-200 text-gray-700 hover:border-emerald-400'
                      }`}>{val}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Short answer / Essay */}
            {(form.type === 'short_answer' || form.type === 'essay') && (
              <div>
                <label className={lbl}>Model Answer / Expected Answer *</label>
                <textarea name="correctAnswer" value={form.correctAnswer} onChange={handleChange}
                  required rows={form.type === 'essay' ? 5 : 2}
                  placeholder="Enter the expected answer…"
                  className={`${inputCls} resize-none`} />
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className={lbl}>Explanation <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(optional)</span></label>
              <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={2}
                placeholder="Explain why this answer is correct…"
                className={`${inputCls} resize-none`} />
            </div>

            {/* Tags */}
            <div>
              <label className={lbl}>Tags <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(comma separated)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g., algebra, chapter1, calculus"
                className={inputCls} />
            </div>
          </div>

          {/* Footer */}
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onCancel}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> Save Question</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
