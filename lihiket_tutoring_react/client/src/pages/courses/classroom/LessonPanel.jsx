/**
 * LessonPanel — Inline lesson content panel (classroom accordion)
 *
 * Renders inline (no modal) inside the CourseAccordion.
 * Supports:
 *   - Direct video files → native <video> with custom controls overlay
 *   - External / YouTube video → link button
 *   - Document card → View (secure viewer) + Download
 *   - Teacher notes
 *   - Collapsible personal notes sidebar (LessonNotes)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiPlayCircle, FiExternalLink, FiDownload, FiLock,
  FiClock, FiEdit3, FiFileText, FiVideo,
  FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiAlertCircle, FiRefreshCw,
  FiBookOpen,
} from 'react-icons/fi';
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

function isDirectVideo(href) {
  if (!href) return false;
  if (/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(href)) return true;
  if (/res\.cloudinary\.com\/.*\/video\/upload\//i.test(href)) return true;
  if (/res\.cloudinary\.com\/.*\/raw\/upload\/.+\.(mp4|webm|mov|avi|mkv)/i.test(href)) return true;
  return false;
}

function isYouTube(href) {
  return !!(href && (href.includes('youtube.com') || href.includes('youtu.be')));
}

function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

/* ── Minimal video player for inline use ─────────────────────── */
function InlineVideoPlayer({ src, dark, notesOpen }) {
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const hideTimer    = useRef(null);

  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [volume,       setVolume]       = useState(1);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [buffered,     setBuffered]     = useState(0);
  const [buffering,    setBuffering]    = useState(true);
  const [error,        setError]        = useState(null);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [showControls, setShowControls] = useState(true);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, [playing]);

  useEffect(() => { resetTimer(); }, [playing, resetTimer]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (v) v.paused ? v.play() : v.pause();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      !document.fullscreenElement
        ? await el.requestFullscreen()
        : await document.exitFullscreen();
    } catch {}
  };
  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const r   = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    v.currentTime = pct * duration;
  };
  const handleVolume = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val; v.muted = val === 0;
    setVolume(val); setMuted(val === 0);
  };
  const retry = () => {
    setError(null); setBuffering(true);
    const v = videoRef.current;
    if (v) { v.load(); v.play().catch(() => {}); }
  };

  const pct    = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufPct = duration > 0 ? (buffered    / duration) * 100 : 0;
  const ctrlVis = showControls ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{ maxHeight: notesOpen ? 500 : 620, minHeight: 280 }}
      onMouseMove={resetTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={resetTimer}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        controlsList="nodownload"
        className="w-full object-contain"
        style={{
          display: 'block',
          width: '100%',
          maxHeight: notesOpen ? 500 : 620,
          minHeight: 280,
          cursor: showControls ? 'default' : 'none',
        }}
        onClick={togglePlay}
        onLoadedMetadata={() => { setDuration(videoRef.current?.duration || 0); setBuffering(false); }}
        onTimeUpdate={() => {
          const v = videoRef.current; if (!v) return;
          setCurrentTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onProgress={() => {
          const v = videoRef.current;
          if (v?.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onPlay={() => { setPlaying(true); setBuffering(false); }}
        onPause={() => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onError={() => {
          const code = videoRef.current?.error?.code;
          setError({
            1: 'Playback aborted.',
            2: 'Network error.',
            3: 'Decode error.',
            4: 'Format not supported.',
          }[code] || 'Could not load video.');
          setBuffering(false); setPlaying(false);
        }}
      />

      {/* Spinner */}
      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
          <FiAlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white text-sm font-semibold max-w-xs leading-relaxed">{error}</p>
          <button onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10
                       hover:bg-white/20 text-white text-sm font-bold transition border border-white/20">
            <FiRefreshCw className="w-4 h-4" /> Retry
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/50 hover:text-white/80 underline transition">
            Open in new tab
          </a>
        </div>
      )}

      {/* Big play indicator */}
      {!error && !buffering && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm
                          border border-white/20 flex items-center justify-center">
            <FiPlay className="w-8 h-8 text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Controls */}
      {!error && (
        <div className={`absolute inset-x-0 bottom-0
                         bg-gradient-to-t from-black/90 via-black/40 to-transparent
                         px-4 pt-10 pb-3 transition-opacity duration-300 ${ctrlVis}`}>
          {/* Seek bar */}
          <div
            className="relative h-1 rounded-full bg-white/20 cursor-pointer mb-3.5 group/seek"
            onClick={handleSeek}
            role="slider" aria-label="Seek"
            aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
            tabIndex={0}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all"
              style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all"
              style={{ width: `${pct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3
                            rounded-full bg-white shadow scale-0 group-hover/seek:scale-100 transition-transform"
              style={{ left: `${pct}%` }} />
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
              className="text-white hover:text-violet-300 transition">
              {playing ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 translate-x-0.5" />}
            </button>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
              className="text-white hover:text-violet-300 transition">
              {muted || volume === 0 ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={handleVolume} aria-label="Volume"
              className="w-16 accent-violet-500 cursor-pointer hidden sm:block" />
            <span className="text-white/70 text-xs font-mono ml-1">
              {fmtTime(currentTime)} <span className="text-white/30">/</span> {fmtTime(duration)}
            </span>
            <div className="flex-1" />
            <button onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="text-white hover:text-violet-300 transition">
              {fullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main LessonPanel ─────────────────────────────────────────── */
export default function LessonPanel({ lesson, theme }) {
  const dark      = theme === 'dark';
  const videoHref = fileHref(lesson.videoUrl);
  const docHref   = fileHref(lesson.fileUrl);
  const hasVideo  = !!videoHref;
  const hasDirect = isDirectVideo(videoHref);
  const hasYT     = isYouTube(videoHref);

  const notesKey = `lesson_notes_visible_${lesson._id}`;
  const [notesOpen, setNotesOpen] = useState(() => localStorage.getItem(notesKey) !== 'false');

  const toggleNotes = () => {
    const next = !notesOpen;
    setNotesOpen(next);
    localStorage.setItem(notesKey, String(next));
  };

  const bd = dark ? 'border-slate-700' : 'border-gray-200';

  return (
    <div className="space-y-4">

      {/* ── Video section ─────────────────────────────────────── */}
      {hasVideo && (
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${bd}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                dark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-600'
              }`}>
                <FiPlayCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {lesson.title}
                </p>
                {lesson.duration && (
                  <p className={`text-xs flex items-center gap-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                    <FiClock className="w-3 h-3" /> {lesson.duration}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={toggleNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                notesOpen
                  ? dark ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                         : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              {notesOpen ? 'Hide Notes' : 'My Notes'}
            </button>
          </div>

          {/* Video + optional notes side by side */}
          {hasDirect && (
            <div className={`grid ${notesOpen ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
              <div className={notesOpen ? 'lg:col-span-3' : ''}>
                <InlineVideoPlayer src={videoHref} dark={dark} notesOpen={notesOpen} />
              </div>
              {notesOpen && (
                <div className={`lg:col-span-2 border-t lg:border-t-0 lg:border-l ${bd}`}>
                  <LessonNotes lessonId={lesson._id} theme={theme} compact />
                </div>
              )}
            </div>
          )}

          {/* YouTube embed */}
          {hasYT && (
            <div>
              <div className="relative w-full bg-black" style={{ paddingBottom: notesOpen ? undefined : '56.25%' }}>
                {notesOpen ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYTId(videoHref)}?rel=0&modestbranding=1`}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-video"
                        style={{ border: 'none', display: 'block' }}
                      />
                    </div>
                    <div className={`lg:col-span-2 border-t lg:border-t-0 lg:border-l ${bd}`}>
                      <LessonNotes lessonId={lesson._id} theme={theme} compact />
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYTId(videoHref)}?rel=0&modestbranding=1`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                  />
                )}
              </div>
            </div>
          )}

          {/* External video link */}
          {!hasDirect && !hasYT && (
            <div className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dark ? 'bg-violet-500/15' : 'bg-violet-50'
              }`}>
                <FiVideo className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {lesson.title}
                </p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                  External video
                </p>
              </div>
              <a
                href={videoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                           bg-violet-600 hover:bg-violet-700 text-white transition flex-shrink-0"
              >
                <FiExternalLink className="w-4 h-4" /> Open Video
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Document card ──────────────────────────────────────── */}
      {docHref && (
        <div className={`rounded-2xl border p-4 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            Document
          </p>
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
            dark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              dark ? 'bg-amber-500/15' : 'bg-amber-50'
            }`}>
              <FiFileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                {lesson.fileName || 'Document'}
              </p>
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                {lesson.allowDownload ? 'View · Download available' : 'View only'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openViewer(docHref, lesson.fileName)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  dark ? 'bg-slate-600 text-white hover:bg-slate-500'
                       : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FiExternalLink className="w-3.5 h-3.5" /> View
              </button>
              {lesson.allowDownload ? (
                <a
                  href={docHref}
                  download={lesson.fileName || true}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                             bg-emerald-600 hover:bg-emerald-700 text-white transition"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs ${
                  dark ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  <FiLock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Notes (standalone — no video) ─────────────────────── */}
      {!hasVideo && (
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${bd}`}>
            <span className={`text-xs font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              My Notes
            </span>
            <button
              onClick={toggleNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                notesOpen
                  ? dark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  : dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              {notesOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {notesOpen && (
            <div style={{ minHeight: 260 }}>
              <LessonNotes lessonId={lesson._id} theme={theme} />
            </div>
          )}
        </div>
      )}

      {/* ── Teacher lesson notes ────────────────────────────────── */}
      {lesson.content?.trim() && (
        <div className={`rounded-2xl border p-4 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            Lesson Notes
          </p>
          <div className={`rounded-xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap border ${
            dark ? 'bg-slate-700/40 border-slate-600 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            {lesson.content}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {!hasVideo && !docHref && !lesson.content?.trim() && (
        <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <FiBookOpen className={`w-10 h-10 mx-auto mb-3 opacity-25 ${dark ? 'text-slate-400' : 'text-gray-500'}`} />
          <p className={`font-semibold text-sm ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            No content yet for this lesson
          </p>
        </div>
      )}
    </div>
  );
}

/* ── tiny helper (not worth importing) ───────────────────────── */
function extractYTId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('v') || u.pathname.split('/').pop();
  } catch { return ''; }
}
