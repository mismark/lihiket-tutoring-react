import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLink } from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const PLATFORMS    = [
  { value:'meet',  label:'Google Meet' },
  { value:'zoom',  label:'Zoom'        },
  { value:'jitsi', label:'Jitsi'       },
  { value:'teams', label:'MS Teams'   },
  { value:'other', label:'Other'       },
];
const STATUSES     = [
  { value:'scheduled',label:'Scheduled' },
  { value:'live',     label:'Live Now'  },
  { value:'ended',    label:'Ended'     },
  { value:'cancelled',label:'Cancelled' },
];

export default function LiveClassForm({ title, initial, subjects, onSubmit, onCancel, saving, theme }) {
  const dark = theme === 'dark';
  const [form, setForm] = useState({
    title:'', description:'', subject:'', gradeLevel:'',
    meetingLink:'', platform:'meet', scheduledAt:'',
    duration:'60', status:'scheduled', recordingUrl:'', notes:'',
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      title:        initial.title         || '',
      description:  initial.description   || '',
      subject:      initial.subject?._id  || initial.subject || '',
      gradeLevel:   initial.gradeLevel    || '',
      meetingLink:  initial.meetingLink   || '',
      platform:     initial.platform      || 'meet',
      scheduledAt:  initial.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0,16) : '',
      duration:     String(initial.duration ?? 60),
      status:       initial.status        || 'scheduled',
      recordingUrl: initial.recordingUrl  || '',
      notes:        initial.notes         || '',
    });
  }, [initial]);

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.meetingLink.trim() || !form.scheduledAt) return;
    onSubmit({ ...form, duration: Number(form.duration) });
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
            <div><label className={lbl}>Title *</label><input name="title" value={form.title} onChange={handleChange} required placeholder="e.g., Chapter 1 Live Lesson" className={inputCls} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className={inputCls}>
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Meeting Link *</label>
              <div className="relative">
                <FiLink className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input name="meetingLink" value={form.meetingLink} onChange={handleChange} required
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className={`${inputCls} pl-10`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Scheduled At *</label>
                <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required className={inputCls} />
              </div>
              <div><label className={lbl}>Duration (min)</label><input type="number" name="duration" value={form.duration} onChange={handleChange} min="5" className={inputCls} /></div>
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
            </div>

            <div><label className={lbl}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} /></div>
            <div><label className={lbl}>Class Notes / Agenda</label><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="Topics to cover, homework, etc." /></div>
            <div>
              <label className={lbl}>Recording URL <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(after class ends)</span></label>
              <input name="recordingUrl" value={form.recordingUrl} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
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
