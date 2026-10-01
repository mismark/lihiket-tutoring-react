import { useState } from 'react';
import {
  FiX, FiVideo, FiFileText, FiBookOpen, FiClock,
  FiDownload, FiLock, FiExternalLink, FiLayers,
  FiPlayCircle, FiEye, FiEdit3, FiSave, FiCheckCircle,
  FiChevronsLeft, FiChevronsRight,
} from 'react-icons/fi';

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
  const dest = p.startsWith('uploads/')
    ? `/view?p=${encodeURIComponent(p)}&name=${encodeURIComponent(fileName || 'Document')}`
    : href;
  window.open(dest, '_blank', 'noopener,noreferrer');
}
function isYT(url)   { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
function ytEmbed(url) {
  try { const u = new URL(url); const id = u.searchParams.get('v') || u.pathname.split('/').pop(); return `https://www.youtube.com/embed/${id}?rel=0`; }
  catch { return url; }
}
function ytWatch(url) {
  try { const u = new URL(url); const id = u.searchParams.get('v') || u.pathname.split('/').pop(); return `https://www.youtube.com/watch?v=${id}`; }
  catch { return url; }
}

const TYPE_META = {
  video:    { icon: FiVideo,    label: 'Video',    color: '#8b5cf6' },
  document: { icon: FiFileText, label: 'Document', color: '#f59e0b' },
  text:     { icon: FiBookOpen, label: 'Text',     color: '#3b82f6' },
  mixed:    { icon: FiLayers,   label: 'Mixed',    color: '#10b981' },
};

const NOTE_KEY = (id) => `lesson_note_${id}`;

export default function LessonView({ lesson, onClose, theme }) {
  const dark = theme === 'dark';
  if (!lesson) return null;

  const meta         = TYPE_META[lesson.type] || TYPE_META.text;
  const TypeIcon     = meta.icon;
  const videoHref    = fileHref(lesson.videoUrl);
  const docHref      = fileHref(lesson.fileUrl);
  const isDirect     = videoHref?.match(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i);
  const isYoutube    = isYT(videoHref);

  // notes state
  const [note,        setNote]        = useState(() => localStorage.getItem(NOTE_KEY(lesson._id)) || '');
  const [noteSaved,   setNoteSaved]   = useState(false);
  const [noteEditing, setNoteEditing] = useState(!localStorage.getItem(NOTE_KEY(lesson._id)));
  // panel open/closed — starts open
  const [panelOpen,   setPanelOpen]   = useState(true);

  const saveNote = () => {
    localStorage.setItem(NOTE_KEY(lesson._id), note);
    setNoteSaved(true);
    setNoteEditing(false);
    setTimeout(() => setNoteSaved(false), 2000);
  };
  const clearNote = () => {
    setNote(''); setNoteEditing(true);
    localStorage.removeItem(NOTE_KEY(lesson._id));
  };

  // tokens
  const bd      = dark ? 'border-slate-700'   : 'border-gray-100';
  const txt     = dark ? 'text-white'          : 'text-gray-900';
  const txtSub  = dark ? 'text-slate-400'      : 'text-gray-500';
  const txtMute = dark ? 'text-slate-500'      : 'text-gray-400';
  const cardBg  = dark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className={`flex flex-col w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl overflow-hidden
          ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b ${bd}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${meta.color}18`, border:`1px solid ${meta.color}30` }}>
              <TypeIcon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-extrabold truncate ${txt}`}>{lesson.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background:`${meta.color}18`, color: meta.color }}>{meta.label}</span>
                {lesson.duration && (
                  <span className={`flex items-center gap-1 text-xs ${txtSub}`}>
                    <FiClock className="w-3 h-3" />{lesson.duration}
                  </span>
                )}
                {!lesson.isPublished && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl transition ml-3 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ════ LEFT — content ════ */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-w-0 transition-all duration-300">

            {/* Video */}
            {videoHref && (
              <div>
                <p className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${txtMute}`}>
                  <FiPlayCircle className="w-3.5 h-3.5" /> Video
                </p>
                {isDirect ? (
                  <div className="rounded-2xl overflow-hidden bg-black shadow">
                    <video src={videoHref} controls controlsList="nodownload"
                      className="w-full" style={{ maxHeight: panelOpen ? 320 : 460, background:'#000' }} />
                  </div>
                ) : isYoutube ? (
                  <div>
                    <div className="rounded-2xl overflow-hidden shadow"
                      style={{ position:'relative', paddingTop:'56.25%' }}>
                      <iframe src={ytEmbed(videoHref)} title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen className="absolute inset-0 w-full h-full" style={{ border:'none' }} />
                    </div>
                    <a href={ytWatch(videoHref)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                ) : (
                  <a href={videoHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition">
                    <FiExternalLink className="w-4 h-4" /> Open Video
                  </a>
                )}
              </div>
            )}

            {/* Document */}
            {docHref && (
              <div>
                <p className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${txtMute}`}>
                  <FiFileText className="w-3.5 h-3.5" /> Document
                </p>
                <div className={`flex items-center gap-3 p-4 rounded-2xl border ${cardBg}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
                    <FiFileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${txt}`}>{lesson.fileName || 'Document'}</p>
                    <p className={`text-xs ${txtSub}`}>{lesson.allowDownload ? 'Download available' : 'View only'}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openViewer(docHref, lesson.fileName)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition
                        ${dark ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                      <FiEye className="w-3.5 h-3.5" /> View
                    </button>
                    {lesson.allowDownload ? (
                      <a href={docHref} download={lesson.fileName || true}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                        <FiDownload className="w-3.5 h-3.5" /> Download
                      </a>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs ${dark ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
                        <FiLock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teacher notes */}
            {lesson.content?.trim() && (
              <div>
                <p className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${txtMute}`}>
                  <FiBookOpen className="w-3.5 h-3.5" /> Lesson Notes
                </p>
                <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap border ${cardBg} ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {lesson.content}
                </div>
              </div>
            )}

            {!videoHref && !docHref && !lesson.content?.trim() && (
              <div className={`text-center py-12 ${txtMute}`}>
                <FiBookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No content yet</p>
              </div>
            )}
          </div>

          {/* ════ DIVIDER with toggle button ════ */}
          <div className={`relative flex-shrink-0 flex items-center justify-center border-l ${bd}`}
            style={{ width: 20 }}>
            <button
              onClick={() => setPanelOpen(v => !v)}
              title={panelOpen ? 'Hide notes panel' : 'Show notes panel'}
              className={`absolute flex items-center justify-center w-7 h-14 rounded-lg z-10
                          text-xs font-black transition-all shadow-sm
                          ${dark
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                            : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
              style={{ right: -14 }}>
              {panelOpen
                ? <FiChevronsRight className="w-4 h-4" />
                : <FiChevronsLeft  className="w-4 h-4" />}
            </button>
          </div>

          {/* ════ RIGHT — My Notes panel ════ */}
          <div className={`flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300
              ${panelOpen ? 'w-80 xl:w-96 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col h-full min-w-[320px]">

              {/* Panel header */}
              <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 border-b ${bd}
                  ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                  style={{ color:'#10b981' }}>
                  <FiEdit3 className="w-3.5 h-3.5" /> My Notes
                </span>
                {note && !noteEditing && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(16,185,129,0.15)', color:'#10b981' }}>
                    ✓ Saved
                  </span>
                )}
              </div>

              {/* Panel body */}
              <div className={`flex flex-col flex-1 overflow-hidden px-4 py-4 gap-3
                  ${dark ? 'bg-slate-800' : 'bg-white'}`}>

                {noteEditing ? (
                  <>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Write your personal notes for this lesson…"
                      className={`flex-1 w-full px-3.5 py-3 rounded-xl text-sm leading-relaxed resize-none
                                  outline-none focus:ring-2 focus:ring-emerald-500/40 transition
                        ${dark
                          ? 'bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400'}`}
                    />
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={saveNote}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                        style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
                        {noteSaved
                          ? <><FiCheckCircle className="w-4 h-4" /> Saved!</>
                          : <><FiSave className="w-4 h-4" /> Save</>}
                      </button>
                      {note && (
                        <button onClick={() => setNoteEditing(false)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition
                            ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`flex-1 overflow-y-auto rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border
                        ${note
                          ? dark ? 'bg-slate-700/50 text-slate-300 border-slate-600' : 'bg-emerald-50 text-gray-700 border-emerald-100'
                          : dark ? 'bg-slate-700/30 text-slate-500 border-slate-700' : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}>
                      {note || 'No notes yet. Click Edit to start writing.'}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setNoteEditing(true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition
                          ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        <FiEdit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      {note && (
                        <button onClick={clearNote}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition">
                          Clear
                        </button>
                      )}
                    </div>
                  </>
                )}

                <p className={`text-xs flex-shrink-0 ${txtMute}`}>
                  🔒 Saved privately on this device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`px-5 py-3.5 flex-shrink-0 border-t ${bd}`}>
          <button onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition
              ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
