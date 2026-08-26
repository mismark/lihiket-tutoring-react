/** Shared form for DocumentCreate and DocumentEdit */
import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiUpload, FiFileText } from 'react-icons/fi';

const CATEGORIES = [
  { value: 'notes',      label: 'Notes'       },
  { value: 'worksheet',  label: 'Worksheet'    },
  { value: 'past_paper', label: 'Past Paper'   },
  { value: 'syllabus',   label: 'Syllabus'     },
  { value: 'reference',  label: 'Reference'    },
  { value: 'other',      label: 'Other'        },
];

const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function DocumentForm({ title, initial, subjects, onSubmit, onCancel, saving, theme }) {
  const dark         = theme === 'dark';
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    title:         '',
    description:   '',
    subject:       '',
    gradeLevel:    '',
    category:      'other',
    allowDownload: true,
    isPublished:   true,
    tags:          '',
  });
  const [file,       setFile]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!initial) return;
    setForm({
      title:         initial.title         || '',
      description:   initial.description   || '',
      subject:       initial.subject?._id  || initial.subject || '',
      gradeLevel:    initial.gradeLevel    || '',
      category:      initial.category      || 'other',
      allowDownload: initial.allowDownload !== false,
      isPublished:   initial.isPublished   !== false,
      tags:          Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
    });
  }, [initial]);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = e => setFile(e.target.files?.[0] || null);

  const clearFile = e => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!initial && !file) { alert('Please select a file'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    onSubmit(fd);
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`;

  const isPdf   = file && /\.pdf$/i.test(file.name);
  const isImage = file && /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[94vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button type="button" onClick={onCancel}
            className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Title */}
            <div>
              <label className={lbl}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g., Chapter 1 Notes" className={inputCls} />
            </div>

            {/* Description */}
            <div>
              <label className={lbl}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                placeholder="Brief description…" className={`${inputCls} resize-none`} />
            </div>

            {/* Category + Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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

            {/* Subject */}
            {subjects?.length > 0 && (
              <div>
                <label className={lbl}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                  <option value="">— None —</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
                </select>
              </div>
            )}

            {/* File upload */}
            <div>
              <label className={lbl}>
                File {!initial && <span className="text-red-500">*</span>}
                {initial && <span className={`font-normal ml-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(upload new to replace)</span>}
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${
                  file
                    ? dark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50'
                    : dark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-blue-400'
                }`}>
                <FiUpload className={`w-5 h-5 flex-shrink-0 ${file ? 'text-emerald-500' : dark ? 'text-slate-400' : 'text-gray-400'}`} />
                <span className={`text-sm flex-1 truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {file
                    ? <span className={`font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{file.name}</span>
                    : 'Click to upload PDF / DOC / DOCX / image'
                  }
                </span>
                {file && (
                  <button type="button" onClick={clearFile} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*"
                onChange={handleFile} />

              {/* Preview */}
              {previewUrl && (
                <div className={`mt-3 rounded-xl overflow-hidden border ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center justify-between px-3 py-2 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-semibold ${dark ? 'text-slate-300' : 'text-gray-600'}`}>Preview</span>
                    <span className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-400'}`}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {isImage && <img src={previewUrl} alt="preview" className="w-full max-h-40 object-contain bg-gray-900" />}
                  {isPdf   && <iframe src={previewUrl} className="w-full h-40" style={{ border: 'none' }} title="PDF preview" />}
                  {!isImage && !isPdf && (
                    <div className={`flex items-center gap-3 p-3 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
                      <FiFileText className={`w-8 h-8 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                        <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Ready to upload</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current file when editing */}
              {initial && !file && initial.fileUrl && (
                <div className={`mt-2 p-3 rounded-xl text-xs ${dark ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>
                  Current: <span className="font-semibold">{initial.fileName || 'file'}</span>
                </div>
              )}
            </div>

            {/* Toggles */}
            {[
              { name: 'allowDownload', label: 'Allow Download', hint: 'Students can download this document' },
              { name: 'isPublished',   label: 'Published',      hint: 'Unpublished documents are hidden from students' },
            ].map(({ name, label, hint }) => (
              <div key={name} className={`flex items-center justify-between p-3 rounded-xl border ${dark ? 'border-slate-600 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <div>
                  <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-gray-800'}`}>{label}</p>
                  <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{hint}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-slate-600 dark:peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}

            {/* Tags */}
            <div>
              <label className={lbl}>Tags <span className={`font-normal ${dark ? 'text-slate-500' : 'text-gray-400'}`}>(comma separated)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g., chapter1, algebra, exam prep" className={inputCls} />
            </div>
          </div>

          {/* Footer */}
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onCancel}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> Save Document</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
