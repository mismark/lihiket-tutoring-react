/**
 * FilePreviewModal — Universal file viewer
 *
 * Supports:
 *  PDF          → native <iframe> embed (proxy URL)
 *  Images       → zoomable <img> viewer
 *  Video        → custom HTML5 player with full controls
 *  Office files → Google Docs Viewer with fallback
 *  Unknown      → Open-in-new-tab fallback
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiX, FiDownload, FiExternalLink, FiFileText,
  FiAlertCircle, FiLock, FiZoomIn, FiZoomOut,
  FiRotateCw, FiMaximize2, FiPlay, FiPause,
  FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiRefreshCw,
} from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${SERVER}${clean}`;
}

function getExt(url) {
  if (!url) return '';
  const pathname = url.split('?')[0];
  const parts    = pathname.split('.');
  if (parts.length > 1) {
    const ext = parts.pop().toLowerCase();
    if (ext.length <= 5) return ext;
  }
  if (url.includes('/raw/upload/'))   return 'pdf';
  if (url.includes('/video/upload/')) return 'mp4';
  if (url.includes('/image/upload/')) return 'jpg';
  return '';
}

function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}

const PDF_EXTS    = ['pdf'];
const IMG_EXTS    = ['png','jpg','jpeg','gif','webp','svg','bmp'];
const VIDEO_EXTS  = ['mp4','webm','mov','avi','mkv'];
const OFFICE_EXTS = ['doc','docx','ppt','pptx','xls','xlsx'];

/* ────────────────────────────────────────────────────────────── */
/* Mini Video Player                                              */
/* ────────────────────────────────────────────────────────────── */
function MiniVideoPlayer({ src, dark, allowDownload }) {
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

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
      const vid = videoRef.current;
      if (!vid) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); vid.paused ? vid.play() : vid.pause(); break;
        case 'ArrowRight':  e.preventDefault(); vid.currentTime = Math.min(vid.currentTime + 10, vid.duration||0); break;
        case 'ArrowLeft':   e.preventDefault(); vid.currentTime = Math.max(vid.currentTime - 10, 0); break;
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
    const v = videoRef.current; if (!v || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleVolume = (e) => {
    const v = videoRef.current; if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val; v.muted = val === 0;
    setVolume(val); setMuted(val === 0);
  };

  const pct     = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufPct  = duration > 0 ? (buffered    / duration) * 100 : 0;
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
        controlsList={allowDownload ? undefined : 'nodownload'}
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
        onPlay={()    => { setPlaying(true);  setBuffering(false); }}
        onPause={()   => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); }}
        onWaiting={()  => setBuffering(true)}
        onCanPlay={()  => setBuffering(false)}
        onEnded={()   => { setPlaying(false); setShowControls(true); }}
        onError={() => {
          const code = videoRef.current?.error?.code;
          setError({ 1:'Playback aborted.', 2:'Network error.', 3:'Decode error.', 4:'Format not supported.' }[code] || 'Could not load video.');
          setBuffering(false); setPlaying(false);
        }}
      />

      {/* Buffering spinner */}
      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
          <FiAlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white text-sm font-semibold max-w-xs">{error}</p>
          <button onClick={() => { setError(null); setBuffering(true); const v = videoRef.current; if (v) { v.load(); v.play().catch(()=>{}); }}}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition border border-white/20">
            <FiRefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Big play indicator */}
      {!error && !buffering && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <FiPlay className="w-8 h-8 text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Controls */}
      {!error && (
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent
                         px-4 pt-12 pb-3 transition-opacity duration-300 ${ctrlVis}`}>
          {/* Progress */}
          <div className="relative h-1 rounded-full bg-white/25 cursor-pointer mb-3.5 group/seek"
            onClick={handleSeek} role="slider"
            aria-label="Seek" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key==='ArrowRight') videoRef.current && (videoRef.current.currentTime += 5);
              if (e.key==='ArrowLeft')  videoRef.current && (videoRef.current.currentTime -= 5);
            }}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width:`${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500" style={{ width:`${pct}%` }} />
            {/* Thumb — bigger hit area on hover */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full
                            bg-white shadow-lg scale-0 group-hover/seek:scale-100 transition-transform"
              style={{ left:`${pct}%` }} />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePlay} aria-label={playing?'Pause':'Play'}
              className="text-white hover:text-violet-300 transition">
              {playing ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 translate-x-0.5" />}
            </button>
            <button onClick={toggleMute} aria-label={muted?'Unmute':'Mute'}
              className="text-white hover:text-violet-300 transition">
              {muted || volume===0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted?0:volume}
              onChange={handleVolume} aria-label="Volume"
              className="w-16 accent-violet-500 cursor-pointer hidden sm:block" />
            <span className="text-white/75 text-xs font-mono ml-1 flex-shrink-0">
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>
            <div className="flex-1" />
            {allowDownload && src && (
              <a
                href={src}
                download
                aria-label="Download video"
                className="text-white/70 hover:text-emerald-300 transition flex-shrink-0"
                title="Download"
              >
                <FiDownload className="w-4 h-4" />
              </a>
            )}
            <button onClick={toggleFullscreen}
              aria-label={fullscreen?'Exit fullscreen':'Fullscreen'}
              className="text-white hover:text-violet-300 transition">
              {fullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Image Viewer with zoom + rotate                                */
/* ────────────────────────────────────────────────────────────── */
function ImageViewer({ src, alt, dark }) {
  const [zoom,    setZoom]    = useState(1);
  const [rotate,  setRotate]  = useState(0);
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);

  const zoomIn  = () => setZoom(z => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const reset   = () => { setZoom(1); setRotate(0); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className={`flex items-center justify-center gap-2 px-4 py-2 border-b flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <button onClick={zoomOut} disabled={zoom <= 0.25}
          className={`p-2 rounded-lg transition disabled:opacity-40 ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-gray-700'}`}
          aria-label="Zoom out">
          <FiZoomOut className="w-4 h-4" />
        </button>
        <button onClick={reset}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} disabled={zoom >= 4}
          className={`p-2 rounded-lg transition disabled:opacity-40 ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-gray-700'}`}
          aria-label="Zoom in">
          <FiZoomIn className="w-4 h-4" />
        </button>
        <div className={`w-px h-4 mx-1 ${dark ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <button onClick={() => setRotate(r => r + 90)}
          className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-gray-700'}`}
          aria-label="Rotate">
          <FiRotateCw className="w-4 h-4" />
        </button>
        <button onClick={() => window.open(src, '_blank', 'noopener')}
          className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-gray-700'}`}
          aria-label="Open full size">
          <FiMaximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image canvas */}
      <div className={`flex-1 overflow-auto flex items-center justify-center p-6 ${dark ? 'bg-slate-950' : 'bg-gray-200'}`}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}>
        {!loaded && !errored && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-500'}`}>Loading image…</p>
          </div>
        )}
        {errored && (
          <div className="text-center">
            <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-600'}`}>Could not load image</p>
          </div>
        )}
        {src && (
          <img
            src={src} alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => { setErrored(true); setLoaded(false); }}
            className={`object-contain rounded-lg shadow-2xl transition-all duration-200 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            style={{
              transform: `scale(${zoom}) rotate(${rotate}deg)`,
              transformOrigin: 'center',
              maxWidth: zoom > 1 ? 'none' : '100%',
              maxHeight: zoom > 1 ? 'none' : 'calc(100vh - 160px)',
            }}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* PDF viewer with loading state                                  */
/* ────────────────────────────────────────────────────────────── */
function PdfViewer({ src, name, dark }) {
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {loading && !failed && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${dark ? 'bg-slate-950' : 'bg-gray-100'}`}>
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading PDF…</p>
        </div>
      )}
      {!failed ? (
        <iframe
          src={`${src}#toolbar=1&navpanes=0&scrollbar=1`}
          title={name || 'Document'}
          className="flex-1 w-full"
          style={{ border: 'none', minHeight: 0 }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={`rounded-2xl border p-8 text-center max-w-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>Could not embed PDF</p>
            <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Click "Open" in the toolbar above to view it in a new tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Office / Google Docs viewer                                    */
/* ────────────────────────────────────────────────────────────── */
function OfficeViewer({ googleSrc, name, rawUrl, dark }) {
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {loading && !failed && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${dark ? 'bg-slate-950' : 'bg-gray-100'}`}>
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            Loading preview via Google Docs…
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
            This may take a few seconds
          </p>
        </div>
      )}
      {!failed ? (
        <iframe
          src={googleSrc}
          title={name || 'Document'}
          className="flex-1 w-full"
          style={{ border: 'none', minHeight: 0 }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={`rounded-2xl border p-8 text-center max-w-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiFileText className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
            <p className={`font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{name || 'Document'}</p>
            <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Preview failed. Open the file directly to view it.
            </p>
            {rawUrl && (
              <a href={rawUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiExternalLink className="w-4 h-4" /> Open File
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* FILE TYPE BADGE                                                */
/* ────────────────────────────────────────────────────────────── */
const EXT_COLORS = {
  pdf: 'bg-red-100 text-red-700',
  mp4: 'bg-violet-100 text-violet-700', webm: 'bg-violet-100 text-violet-700',
  mov: 'bg-violet-100 text-violet-700', avi:  'bg-violet-100 text-violet-700',
  jpg: 'bg-emerald-100 text-emerald-700', jpeg: 'bg-emerald-100 text-emerald-700',
  png: 'bg-emerald-100 text-emerald-700', gif:  'bg-emerald-100 text-emerald-700',
  webp:'bg-emerald-100 text-emerald-700', svg:  'bg-emerald-100 text-emerald-700',
  doc:  'bg-blue-100 text-blue-700', docx: 'bg-blue-100 text-blue-700',
  ppt:  'bg-orange-100 text-orange-700', pptx:'bg-orange-100 text-orange-700',
  xls:  'bg-teal-100 text-teal-700',   xlsx:'bg-teal-100 text-teal-700',
};
const EXT_COLORS_DARK = {
  pdf: 'bg-red-500/20 text-red-400',
  mp4: 'bg-violet-500/20 text-violet-400', webm: 'bg-violet-500/20 text-violet-400',
  mov: 'bg-violet-500/20 text-violet-400', avi:  'bg-violet-500/20 text-violet-400',
  jpg: 'bg-emerald-500/20 text-emerald-400', jpeg: 'bg-emerald-500/20 text-emerald-400',
  png: 'bg-emerald-500/20 text-emerald-400', gif:  'bg-emerald-500/20 text-emerald-400',
  webp:'bg-emerald-500/20 text-emerald-400', svg:  'bg-emerald-500/20 text-emerald-400',
  doc:  'bg-blue-500/20 text-blue-400',  docx: 'bg-blue-500/20 text-blue-400',
  ppt:  'bg-orange-500/20 text-orange-400', pptx:'bg-orange-500/20 text-orange-400',
  xls:  'bg-teal-500/20 text-teal-400',    xlsx:'bg-teal-500/20 text-teal-400',
};

/* ────────────────────────────────────────────────────────────── */
/* MAIN COMPONENT                                                 */
/* ────────────────────────────────────────────────────────────── */
export default function FilePreviewModal({ url, name, allowDownload = true, onClose }) {
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const fullUrl = resolveUrl(url);
  const rawUrl  = fullUrl;
  const ext     = getExt(url || '');

  const isPdf    = PDF_EXTS.includes(ext);
  const isImage  = IMG_EXTS.includes(ext);
  const isVideo  = VIDEO_EXTS.includes(ext);
  const isOffice = OFFICE_EXTS.includes(ext);

  const googleDocsUrl = isOffice && rawUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`
    : null;

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const displayName = name || 'Document';
  const extColor    = dark
    ? EXT_COLORS_DARK[ext] || 'bg-slate-700 text-slate-300'
    : EXT_COLORS[ext]      || 'bg-gray-100 text-gray-600';

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex flex-col"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${displayName}`}
    >
      {/* ── Top bar ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        {/* Left: icon + name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <FiFileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              {displayName}
            </p>
            {ext && (
              <span className={`inline-block text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded mt-0.5 ${extColor}`}>
                {ext}
              </span>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
          {allowDownload && rawUrl && (
            <a href={rawUrl} download={displayName} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dark ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30'
                     : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200'
              }`}>
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
          {rawUrl && (
            <a href={rawUrl} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              <FiExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}
          {!allowDownload && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              dark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
            }`}>
              <FiLock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View only</span>
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-lg transition ml-1 ${
              dark ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                   : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className={`flex-1 overflow-hidden flex flex-col ${dark ? 'bg-slate-950' : 'bg-gray-100'}`}>

        {/* PDF */}
        {isPdf && fullUrl && <PdfViewer src={fullUrl} name={displayName} dark={dark} />}

        {/* Image */}
        {isImage && fullUrl && <ImageViewer src={fullUrl} alt={displayName} dark={dark} />}

        {/* Video */}
        {isVideo && fullUrl && (
          <div className="flex-1 flex items-center justify-center bg-black">
            <MiniVideoPlayer src={fullUrl} dark={dark} allowDownload={allowDownload} />
          </div>
        )}

        {/* Office */}
        {isOffice && googleDocsUrl && (
          <OfficeViewer googleSrc={googleDocsUrl} name={displayName} rawUrl={rawUrl} dark={dark} />
        )}

        {/* Unknown */}
        {!isPdf && !isImage && !isVideo && !isOffice && fullUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-10 text-center max-w-sm w-full ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                dark ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <FiFileText className={`w-8 h-8 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <p className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
              <p className={`text-sm mb-7 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Preview not available for this file type.
              </p>
              <a href={rawUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
                           bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-600/25">
                <FiExternalLink className="w-4 h-4" /> Open File
              </a>
            </div>
          </div>
        )}

        {/* No URL */}
        {!fullUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>File not available</p>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                No URL was provided for this file.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
