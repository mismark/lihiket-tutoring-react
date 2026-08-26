import { FiX, FiDownload, FiExternalLink, FiLock, FiBook, FiUser, FiCalendar, FiTag, FiFileText } from 'react-icons/fi';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function fileHref(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${SERVER}${url}`;
}

function openViewer(href, fileName) {
  if (!href) return;
  let p = href;
  try { p = new URL(href).pathname; } catch {}
  p = p.replace(/^\//, '');
  if (p.startsWith('uploads/')) {
    window.open(`/view?p=${encodeURIComponent(p)}&name=${encodeURIComponent(fileName || 'Document')}`, '_blank', 'noopener,noreferrer');
  } else {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}

const CATEGORY_LABELS = {
  notes: 'Notes', worksheet: 'Worksheet', past_paper: 'Past Paper',
  syllabus: 'Syllabus', reference: 'Reference', other: 'Other',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentView({ doc, onClose, theme }) {
  const dark = theme === 'dark';
  if (!doc) return null;

  const href = fileHref(doc.fileUrl);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <FiFileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{doc.title}</h2>
              {doc.fileName && (
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {doc.fileName} {doc.fileSize ? `· ${formatSize(doc.fileSize)}` : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
              {CATEGORY_LABELS[doc.category] || doc.category}
            </span>
            {doc.gradeLevel && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                {doc.gradeLevel}
              </span>
            )}
            {!doc.isPublished && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                Draft
              </span>
            )}
          </div>

          {/* Description */}
          {doc.description && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Description</p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{doc.description}</p>
            </div>
          )}

          {/* File actions */}
          {href && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>File</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openViewer(href, doc.fileName || doc.title)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiExternalLink className="w-4 h-4" /> View Document
                </button>
                {doc.allowDownload && (
                  <a href={href} download={doc.fileName || true}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                    <FiDownload className="w-4 h-4" /> Download
                  </a>
                )}
                {!doc.allowDownload && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                    <FiLock className="w-3.5 h-3.5" /> Download not permitted
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs ${dark ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'}`}>
            {doc.subject && (
              <div className="flex items-center gap-1.5">
                <FiBook className="w-3.5 h-3.5" /> {doc.subject.name}
              </div>
            )}
            {doc.uploadedBy && (
              <div className="flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5" /> {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" /> {new Date(doc.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {doc.tags.map(t => (
                <span key={t} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                  <FiTag className="w-2.5 h-2.5" /> {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={onClose} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
