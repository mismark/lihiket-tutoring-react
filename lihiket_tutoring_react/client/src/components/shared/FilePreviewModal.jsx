/**
 * FilePreviewModal — Universal file viewer
 *
 * Handles:
 *  - PDF            → native <iframe> embed
 *  - Images         → <img> display
 *  - Video          → <video> player (no download)
 *  - Office (docx, pptx, xlsx, doc, ppt, xls) → Google Docs Viewer
 *  - Unknown        → info message with open/download buttons
 *
 * Works with both Cloudinary URLs (https://...) and local /uploads/... paths.
 *
 * Props:
 *   url        {string}  — full URL or /uploads/... path
 *   name       {string}  — display filename
 *   allowDownload {bool} — show download button (default true)
 *   onClose    {fn}      — close handler
 */

import { useState, useEffect } from 'react';
import {
  FiX, FiDownload, FiExternalLink, FiFileText,
  FiAlertCircle, FiLock, FiMaximize2,
} from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Resolve any file path/URL to a full URL
function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // local /uploads/... path
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${SERVER}${clean}`;
}

function getExt(url) {
  if (!url) return '';
  return url.split('.').pop().split('?')[0].toLowerCase();
}

const PDF_EXTS   = ['pdf'];
const IMG_EXTS   = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi'];
const OFFICE_EXTS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

export default function FilePreviewModal({ url, name, allowDownload = true, onClose }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const fullUrl = resolveUrl(url);
  const ext     = getExt(fullUrl || url || '');

  const isPdf    = PDF_EXTS.includes(ext);
  const isImage  = IMG_EXTS.includes(ext);
  const isVideo  = VIDEO_EXTS.includes(ext);
  const isOffice = OFFICE_EXTS.includes(ext);

  // Google Docs Viewer URL for Office files
  const googleDocsUrl = isOffice && fullUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
    : null;

  const [frameError, setFrameError] = useState(false);
  const [fullscreen, setFullscreen]  = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const displayName = name || 'Document';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex flex-col"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      {/* ── Top bar ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
          }`}>
            <FiFileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {displayName}
            </p>
            {ext && (
              <p className={`text-xs uppercase font-mono ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                .{ext}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Download */}
          {allowDownload && fullUrl && (
            <a href={fullUrl} download={displayName} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                dark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                     : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}>
              <FiDownload className="w-3.5 h-3.5" /> Download
            </a>
          )}

          {/* Open in new tab */}
          {fullUrl && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              <FiExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          )}

          {/* View-only badge (when no download) */}
          {!allowDownload && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              <FiLock className="w-3.5 h-3.5" /> View only
            </span>
          )}

          {/* Close */}
          <button onClick={onClose}
            className={`p-2 rounded-lg transition ${
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
        {isPdf && fullUrl && (
          <iframe
            src={`${fullUrl}#toolbar=1&navpanes=0`}
            title={displayName}
            className="flex-1 w-full"
            style={{ border: 'none', minHeight: 0 }}
            onError={() => setFrameError(true)}
          />
        )}

        {/* Image */}
        {isImage && fullUrl && (
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <img
              src={fullUrl}
              alt={displayName}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            />
          </div>
        )}

        {/* Video */}
        {isVideo && fullUrl && (
          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              src={fullUrl}
              controls
              controlsList="nodownload"
              className="max-w-full max-h-screen"
              style={{ outline: 'none', maxHeight: 'calc(100vh - 60px)' }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* Office files — Google Docs Viewer */}
        {isOffice && !frameError && googleDocsUrl && (
          <div className="flex-1 flex flex-col">
            <div className={`flex items-center gap-2 px-4 py-2 text-xs border-b ${
              dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Previewed via Google Docs Viewer. For best results, open the file directly.
            </div>
            <iframe
              src={googleDocsUrl}
              title={displayName}
              className="flex-1 w-full"
              style={{ border: 'none', minHeight: 0 }}
              onError={() => setFrameError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        )}

        {/* Office files — Google Docs Viewer failed */}
        {isOffice && (frameError || !googleDocsUrl) && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-8 text-center max-w-sm w-full ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <FiFileText className={`w-14 h-14 mx-auto mb-4 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
              <p className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
              <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                This file type cannot be previewed inline. Open it directly to view.
              </p>
              {fullUrl && (
                <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg">
                  <FiExternalLink className="w-4 h-4" /> Open File
                </a>
              )}
            </div>
          </div>
        )}

        {/* Unknown file type */}
        {!isPdf && !isImage && !isVideo && !isOffice && fullUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-8 text-center max-w-sm w-full ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <FiFileText className={`w-14 h-14 mx-auto mb-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
              <p className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
              <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Preview not available for this file type.
              </p>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg">
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
              <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>File not available</p>
              <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                No file URL was provided.
              </p>
            </div>
          </div>
        )}

        {/* PDF frame error fallback */}
        {isPdf && frameError && fullUrl && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`rounded-2xl border p-8 text-center max-w-sm w-full ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>Could not embed PDF</p>
              <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Open the file directly in your browser to view it.
              </p>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                <FiExternalLink className="w-4 h-4" /> Open PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
