import { useState, useEffect, useRef } from 'react';
import { FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LessonNotes({ lessonId, theme, compact }) {
  const dark       = theme === 'dark';
  const storageKey = `lesson_notes_${lessonId}`;
  const saveTimer  = useRef(null);

  const [text,    setText]    = useState(() => localStorage.getItem(storageKey) || '');
  const [saved,   setSaved]   = useState(true);
  const [cleared, setCleared] = useState(false);

  const handleChange = e => {
    setText(e.target.value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey, e.target.value);
      setSaved(true);
    }, 1200);
  };

  const handleSaveNow = () => {
    clearTimeout(saveTimer.current);
    localStorage.setItem(storageKey, text);
    setSaved(true);
    toast.success('Notes saved');
  };

  const handleClear = () => {
    if (!window.confirm('Clear all notes for this lesson?')) return;
    setText('');
    localStorage.removeItem(storageKey);
    setSaved(true);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className={`flex flex-col h-full ${
      compact ? '' : `rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <FiEdit3 className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>My Notes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${cleared ? 'text-amber-500' : saved ? dark ? 'text-emerald-400' : 'text-emerald-600' : dark ? 'text-slate-500' : 'text-gray-400'}`}>
            {cleared ? 'Cleared' : saved ? '✓ Saved' : 'Unsaved…'}
          </span>
          <button onClick={handleSaveNow} title="Save now"
            className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
            <FiSave className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleClear} title="Clear notes"
            className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={text} onChange={handleChange}
        placeholder={`Jot down notes while watching…\n\n• Key points\n• Questions\n• Reminders`}
        spellCheck
        className={`flex-1 w-full p-4 text-sm resize-none focus:outline-none leading-relaxed ${
          dark ? 'bg-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white text-gray-800 placeholder-gray-400'
        }`}
        style={{ minHeight: '200px' }}
      />

      {/* Footer */}
      <div className={`px-4 py-2 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        <p className={`text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
          {words > 0 ? `${words} word${words !== 1 ? 's' : ''}` : 'Start typing…'}
        </p>
      </div>
    </div>
  );
}
