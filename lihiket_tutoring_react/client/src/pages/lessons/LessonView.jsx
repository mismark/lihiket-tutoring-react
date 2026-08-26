import { FiX, FiVideo, FiFileText, FiBookOpen, FiClock, FiDownload, FiLock, FiExternalLink, FiBook } from 'react-icons/fi';

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

const TYPE_ICON = {
  video:    FiVideo,
  document: FiFileText,
  text:     FiBookOpen,
  mixed:    FiBook,
};

export default function LessonView({ lesson, onClose, theme }) {
  const dark = theme === 'dark';
  if (!lesson) return null;

  const TypeIcon  = TYPE_ICON[lesson.type] || FiBookOpen;
  const videoHref = fileHref(lesson.videoUrl);
  const docHref   = fileHref(lesson.fileUrl);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-xs capitalize ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{lesson.type}</span>
                {lesson.duration && (
                  <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiClock className="w-3 h-3" /> {lesson.duration}
                  </span>
                )}
                {!lesson.isPublished && (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-lg transition flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Video */}
          {videoHref && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Video</p>
              {videoHref.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={videoHref} controls controlsList="nodownload"
                  className="w-full rounded-xl bg-black max-h-64" />
              ) : (
                <a href={videoHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                  <FiExternalLink className="w-4 h-4" /> Open Video
                </a>
              )}
            </div>
          )}

          {/* Document */}
          {docHref && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Document</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openViewer(docHref, lesson.fileName)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}>
                  <FiExternalLink className="w-4 h-4" /> View {lesson.fileName || 'Document'}
                </button>
                {lesson.allowDownload && (
                  <a href={docHref} download={lesson.fileName || true}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                    <FiDownload className="w-4 h-4" /> Download
                  </a>
                )}
                {!lesson.allowDownload && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                    <FiLock className="w-3.5 h-3.5" /> Download not permitted
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes / content */}
          {lesson.content && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Notes</p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                dark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-50 text-gray-700'
              }`}>
                {lesson.content}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs ${
            dark ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-400'
          }`}>
            <div>Order: {lesson.order ?? '—'}</div>
            <div>Marks: {lesson.marks ?? '—'}</div>
            <div>Published: {lesson.isPublished ? 'Yes' : 'No (Draft)'}</div>
            <div>Download: {lesson.allowDownload ? 'Allowed' : 'Not allowed'}</div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
