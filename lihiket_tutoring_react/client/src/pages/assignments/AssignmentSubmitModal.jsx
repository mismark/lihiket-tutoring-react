import { useState, useRef } from 'react';
import { FiUpload, FiX, FiSend, FiFileText } from 'react-icons/fi';
import { submitAssignment } from '../../api/assignment.api';
import toast from 'react-hot-toast';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AssignmentSubmitModal({ assignment, onClose, onSubmitted, theme }) {
  const dark         = theme === 'dark';
  const fileInputRef = useRef();
  const [text,    setText]    = useState('');
  const [file,    setFile]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  if (!assignment) return null;

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'}`;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!text.trim() && !file) { toast.error('Please write something or attach a file'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('text', text);
      if (file) fd.append('file', file);
      await submitAssignment(assignment._id, fd);
      toast.success('Assignment submitted!');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Submit Assignment</h2>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{assignment.title}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Assignment attachment */}
            {assignment.attachmentUrl && (
              <div className={`p-3 rounded-xl border ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Assignment file:</p>
                <a href={`${SERVER}${assignment.attachmentUrl}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-500 hover:underline">
                  <FiFileText className="w-3.5 h-3.5" /> {assignment.attachmentName || 'Download'}
                </a>
              </div>
            )}

            {/* Instructions */}
            {assignment.instructions && (
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${dark ? 'bg-slate-700/40 text-slate-300' : 'bg-blue-50 text-gray-700'}`}>
                {assignment.instructions}
              </div>
            )}

            {/* Text answer */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>Your Answer / Notes</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                placeholder="Type your response here…"
                className={`${inputCls} resize-none`} />
            </div>

            {/* File upload */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>
                Attach File <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(optional)</span>
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${file ? dark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50' : dark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-blue-400'}`}>
                <FiUpload className={`w-5 h-5 flex-shrink-0 ${file ? 'text-emerald-500' : dark ? 'text-slate-400' : 'text-gray-400'}`} />
                <span className={`text-sm flex-1 truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {file ? <span className={`font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{file.name}</span> : 'Click to attach your work'}
                </span>
                {file && <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:text-red-600"><FiX className="w-4 h-4" /></button>}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : <><FiSend className="w-4 h-4" /> Submit</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
