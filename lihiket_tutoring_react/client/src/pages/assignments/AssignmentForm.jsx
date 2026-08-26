import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiUpload } from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AssignmentForm({ title, initial, subjects, onSubmit, onCancel, saving, theme }) {
  const dark         = theme === 'dark';
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    title:'', description:'', instructions:'', subject:'',
    gradeLevel:'', dueDate:'', totalMarks:'10', allowLate:false, status:'draft',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!initial) return;
    setForm({
      title:        initial.title        || '',
      description:  initial.description  || '',
      instructions: initial.instructions || '',
      subject:      initial.subject?._id || initial.subject || '',
      gradeLevel:   initial.gradeLevel   || '',
      dueDate:      initial.dueDate ? initial.dueDate.slice(0,16) : '',
      totalMarks:   String(initial.totalMarks ?? 10),
      allowLate:    initial.allowLate === true,
      status:       initial.status       || 'draft',
    });
  }, [initial]);

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[94vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button type="button" onClick={onCancel} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            <div><label className={lbl}>Title *</label><input name="title" value={form.title} onChange={handleChange} required placeholder="e.g., Chapter 1 Worksheet" className={inputCls} /></div>
            <div><label className={lbl}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} /></div>
            <div><label className={lbl}>Instructions</label><textarea name="instructions" value={form.instructions} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="What students should do…" /></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
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
              <div><label className={lbl}>Total Marks</label><input type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} min="1" className={inputCls} /></div>
              <div className="col-span-2"><label className={lbl}>Due Date</label><input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} /></div>
              <div>
                <label className={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Allow Late toggle */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${dark ? 'border-slate-600 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
              <div>
                <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-gray-800'}`}>Allow Late Submissions</p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Students can submit after the due date</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="allowLate" checked={form.allowLate} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-500 dark:bg-slate-600 dark:peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

            {/* Attachment upload */}
            <div>
              <label className={lbl}>Attachment <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(optional)</span></label>
              <div onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${file ? dark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50' : dark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-blue-400'}`}>
                <FiUpload className={`w-5 h-5 flex-shrink-0 ${file ? 'text-emerald-500' : dark ? 'text-slate-400' : 'text-gray-400'}`} />
                <span className={`text-sm flex-1 truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {file ? <span className={`font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{file.name}</span> : 'Click to attach a file'}
                </span>
                {file && <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:text-red-600"><FiX className="w-4 h-4" /></button>}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              {initial && !file && initial.attachmentUrl && (
                <p className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Current: <a href={`${SERVER}${initial.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{initial.attachmentName || 'file'}</a></p>
              )}
            </div>
          </div>

          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onCancel} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><FiSave className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
