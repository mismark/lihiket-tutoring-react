/** Shared form for ExamCreate and ExamEdit — under 280 lines */
import { useState, useEffect } from 'react';
import { FiX, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];

export default function ExamForm({ title, initial, subjects, questions, onSubmit, onCancel, saving, theme }) {
  const dark = theme === 'dark';
  const [form, setForm] = useState({
    title: '', description: '', instructions: '', subject: '',
    gradeLevel: '', duration: '60', passMark: '0',
    startTime: '', endTime: '', status: 'draft', allowReview: true,
  });
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [qSearch, setQSearch] = useState('');

  useEffect(() => {
    if (!initial) return;
    setForm({
      title:        initial.title        || '',
      description:  initial.description  || '',
      instructions: initial.instructions || '',
      subject:      initial.subject?._id || initial.subject || '',
      gradeLevel:   initial.gradeLevel   || '',
      duration:     String(initial.duration  ?? 60),
      passMark:     String(initial.passMark  ?? 0),
      startTime:    initial.startTime ? initial.startTime.slice(0,16) : '',
      endTime:      initial.endTime   ? initial.endTime.slice(0,16)   : '',
      status:       initial.status       || 'draft',
      allowReview:  initial.allowReview  !== false,
    });
    if (initial.questions?.length) {
      setSelectedQIds(initial.questions.map(q => q.question?._id?.toString() || q.question?.toString() || q._id?.toString()));
    }
  }, [initial]);

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleQ = (id) => setSelectedQIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const filteredQs = questions.filter(q => {
    if (!qSearch) return true;
    const s = qSearch.toLowerCase();
    return q.text.toLowerCase().includes(s) || q.tags?.some(t => t.toLowerCase().includes(s));
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, duration: Number(form.duration), passMark: Number(form.passMark), questionIds: selectedQIds });
  };

  const totalMarks = selectedQIds.reduce((sum, id) => {
    const q = questions.find(x => x._id === id);
    return sum + (q?.marks || 1);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[94vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button type="button" onClick={onCancel} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            <div><label className={lbl}>Title *</label><input name="title" value={form.title} onChange={handleChange} required className={inputCls} placeholder="e.g., Mid-term Exam" /></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                  <option value="">— None —</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Grade Level</label>
                <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={inputCls}>
                  <option value="">— Any —</option>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Duration (minutes)</label><input type="number" name="duration" value={form.duration} onChange={handleChange} min="1" className={inputCls} /></div>
              <div><label className={lbl}>Pass Mark</label><input type="number" name="passMark" value={form.passMark} onChange={handleChange} min="0" className={inputCls} /></div>
              <div><label className={lbl}>Start Time</label><input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className={inputCls} /></div>
              <div><label className={lbl}>End Time</label><input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} className={inputCls} /></div>
              <div>
                <label className={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div><label className={lbl}>Instructions</label><textarea name="instructions" value={form.instructions} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} placeholder="e.g., Read each question carefully…" /></div>

            {/* Question picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={lbl}>Questions ({selectedQIds.length} selected · {totalMarks} marks)</label>
              </div>
              <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Filter questions…" className={`${inputCls} mb-2`} />
              <div className={`max-h-48 overflow-y-auto rounded-xl border divide-y ${dark ? 'border-slate-700 divide-slate-700' : 'border-gray-200 divide-gray-100'}`}>
                {filteredQs.length === 0 && (
                  <p className={`p-4 text-sm text-center ${dark ? 'text-slate-500' : 'text-gray-400'}`}>No questions found. Add some in the Question Bank first.</p>
                )}
                {filteredQs.map(q => {
                  const sel = selectedQIds.includes(q._id);
                  return (
                    <div key={q._id} onClick={() => toggleQ(q._id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${sel ? dark ? 'bg-blue-500/10' : 'bg-blue-50' : dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${sel ? 'bg-blue-600 border-blue-600' : dark ? 'border-slate-600' : 'border-gray-300'}`}>
                        {sel && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold line-clamp-1 ${dark ? 'text-slate-200' : 'text-gray-800'}`}>{q.text}</p>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {q.type.replace('_',' ')} · {q.difficulty} · {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onCancel} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><FiSave className="w-4 h-4" /> Save Exam</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
