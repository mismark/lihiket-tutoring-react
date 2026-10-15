import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiX, FiVideo, FiFileText, FiBookOpen, FiClock,
  FiDownload, FiLock, FiExternalLink, FiLayers,
  FiEdit3, FiSave, FiCheckCircle, FiEye,
  FiChevronsLeft, FiChevronsRight,
  FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
function isYT(url) { return !!(url && (url.includes('youtube.com') || url.includes('youtu.be'))); }
function ytEmbed(url) {
  try {
    const u  = new URL(url);
    const id = u.searchParams.get('v') || u.pathname.split('/').pop();
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  } catch { return url; }
}
function ytWatch(url) {
  try {
    const u  = new URL(url);
    const id = u.searchParams.get('v') || u.pathname.split('/').pop();
    return `https://www.youtube.com/watch?v=${id}`;
  } catch { return url; }
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

/**
 * Returns true if the URL points to a playable video file.
 * Handles:
 *   - Standard URLs ending in .mp4/.webm/.mov/.avi/.mkv
 *   - Cloudinary /raw/upload/ URLs that contain a video extension anywhere
 *   - Cloudinary /video/upload/ URLs (no extension needed)
 */
function isDirectVideo(url) {
  if (!url) return false;
  if (/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(url)) return true;
  // Cloudinary video resource type path
  if (/res\.cloudinary\.com\/.*\/video\/upload\//i.test(url)) return true;
  // Cloudinary raw upload that has a video extension somewhere in the path/filename
  if (/res\.cloudinary\.com\/.*\/raw\/upload\/.+\.(mp4|webm|mov|avi|mkv)/i.test(url)) return true;
  return false;
}

const TYPE_META = {
  video:    { icon: FiVideo,    label: 'Video',    color: '#8b5cf6' },
  document: { icon: FiFileText, label: 'Document', color: '#f59e0b' },
  text:     { icon: FiBookOpen, label: 'Text',     color: '#3b82f6' },
  mixed:    { icon: FiLayers,   label: 'Mixed',    color: '#10b981' },
};
const NOTE_KEY = (id) => `lesson_note_${id}`;

// ─── Custom Video Player ───────────────────────────────────────────────────────
function VideoPlayer({ src, title, allowDownload, dark }) {
  const videoRef      = useRef(null);
  const containerRef  = useRef(null);
  const hideTimer     = useRef(null);

  const [playing,     setPlaying]     = useState(false);
  const [muted,       setMuted]       = useState(false);
  const [volume,      setVolume]      = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [buffered,    setBuffered]    = useState(0);
  const [buffering,   setBuffering]   = useState(true);  // true until first metadata
  const [error,       setError]       = useState(null);
  const [fullscreen,  setFullscreen]  = useState(false);
  const [showControls,setShowControls]= useState(true);
  const [playbackRate,setPlaybackRate]= useState(1);
  const [showRates,   setShowRates]   = useState(false);

  const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // ── hide controls after inactivity ──────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => { resetHideTimer(); }, [playing, resetHideTimer]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // ── fullscreen change listener ───────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Only handle if no input element is focused
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
      const vid = videoRef.current;
      if (!vid) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          vid.paused ? vid.play() : vid.pause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          vid.currentTime = Math.min(vid.currentTime + 10, vid.duration || 0);
          resetHideTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          vid.currentTime = Math.max(vid.currentTime - 10, 0);
          resetHideTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          vid.volume = Math.min(vid.volume + 0.1, 1);
          setVolume(vid.volume);
          break;
        case 'ArrowDown':
          e.preventDefault();
          vid.volume = Math.max(vid.volume - 0.1, 0);
          setVolume(vid.volume);
          break;
        case 'm':
          vid.muted = !vid.muted;
          setMuted(vid.muted);
          break;
        case 'f':
          toggleFullscreen();
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.paused ? vid.play() : vid.pause();
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const handleSeek = (e) => {
    const vid = videoRef.current;
    if (!vid || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * duration;
    setCurrentTime(vid.currentTime);
  };

  const handleVolume = (e) => {
    const vid = videoRef.current;
    if (!vid) return;
    const v = parseFloat(e.target.value);
    vid.volume = v;
    vid.muted  = v === 0;
    setVolume(v);
    setMuted(v === 0);
  };

  const handleRate = (r) => {
    const vid = videoRef.current;
    if (vid) vid.playbackRate = r;
    setPlaybackRate(r);
    setShowRates(false);
  };

  const handleRetry = () => {
    setError(null);
    setBuffering(true);
    const vid = videoRef.current;
    if (vid) { vid.load(); vid.play().catch(() => {}); }
  };

  // ── video events ─────────────────────────────────────────────────────────────
  const onLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
    setBuffering(false);
  };
  const onTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    // update buffered amount
    if (vid.buffered.length > 0) {
      setBuffered(vid.buffered.end(vid.buffered.length - 1));
    }
  };
  const onProgress = () => {
    const vid = videoRef.current;
    if (vid?.buffered.length > 0) {
      setBuffered(vid.buffered.end(vid.buffered.length - 1));
    }
  };
  const onPlay    = () => { setPlaying(true);  setBuffering(false); };
  const onPause   = () => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); };
  const onWaiting = () => setBuffering(true);
  const onCanPlay = () => setBuffering(false);
  const onEnded   = () => { setPlaying(false); setShowControls(true); };
  const onError   = () => {
    const vid  = videoRef.current;
    const code = vid?.error?.code;
    const msgs = {
      1: 'Playback was aborted.',
      2: 'Network error — check your connection.',
      3: 'Video could not be decoded.',
      4: 'Video format not supported by your browser.',
    };
    setError(msgs[code] || 'Could not load video. Try refreshing.');
    setBuffering(false);
    setPlaying(false);
  };

  const pct        = duration > 0 ? (currentTime / duration) * 100 : 0;
  const buffPct    = duration > 0 ? (buffered   / duration) * 100 : 0;
  const ctrlBg     = 'bg-gradient-to-t from-black/80 to-transparent';
  const ctrlVis    = showControls ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none group"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={resetHideTimer}
    >
      {/* ── Video element ─────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        controlsList={allowDownload ? undefined : 'nodownload'}
        className="w-full h-full object-contain"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onProgress={onProgress}
        onPlay={onPlay}
        onPause={onPause}
        onWaiting={onWaiting}
        onCanPlay={onCanPlay}
        onEnded={onEnded}
        onError={onError}
        onClick={togglePlay}
        style={{ cursor: showControls ? 'default' : 'none' }}
      />

      {/* ── Buffering spinner ─────────────────────────────────────────────── */}
      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* ── Error overlay ─────────────────────────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-white text-sm font-semibold max-w-xs">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10
                       hover:bg-white/20 text-white text-sm font-bold transition border border-white/20">
            <FiRefreshCw className="w-4 h-4" /> Retry
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-white/80 underline transition">
            Open video in new tab
          </a>
        </div>
      )}

      {/* ── Big play/pause indicator (flash) ─────────────────────────────── */}
      {!error && !buffering && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none
                      transition-opacity duration-200 ${showControls && !playing ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <FiPlay className="w-8 h-8 text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* ── Controls overlay ─────────────────────────────────────────────── */}
      {!error && (
        <div className={`absolute inset-x-0 bottom-0 ${ctrlBg} px-4 pt-8 pb-3
                         transition-opacity duration-200 ${ctrlVis}`}>

          {/* Progress bar */}
          <div
            className="relative h-1.5 rounded-full bg-white/20 cursor-pointer mb-3 group/seek"
            onClick={handleSeek}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') videoRef.current && (videoRef.current.currentTime += 5);
              if (e.key === 'ArrowLeft')  videoRef.current && (videoRef.current.currentTime -= 5);
            }}
          >
            {/* Buffered */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all"
              style={{ width: `${buffPct}%` }} />
            {/* Played */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all"
              style={{ width: `${pct}%` }} />
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5
                            rounded-full bg-white shadow-lg opacity-0 group-hover/seek:opacity-100
                            transition-opacity"
              style={{ left: `${pct}%` }} />
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-3">

            {/* Play/Pause */}
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {playing
                ? <FiPause className="w-5 h-5" />
                : <FiPlay  className="w-5 h-5 translate-x-0.5" />}
            </button>

            {/* Volume */}
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {muted || volume === 0
                ? <FiVolumeX className="w-5 h-5" />
                : <FiVolume2 className="w-5 h-5" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={handleVolume}
              aria-label="Volume"
              className="w-20 accent-violet-500 cursor-pointer hidden sm:block"
            />

            {/* Time */}
            <span className="text-white/80 text-xs font-mono flex-shrink-0 ml-1">
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Playback speed */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowRates(v => !v)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded
                           hover:bg-white/10 transition"
                aria-label="Playback speed">
                {playbackRate}×
              </button>
              {showRates && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10
                                rounded-xl overflow-hidden shadow-xl z-10">
                  {RATES.map(r => (
                    <button key={r} onClick={() => handleRate(r)}
                      className={`block w-full px-4 py-2 text-xs font-bold text-left transition
                                  hover:bg-white/10 ${r === playbackRate ? 'text-violet-400' : 'text-white'}`}>
                      {r}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {fullscreen
                ? <FiMinimize className="w-4 h-4" />
                : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Doc card ─────────────────────────────────────────────────────────────────
function DocSection({ docHref, lesson, dark, txt, txtSub, cardBg }) {
  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-wider mb-2
          ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
        Document
      </p>
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${cardBg}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${dark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
          <FiFileText className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${txt}`}>{lesson.fileName || 'Document'}</p>
          <p className={`text-xs ${txtSub}`}>{lesson.allowDownload ? 'Download available' : 'View only'}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => openViewer(docHref, lesson.fileName)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition
              ${dark ? 'bg-slate-600 text-white hover:bg-slate-500'
                     : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
            <FiEye className="w-3.5 h-3.5" /> View
          </button>
          {lesson.allowDownload ? (
            <a href={docHref} download={lesson.fileName || true}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                         bg-emerald-600 hover:bg-emerald-700 text-white transition">
              <FiDownload className="w-3.5 h-3.5" /> Download
            </a>
          ) : (
            <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs
              ${dark ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
              <FiLock className="w-3.5 h-3.5" /> Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LessonView({ lesson, onClose, theme }) {
  const dark = theme === 'dark';
  if (!lesson) return null;

  const meta      = TYPE_META[lesson.type] || TYPE_META.text;
  const TypeIcon  = meta.icon;
  const videoHref = fileHref(lesson.videoUrl);
  const docHref   = fileHref(lesson.fileUrl);
  const isDirect  = isDirectVideo(videoHref);
  const isYoutube = isYT(videoHref);

  const [note,        setNote]        = useState(() => localStorage.getItem(NOTE_KEY(lesson._id)) || '');
  const [noteSaved,   setNoteSaved]   = useState(false);
  const [noteEditing, setNoteEditing] = useState(!localStorage.getItem(NOTE_KEY(lesson._id)));
  const [panelOpen,   setPanelOpen]   = useState(true);

  const saveNote = () => {
    localStorage.setItem(NOTE_KEY(lesson._id), note);
    setNoteSaved(true); setNoteEditing(false);
    setTimeout(() => setNoteSaved(false), 2000);
  };
  const clearNote = () => {
    setNote(''); setNoteEditing(true);
    localStorage.removeItem(NOTE_KEY(lesson._id));
  };

  const bd      = dark ? 'border-slate-700' : 'border-gray-100';
  const txt     = dark ? 'text-white'        : 'text-gray-900';
  const txtSub  = dark ? 'text-slate-400'    : 'text-gray-500';
  const txtMute = dark ? 'text-slate-500'    : 'text-gray-400';
  const cardBg  = dark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50
        ${panelOpen ? 'p-4' : 'p-1'}`}>
      <div
        className={`flex flex-col w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden
            ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
        style={{ height: panelOpen ? '95vh' : '99vh' }}>

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b ${bd}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
              <TypeIcon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-extrabold truncate ${txt}`}>{lesson.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${meta.color}18`, color: meta.color }}>
                  {meta.label}
                </span>
                {lesson.duration && (
                  <span className={`flex items-center gap-1 text-xs ${txtSub}`}>
                    <FiClock className="w-3 h-3" /> {lesson.duration}
                  </span>
                )}
                {!lesson.isPublished && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold
                                   bg-amber-100 text-amber-700">Draft</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            {/* Keyboard shortcut hint */}
            {isDirect && (
              <span className={`hidden md:inline-flex text-xs px-2 py-1 rounded-lg mr-1
                  ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                Space · ←→ · M · F
              </span>
            )}
            <button onClick={onClose}
              className={`p-2 rounded-xl transition
                ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body row ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ═══ LEFT — video fills full remaining height ═══ */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Video */}
            {videoHref && (
              <div className="flex-1 bg-black min-h-0">
                {isDirect ? (
                  <VideoPlayer
                    src={videoHref}
                    title={lesson.title}
                    allowDownload={lesson.allowDownload}
                    dark={dark}
                  />
                ) : isYoutube ? (
                  <iframe
                    src={ytEmbed(videoHref)}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <a href={videoHref} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold
                                 bg-violet-600 hover:bg-violet-700 text-white transition">
                      <FiExternalLink className="w-4 h-4" /> Open Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Strip below video */}
            {videoHref && (
              <div className={`flex-shrink-0 overflow-y-auto px-4 py-3 space-y-3
                  border-t ${bd} ${dark ? 'bg-slate-800' : 'bg-white'}`}
                style={{ maxHeight: '30%' }}>
                {isYoutube && (
                  <a href={ytWatch(videoHref)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold
                               text-red-500 hover:underline transition">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
                  </a>
                )}
                {docHref && (
                  <DocSection docHref={docHref} lesson={lesson} dark={dark}
                    txt={txt} txtSub={txtSub} cardBg={cardBg} />
                )}
                {lesson.content?.trim() && (
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider mb-1.5 ${txtMute}`}>Lesson Notes</p>
                    <div className={`rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap border ${cardBg}
                        ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {lesson.content}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No video — doc + notes fullscreen */}
            {!videoHref && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {docHref && (
                  <DocSection docHref={docHref} lesson={lesson} dark={dark}
                    txt={txt} txtSub={txtSub} cardBg={cardBg} />
                )}
                {lesson.content?.trim() && (
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${txtMute}`}>Lesson Notes</p>
                    <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap border ${cardBg}
                        ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {lesson.content}
                    </div>
                  </div>
                )}
                {!docHref && !lesson.content?.trim() && (
                  <div className={`text-center py-16 ${txtMute}`}>
                    <FiBookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No content yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ TOGGLE BUTTON ═══ */}
          <button
            onClick={() => setPanelOpen(v => !v)}
            title={panelOpen ? 'Hide notes' : 'Show notes'}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5
                        w-10 transition-colors border-l
                        ${dark
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'}`}>
            {panelOpen
              ? <FiChevronsRight className="w-5 h-5" />
              : <FiChevronsLeft  className="w-5 h-5" />}
            <span className="text-xs font-bold" style={{ writingMode: 'vertical-rl', letterSpacing: 1 }}>
              {panelOpen ? 'HIDE' : 'NOTES'}
            </span>
          </button>

          {/* ═══ RIGHT — My Notes panel ═══ */}
          <div
            className={`flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 border-l ${bd}`}
            style={{ width: panelOpen ? 320 : 0, opacity: panelOpen ? 1 : 0 }}>

            <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 border-b ${bd}
                ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                style={{ color: '#10b981' }}>
                <FiEdit3 className="w-3.5 h-3.5" /> My Notes
              </span>
              {note && !noteEditing && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  ✓ Saved
                </span>
              )}
            </div>

            <div className={`flex flex-col flex-1 overflow-hidden px-4 py-4 gap-3
                ${dark ? 'bg-slate-800' : 'bg-white'}`}>
              {noteEditing ? (
                <>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Write your personal notes here…"
                    className={`flex-1 w-full px-3.5 py-3 rounded-xl text-sm leading-relaxed
                                resize-none outline-none focus:ring-2 focus:ring-emerald-500/40 transition
                      ${dark
                        ? 'bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500'
                        : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400'}`}
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={saveNote}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                 text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
                      {noteSaved
                        ? <><FiCheckCircle className="w-4 h-4" /> Saved!</>
                        : <><FiSave className="w-4 h-4" /> Save</>}
                    </button>
                    {note && (
                      <button onClick={() => setNoteEditing(false)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition
                          ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={`flex-1 overflow-y-auto rounded-xl px-4 py-3 text-sm
                      leading-relaxed whitespace-pre-wrap border
                      ${note
                        ? dark ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                               : 'bg-emerald-50 text-gray-700 border-emerald-100'
                        : dark ? 'bg-slate-700/30 text-slate-500 border-slate-700'
                               : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                    {note || 'No notes yet. Click Edit to start writing.'}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setNoteEditing(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                                  text-sm font-bold transition
                        ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <FiEdit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {note && (
                      <button onClick={clearNote}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold
                                   text-red-400 hover:bg-red-500/10 transition">
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

        {/* ── Footer ── */}
        <div className={`px-5 py-3 flex-shrink-0 border-t ${bd}`}>
          <button onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition
              ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
