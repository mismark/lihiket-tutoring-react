/**
 * Shared form used by LessonCreate and LessonEdit.
 * Handles all lesson types, file upload with live preview, allow-download toggle.
 */
import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiUpload, FiFileText, FiVideo } from 'react-icons/fi';

const TYPES = [
  { value: 'text',     label: 'Text / Notes'  },
  { value: 'video',    label: 'Video'          },
  { value: 'document', label: 'Document / PDF' },
  { value: 'mixed',    label: 'Mixed'          },
];

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
function fileHref(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${SERVER}${url}`;
}

export default function LessonForm({
  title, courses, initial, onSubmit, onCancel, saving, theme,
}) {
  const dark         = theme === 'dark';
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    courseId:      '',
    title:         '',
    content:       '',
    type:          'text',
    duration:      '',
    order:         '',
    allowDownload: false,
    isPublished:   true,
  });

  const [file,       setFile]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* Pre-fill when editing */
  useEffect(() => {
    if (!initial) return;
    setForm({
      courseId:      initial.course?._id || initial.course || '',
      title:         initial.title         || '',
      content:       initial.content       || '',
      type:          initial.type          || 'text',
      duration:      initial.duration      || '',
      order:         initial.order         ?? '',
      allowDownload: initial.allowDownload ?? false,
      isPublished:   initial.isPublished   !== false,
    });
  }, [initial]);

  /* Preview URL lifecycle */
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  const handleFile = e => {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    const ext = f.name.split('.').pop().toLowerCase();
    const isVideo = ['mp4','webm','mov','avi','mkv'].includes(ext);

    // Block files over 1000MB
    if (f.size > 1000 * 1024 * 1024) {
      alert(`⚠️ File is ${(f.size / 1024 / 1024).toFixed(0)}MB — maximum allowed is 1000MB.`);
      return;
    }

    // Set both file and type in one batch update
    setFile(f);
    setForm(prev => ({
      ...prev,
      type: isVideo ? 'video'
          : ['pdf','doc','docx','ppt','pptx','xls','xlsx','txt','csv','zip'].includes(ext) ? 'document'
          : ['png','jpg','jpeg','gif','webp'].includes(ext) ? 'document'
          : prev.type,
    }));
  };

  const clearFile = e => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    onSubmit(fd);
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
         : 'bg-slate-50 border-gray-300 text-slate-900'
  }`;
  const lbl = `block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-600'}`;

  const isVid   = file && /\.(mp4|webm|mov)$/i.test(file.name);
  const isPdf   = file && /\.pdf$/i.test(file.name);
  const isImage = file && /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[94vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
          <button type="button" onClick={onCancel}
            className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Course selector (only when courses list provided & not editing) */}
            {courses?.length > 0 && !initial && (
              <div>
                <label className={lbl}>Course *</label>
                <select name="courseId" value={form.courseId} onChange={handleChange} required className={inputCls}>
                  <option value="">â€” Select course â€”</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className={lbl}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g., Introduction to Algebra"
                className={inputCls} />
            </div>

            {/* Type + Duration + Order */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Type</label>
                <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Duration</label>
                <input name="duration" value={form.duration} onChange={handleChange}
                  placeholder="12:30" className={inputCls} />
              </div>
              <div>
                <label className={lbl}>Order</label>
                <input type="number" name="order" value={form.order} onChange={handleChange}
                  placeholder="0" min="0" className={inputCls} />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className={lbl}>
                File <span className={`font-normal ${dark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span>
              </label>

              {/* Size limits info */}
              <p className={`text-xs mb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                📎 Documents: up to 50MB &nbsp;|&nbsp; 🎬 Videos: up to 1000MB (mp4, webm, mov)
              </p>

              <div onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${
                  file
                    ? dark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50'
                    : dark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-blue-400'
                }`}>
                <FiUpload className={`w-5 h-5 flex-shrink-0 ${file ? 'text-emerald-500' : dark ? 'text-slate-400' : 'text-slate-400'}`} />
                <span className={`text-sm flex-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {file ? (
                    <span className="flex flex-col gap-0.5">
                      <span className={`font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{file.name}</span>
                      <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </span>
                  ) : form.type === 'video'
                    ? 'Click to upload MP4 / WebM / MOV (max 100MB)'
                    : 'Click to upload PDF / DOC / DOCX / PPT / image'
                  }
                </span>
                {file && (
                  <button type="button" onClick={clearFile} className="text-red-400 hover:text-red-600">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden"
                accept=".mp4,.webm,.mov,.avi,.mkv,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,video/*,image/*"
                onChange={handleFile} />

              {/* Live preview */}
              {previewUrl && (
                <div className={`mt-3 rounded-xl overflow-hidden border ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className={`flex items-center justify-between px-3 py-2 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <span className={`text-xs font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Preview</span>
                    <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {isVid   && <video src={previewUrl} controls className="w-full max-h-40 bg-black" />}
                  {isImage && <img src={previewUrl} alt="preview" className="w-full max-h-40 object-contain bg-gray-900" />}
                  {isPdf   && <iframe src={previewUrl} className="w-full h-40" style={{ border:'none' }} title="PDF preview" />}
                  {!isVid && !isImage && !isPdf && (
                    <div className={`flex items-center gap-3 p-3 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
                      <FiFileText className={`w-8 h-8 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{file.name}</p>
                        <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Ready to upload</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show current file when editing */}
              {initial && !file && (initial.videoUrl || initial.fileUrl) && (
                <div className={`mt-2 p-3 rounded-xl text-xs ${dark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  Current:{' '}
                  <a href={fileHref(initial.videoUrl || initial.fileUrl)} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 hover:underline">
                    {initial.fileName || 'view file'}
                  </a>{' '}â€” upload a new file to replace
                </div>
              )}
            </div>

            {/* Allow Download toggle */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${dark ? 'border-slate-600 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-gray-800'}`}>Allow Download</p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>When off, students can view but not download</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="allowDownload" checked={form.allowDownload} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-slate-600 dark:peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

            {/* Published toggle */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${dark ? 'border-slate-600 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-gray-800'}`}>Published</p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Unpublished lessons are hidden from students</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 dark:bg-slate-600 dark:peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

            {/* Notes / content */}
            <div>
              <label className={lbl}>Notes / Content</label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={4}
                placeholder="Write lesson notes, explanations, or instructions hereâ€¦"
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Footer */}
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button type="button" onClick={onCancel}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Savingâ€¦</>
                : <><FiSave className="w-4 h-4" /> Save Lesson</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

