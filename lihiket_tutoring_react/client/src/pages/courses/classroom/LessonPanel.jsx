import { useState } from 'react';
import { FiPlayCircle, FiExternalLink, FiDownload, FiLock, FiClock, FiEdit3 } from 'react-icons/fi';
import LessonNotes from './LessonNotes';

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
  const url = p.startsWith('uploads/')
    ? `/view?p=${encodeURIComponent(p)}&name=${encodeURIComponent(fileName || 'Document')}`
    : href;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function LessonPanel({ lesson, theme }) {
  const dark      = theme === 'dark';
  const videoHref = fileHref(lesson.videoUrl);
  const docHref   = fileHref(lesson.fileUrl);
  const hasVideo  = !!videoHref;

  const notesKey = `lesson_notes_visible_${lesson._id}`;
  const [notesOpen, setNotesOpen] = useState(() => localStorage.getItem(notesKey) !== 'false');

  const toggleNotes = () => {
    const next = !notesOpen;
    setNotesOpen(next);
    localStorage.setItem(notesKey, String(next));
  };

  return (
    <div className="space-y-4">

      {/* Video + notes */}
      {hasVideo && (
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-5 py-3 border-b ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <FiPlayCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</p>
                {lesson.duration && (
                  <p className={`text-xs flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiClock className="w-3 h-3" /> {lesson.duration}
                  </p>
                )}
              </div>
            </div>
            <button onClick={toggleNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                notesOpen
                  ? dark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              <FiEdit3 className="w-3.5 h-3.5" />
              {notesOpen ? 'Hide Notes' : 'Show Notes'}
            </button>
          </div>

          {/* Video + optional notes side-by-side */}
          {videoHref.match(/\.(mp4|webm|mov)$/i) ? (
            <div className={`grid ${notesOpen ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
              <div className={notesOpen ? 'lg:col-span-3' : ''}>
                <video src={videoHref} controls controlsList="nodownload" className="w-full bg-black"
                  style={{ maxHeight: notesOpen ? '520px' : '640px', minHeight: '300px' }} />
              </div>
              {notesOpen && (
                <div className={`lg:col-span-2 border-t lg:border-t-0 lg:border-l ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <LessonNotes lessonId={lesson._id} theme={theme} compact />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <a href={videoHref} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiExternalLink className="w-4 h-4" /> Open Video
              </a>
            </div>
          )}
        </div>
      )}

      {/* Document */}
      {docHref && (
        <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Document</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openViewer(docHref, lesson.fileName)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              <FiExternalLink className="w-4 h-4" /> View {lesson.fileName || 'Document'}
            </button>
            {lesson.allowDownload ? (
              <a href={docHref} download={lesson.fileName || true}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                <FiDownload className="w-4 h-4" /> Download
              </a>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                <FiLock className="w-3.5 h-3.5" /> Download not permitted
              </span>
            )}
          </div>
        </div>
      )}

      {/* Notes standalone (no video) */}
      {!hasVideo && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-gray-500'}`}>My Notes</span>
            <button onClick={toggleNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                notesOpen ? dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' : dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
              }`}>
              <FiEdit3 className="w-3.5 h-3.5" />
              {notesOpen ? 'Hide Notes' : 'Show Notes'}
            </button>
          </div>
          {notesOpen && <div style={{ minHeight: '260px' }}><LessonNotes lessonId={lesson._id} theme={theme} /></div>}
        </div>
      )}

      {/* Teacher content */}
      {lesson.content && (
        <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Lesson Notes</p>
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{lesson.content}</div>
        </div>
      )}
    </div>
  );
}
