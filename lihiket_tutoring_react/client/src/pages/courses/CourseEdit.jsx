import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateCourse } from '../../api/course.api';
import toast from 'react-hot-toast';

export default function CourseEdit({ course, onClose, onUpdated, theme }) {
  const dark = theme === 'dark';
  const [form, setForm]   = useState({ title: '', description: '', order: '', isPublished: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) setForm({
      title:       course.title       || '',
      description: course.description || '',
      order:       course.order       ?? '',
      isPublished: course.isPublished !== false,
    });
  }, [course]);

  if (!course) return null;

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await updateCourse(course._id, { ...form, order: Number(form.order) || 0 });
      toast.success('Course updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Edit Course</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            <div><label className={lbl}>Title *</label><input name="title" value={form.title} onChange={handleChange} required className={inputCls} /></div>
            <div><label className={lbl}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} /></div>
            <div><label className={lbl}>Order</label><input type="number" name="order" value={form.order} onChange={handleChange} min="0" className={inputCls} /></div>
            <div className={`flex items-center justify-between p-3 rounded-xl border ${dark ? 'border-slate-600 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
              <div>
                <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-gray-800'}`}>Published</p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Students can see this course</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-slate-600 dark:peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><FiSave className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
