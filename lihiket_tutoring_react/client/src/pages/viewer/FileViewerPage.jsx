import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiLock, FiFileText, FiAlertCircle } from 'react-icons/fi';

export default function FileViewerPage() {
  const [params]  = useSearchParams();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const p    = params.get('p');    // e.g. uploads/lessons/12345.pdf
  const name = params.get('name');

  const [blobUrl, setBlobUrl] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  const ext    = (p || '').split('.').pop().toLowerCase();
  const isDoc  = ['doc','docx','ppt','pptx','xls','xlsx'].includes(ext);

  useEffect(() => {
    if (!p) { setError('No file path provided.'); setLoading(false); return; }

    const token = localStorage.getItem('token');

    // Fetch the file as a blob so the browser never sees a real download URL
    fetch(`/api/files/view?p=${encodeURIComponent(p)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.message || `HTTP ${res.status}`); });
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(err => setError(err.message || 'Failed to load file'))
      .finally(() => setLoading(false));

    // Cleanup blob URL when component unmounts
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [p]);

  // Google Docs viewer for Office files (needs a publicly accessible URL — fallback only)
  const googleSrc = isDoc && blobUrl
    ? null  // blob URLs can't be used with Google Docs viewer; show unsupported message
    : null;

  return (
    <div className={`flex flex-col min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-100'}`}>

      {/* ── Top bar ── */}
      <div className={`flex items-center justify-between px-5 py-3 border-b flex-shrink-0 ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <FiFileText className={`w-5 h-5 ${dark ? 'text-slate-400' : 'text-gray-500'}`} />
          <span className={`text-sm font-semibold truncate max-w-xs ${dark ? 'text-white' : 'text-gray-900'}`}>
            {name || 'Document'}
          </span>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
        }`}>
          <FiLock className="w-3.5 h-3.5" /> View only
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 relative flex flex-col">

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Could not load file</p>
              <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && blobUrl && (
          <>
            {/* PDF or image — browser renders natively */}
            {(ext === 'pdf' || ['png','jpg','jpeg','gif','webp'].includes(ext)) && (
              <iframe
                src={blobUrl}
                title={name || 'Document'}
                className="flex-1 w-full"
                style={{ border: 'none', minHeight: 'calc(100vh - 52px)' }}
              />
            )}

            {/* Video */}
            {['mp4','webm','mov'].includes(ext) && (
              <div className="flex-1 flex items-center justify-center bg-black">
                <video
                  src={blobUrl}
                  controls
                  controlsList="nodownload"
                  className="max-w-full max-h-screen"
                  style={{ outline: 'none' }}
                />
              </div>
            )}

            {/* Office files — can't render natively from a blob */}
            {isDoc && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className={`rounded-2xl border p-8 text-center max-w-sm ${
                  dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <FiFileText className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
                  <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{name || 'Document'}</p>
                  <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Office documents cannot be previewed inline. Ask your teacher to upload a PDF version for viewing.
                  </p>
                </div>
              </div>
            )}

            {/* Unknown extension */}
            {!ext || (!['pdf','png','jpg','jpeg','gif','webp','mp4','webm','mov'].includes(ext) && !isDoc) && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className={`rounded-2xl border p-8 text-center max-w-sm ${
                  dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <FiFileText className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                  <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>File loaded</p>
                  <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    This file type cannot be previewed in the browser.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
