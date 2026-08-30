/**
 * Shared form used by CourseCreate and CourseEdit.
 * Handles its own submit + field state.
 */
import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiBook, FiAlignLeft, FiHash, FiEye } from 'react-icons/fi';

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{label}</p>
        {hint && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

export default function CourseForm({
  initial = {},
  title,
  submitLabel = 'Save',
  onSubmit,
  onClose,
}) {
  const [form, setForm]     = useState({
    title:       initial.title       || '',
    description: initial.description || '',
    order:       initial.order       ?? 0,
    isPublished: initial.isPublished !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...form, order: Number(form.order) || 0 });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <FiBook className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Title */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                <FiBook className="w-3.5 h-3.5" /> Title <span className="text-red-400">*</span>
              </label>
              <input
                ref={titleRef}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Chapter 1 — Introduction"
                className={inputCls}
                maxLength={120}
              />
              <p className="text-right text-xs text-gray-400 dark:text-slate-600 mt-1">
                {form.title.length}/120
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                <FiAlignLeft className="w-3.5 h-3.5" /> Description
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Brief overview of what students will learn…"
                rows={3}
                className={`${inputCls} resize-none`}
                maxLength={500}
              />
              <p className="text-right text-xs text-gray-400 dark:text-slate-600 mt-1">
                {form.description.length}/500
              </p>
            </div>

            {/* Order */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                <FiHash className="w-3.5 h-3.5" /> Display Order
              </label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={e => set('order', e.target.value)}
                className={`${inputCls} max-w-[120px]`}
              />
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Lower numbers appear first.
              </p>
            </div>

            {/* Published toggle */}
            <Toggle
              checked={form.isPublished}
              onChange={val => set('isPublished', val)}
              label="Publish course"
              hint="Students can see and access this course"
            />

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.title.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition shadow-md shadow-blue-600/20">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> {submitLabel}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
