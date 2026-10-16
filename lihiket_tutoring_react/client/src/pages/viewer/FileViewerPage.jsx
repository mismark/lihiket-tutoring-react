/**
 * FileViewerPage — Full-page authenticated file viewer
 *
 * Route: /view?p=<encoded-path>&name=<encoded-name>
 *
 * Fetches the file from /api/files/view?p=... with a Bearer token,
 * creates a blob URL, and renders the appropriate viewer in-page.
 * The user never sees the real download URL.
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiLock, FiFileText, FiAlertCircle, FiArrowLeft,
  FiExternalLink, FiZoomIn, FiZoomOut, FiRotateCw, FiMaximize2,
  FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiRefreshCw,
} from 'react-icons/fi';

/* ── helpers ─────────────────────────────────────────────────── */
function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

const PDF_EXTS   = ['pdf'];
const IMG_EXTS   = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const OFFICE_EXTS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

/* ═══════════════════════════════════════════════════════════════ */
/* Full-featured Video Player                                      */
/* ═══════════════════════════════════════════════════════════════ */
function VideoPlayer({ src, dark }) {
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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRates,    setShowRates]    = useState(false);

  const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      const vid = videoRef.current;
      if (!vid) return;
      switch (e.key) {
        case ' ': case 'k':
          e.preventDefault(); vid.paused ? vid.play() : vid.pause(); break;
        case 'ArrowRight':
          e.preventDefault(); vid.currentTime = Math.min(vid.currentTime + 10, vid.duration || 0); resetTimer(); break;
        case 'ArrowLeft':
          e.preventDefault(); vid.currentTime = Math.max(vid.currentTime - 10, 0); resetTimer(); break;
        case 'ArrowUp':
          e.preventDefault(); vid.volume = Math.min(vid.volume + 0.1, 1); setVolume(vid.volume); break;
        case 'ArrowDown':
          e.preventDefault(); vid.volume = Math.max(vid.volume - 0.1, 0); setVolume(vid.volume); break;
        case 'm': vid.muted = !vid.muted; setMuted(vid.muted); break;
        case 'f': toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try { !document.fullscreenElement ? await el.requestFullscreen() : await document.exitFullscreen(); } catch {}
  };
  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleVolume = (e) => {
    const v = videoRef.current; if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val; v.muted = val === 0;
    setVolume(val); setMuted(val === 0);
  };
  const handleRate = (r) => {
    const v = videoRef.current; if (v) v.playbackRate = r;
    setPlaybackRate(r); setShowRates(false);
  };
  const retry = () => {
    setError(null); setBuffering(true);
    const v = videoRef.current; if (v) { v.load(); v.play().catch(() => {}); }
  };

  const pct    = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufPct = duration > 0 ? (buffered    / duration) * 100 : 0;
  const ctrlVis = showControls ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <div ref={containerRef}
      className="relative w-full h-full bg-black select-none"
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
        className="w-full h-full object-contain"
        onClick={togglePlay}
        style={{ cursor: showControls ? 'default' : 'none' }}
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
          setError({ 1: 'Playback aborted.', 2: 'Network error — check your connection.', 3: 'Video could not be decoded.', 4: 'Format not supported by your browser.' }[code] || 'Could not load video.');
          setBuffering(false); setPlaying(false);
        }}
      />

      {/* Spinner */}
      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-white text-sm font-semibold max-w-xs">{error}</p>
          <button onClick={retry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20
                       text-white text-sm font-bold transition border border-white/20">
            <FiRefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Big play indicator */}
      {!error && !buffering && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <FiPlay className="w-10 h-10 text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {!error && (
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                         px-5 pt-16 pb-4 transition-opacity duration-300 ${ctrlVis}`}>
          {/* Seek bar */}
          <div className="relative h-1.5 rounded-full bg-white/20 cursor-pointer mb-4 group/seek"
            onClick={handleSeek}
            role="slider" aria-label="Seek"
            aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') videoRef.current && (videoRef.current.currentTime += 5);
              if (e.key === 'ArrowLeft')  videoRef.current && (videoRef.current.currentTime -= 5);
            }}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4
                            rounded-full bg-white shadow-lg scale-0 group-hover/seek:scale-100 transition-transform"
              style={{ left: `${pct}%` }} />
          </div>

          {/* Bottom controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {playing ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6 translate-x-0.5" />}
            </button>

            {/* Volume */}
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {muted || volume === 0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={handleVolume} aria-label="Volume"
              className="w-24 accent-violet-500 cursor-pointer hidden sm:block" />

            {/* Time */}
            <span className="text-white/70 text-sm font-mono flex-shrink-0 ml-1">
              {fmtTime(currentTime)} <span className="text-white/40">/</span> {fmtTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Keyboard hints */}
            <span className="hidden lg:flex items-center gap-1.5 text-white/30 text-xs font-mono flex-shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">Space</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">← →</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">M</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">F</kbd>
            </span>

            {/* Speed */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowRates(v => !v)}
                className="text-white/70 hover:text-white text-sm font-bold px-2 py-1 rounded hover:bg-white/10 transition"
                aria-label="Playback speed">
                {playbackRate}×
              </button>
              {showRates && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-white/10
                                rounded-xl overflow-hidden shadow-2xl z-10 py-1">
                  {RATES.map(r => (
                    <button key={r} onClick={() => handleRate(r)}
                      className={`flex items-center justify-between w-full px-4 py-2 text-sm font-semibold transition
                                  hover:bg-white/10 ${r === playbackRate ? 'text-violet-400' : 'text-white/80'}`}>
                      {r}×
                      {r === playbackRate && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="text-white hover:text-violet-300 transition flex-shrink-0">
              {fullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* Zoomable Image Viewer                                           */
/* ═══════════════════════════════════════════════════════════════ */
function ImageViewer({ src, alt, dark }) {
  const [zoom,   setZoom]   = useState(1);
  const [rotate, setRotate] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className={`flex items-center justify-center gap-2 px-4 py-2.5 border-b flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} disabled={zoom <= 0.25}
          aria-label="Zoom out"
          className={`p-2 rounded-lg transition disabled:opacity-30 ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <FiZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(1)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums min-w-[52px] transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} disabled={zoom >= 4}
          aria-label="Zoom in"
          className={`p-2 rounded-lg transition disabled:opacity-30 ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <FiZoomIn className="w-4 h-4" />
        </button>
        <div className={`w-px h-5 mx-1 ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
        <button onClick={() => setRotate(r => r + 90)} aria-label="Rotate 90°"
          className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <FiRotateCw className="w-4 h-4" />
        </button>
        <button onClick={() => window.open(src, '_blank', 'noopener')} aria-label="Open full size"
          className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <FiMaximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className={`flex-1 overflow-auto flex items-center justify-center p-8 ${dark ? 'bg-slate-950' : 'bg-gray-200'}`}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}>
        {!loaded && !failed && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm ${dark ? 'text-slate-500' : 'text-gray-500'}`}>Loading…</p>
          </div>
        )}
        {failed && (
          <div className="text-center">
            <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-600'}`}>Could not load image</p>
          </div>
        )}
        <img src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false); }}
          className={`object-contain rounded-xl shadow-2xl transition-all duration-200 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          style={{
            transform: `scale(${zoom}) rotate(${rotate}deg)`,
            transformOrigin: 'center',
            maxWidth: zoom > 1 ? 'none' : '100%',
            maxHeight: zoom > 1 ? 'none' : 'calc(100vh - 160px)',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* FILE VIEWER PAGE                                                */
/* ═══════════════════════════════════════════════════════════════ */
export default function FileViewerPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { theme }  = useTheme();
  const dark       = theme === 'dark';

  const p    = params.get('p');
  const name = params.get('name');

  const [blobUrl, setBlobUrl] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const ext    = (p || '').split('.').pop().toLowerCase();
  const isPdf  = PDF_EXTS.includes(ext);
  const isImg  = IMG_EXTS.includes(ext);
  const isVid  = VIDEO_EXTS.includes(ext);
  const isDoc  = OFFICE_EXTS.includes(ext);

  // Derive a friendly file type label
  const typeLabel = isPdf ? 'PDF' : isImg ? 'Image' : isVid ? 'Video' : isDoc ? 'Document' : 'File';

  useEffect(() => {
    if (!p) {
      setError('No file path provided.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    // Use XHR so we can track download progress
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/files/view?p=${encodeURIComponent(p)}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';

    xhr.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      } else {
        // Indeterminate — pulse at ~50%
        setProgress(prev => prev < 80 ? prev + 5 : prev);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const url = URL.createObjectURL(xhr.response);
        setBlobUrl(url);
        setProgress(100);
      } else {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            try { setError(JSON.parse(reader.result)?.message || `Error ${xhr.status}`); }
            catch { setError(`HTTP ${xhr.status} — could not load file.`); }
          };
          reader.readAsText(xhr.response);
        } catch {
          setError(`HTTP ${xhr.status} — could not load file.`);
        }
      }
      setLoading(false);
    };

    xhr.onerror = () => { setError('Network error — check your connection.'); setLoading(false); };
    xhr.send();

    return () => {
      xhr.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  // ── Loading screen ────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen items-center justify-center gap-6 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`rounded-2xl border p-10 text-center max-w-xs w-full shadow-xl ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          {/* Animated icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            dark ? 'bg-blue-500/15' : 'bg-blue-50'
          }`}>
            <FiFileText className="w-7 h-7 text-blue-500 animate-pulse" />
          </div>
          <p className={`font-bold text-base mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
            {name || 'Loading file…'}
          </p>
          <p className={`text-xs mb-6 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            {typeLabel} · Secure download
          </p>
          {/* Progress bar */}
          <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress || 10}%` }}
            />
          </div>
          {progress > 0 && progress < 100 && (
            <p className={`text-xs mt-2 tabular-nums ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {progress}%
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────────
  if (error) {
    return (
      <div className={`flex flex-col min-h-screen items-center justify-center gap-6 p-4 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`rounded-2xl border p-10 text-center max-w-sm w-full shadow-xl ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            dark ? 'bg-red-500/15' : 'bg-red-50'
          }`}>
            <FiAlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className={`font-bold text-base mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Could not load file
          </p>
          <p className={`text-sm mb-7 leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              dark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}>
            <FiArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Viewer shell ──────────────────────────────────────────────
  return (
    <div className={`flex flex-col min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>

      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Back + file info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button onClick={() => navigate(-1)}
            aria-label="Back"
            className={`p-2 rounded-lg transition flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className={`w-px h-5 flex-shrink-0 ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <FiFileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              {name || 'Document'}
            </p>
            {ext && (
              <span className={`text-[10px] uppercase font-black tracking-widest ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                {ext}
              </span>
            )}
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {blobUrl && (
            <a href={blobUrl} target="_blank" rel="noopener noreferrer"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              <FiExternalLink className="w-3.5 h-3.5" /> Open in tab
            </a>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
            dark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
          }`}>
            <FiLock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View only</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

        {/* PDF */}
        {isPdf && blobUrl && (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title={name || 'Document'}
            className="flex-1 w-full"
            style={{ border: 'none', minHeight: 0, height: '100%' }}
          />
        )}

        {/* Image */}
        {isImg && blobUrl && (
          <ImageViewer src={blobUrl} alt={name || 'Image'} dark={dark} />
        )}

        {/* Video */}
        {isVid && blobUrl && (
          <div className="flex-1 bg-black">
            <VideoPlayer src={blobUrl} dark={dark} />
          </div>
        )}

        {/* Office — blob URLs can't pass through Google Docs viewer */}
        {isDoc && blobUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-10 text-center max-w-sm shadow-xl ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                dark ? 'bg-amber-500/15' : 'bg-amber-50'
              }`}>
                <FiFileText className="w-8 h-8 text-amber-500" />
              </div>
              <p className={`font-bold text-base mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                {name || 'Office Document'}
              </p>
              <p className={`text-sm leading-relaxed mb-7 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Office documents (.docx, .pptx, .xlsx) cannot be previewed inline when loaded securely.
                Ask your teacher to upload a PDF version for in-browser viewing.
              </p>
              <a href={blobUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-600/25">
                <FiExternalLink className="w-4 h-4" /> Open in new tab
              </a>
            </div>
          </div>
        )}

        {/* Unknown extension */}
        {!isPdf && !isImg && !isVid && !isDoc && blobUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-10 text-center max-w-sm shadow-xl ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                dark ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <FiFileText className={`w-8 h-8 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <p className={`font-bold text-base mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                {name || 'File loaded'}
              </p>
              <p className={`text-sm mb-7 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                This file type cannot be previewed in the browser.
              </p>
              <a href={blobUrl} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                  dark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                <FiExternalLink className="w-4 h-4" /> Open in tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
