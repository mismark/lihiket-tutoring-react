/**
 * DocumentView — Document metadata modal + inline preview
 *
 * Opens as a full-screen modal overlay (z-50), showing document details.
 * "View Document" button triggers FilePreviewModal (z-100) on top.
 * Download button honors allowDownload flag.
 */

import { useState } from 'react';
import {
  FiX, FiDownload, FiExternalLink, FiLock,
  FiBook, FiUser, FiCalendar, FiTag,
  FiFileText, FiEye, FiTrendingUp,
} from 'react-icons/fi';
import FilePreviewModal from '../../components/shared/FilePreviewModal';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function fileHref(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? `${SERVER}${url}` : `${SERVER}/${url}`;
}

const CATEGORY_LABELS = {
  notes: 'Notes',
  worksheet: 'Worksheet',
  past_paper: 'Past Paper',
  syllabus: 'Syllabus',
  reference: 'Reference',
  other: 'Other',
};

const CATEGORY_COLORS = {
  notes:      { bg: 'bg-blue-100 text-blue-700',       bgDark: 'bg-blue-500/15 text-blue-400' },
  worksheet:  { bg: 'bg-purple-100 text-purple-700',   bgDark: 'bg-purple-500/15 text-purple-400' },
  past_paper: { bg: 'bg-amber-100 text-amber-700',     bgDark: 'bg-amber-500/15 text-amber-400' },
  syllabus:   { bg: 'bg-emerald-100 text-emerald-700', bgDark: 'bg-emerald-500/15 text-emerald-400' },
  reference:  { bg: 'bg-cyan-100 text-cyan-700',       bgDark: 'bg-cyan-500/15 text-cyan-400' },
  other:      { bg: 'bg-gray-100 text-gray-600',       bgDark: 'bg-slate-700 text-slate-400' },
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function DocumentView({ doc, onClose, theme }) {
  const dark = theme === 'dark';
  const [showPreview, setShowPreview] = useState(false);

  if (!doc) return null;

  const href = fileHref(doc.fileUrl);
  const catColors = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.other;

  return (
    <>
      {/* ── Main modal ──────────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className={`flex flex-col w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl overflow-hidden ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-start justify-between px-5 py-4 border-b flex-shrink-0 ${
            dark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Large icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}>
                <FiFileText className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <h2 className={`text-base font-extrabold truncate leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {doc.title}
                </h2>
                {doc.fileName && (
                  <p className={`text-xs mt-1 flex items-center gap-1.5 flex-wrap ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
                    <span className="truncate">{doc.fileName}</span>
                    {doc.fileSize && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <span className={dark ? 'text-slate-600' : 'text-gray-300'}>·</span>
                        {formatSize(doc.fileSize)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className={`p-2 rounded-lg transition flex-shrink-0 ml-3 ${
                dark ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                     : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                dark ? catColors.bgDark : catColors.bg
              }`}>
                {CATEGORY_LABELS[doc.category] || doc.category}
              </span>
              {doc.gradeLevel && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  dark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {doc.gradeLevel}
                </span>
              )}
              {!doc.isPublished && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  dark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                }`}>
                  Draft
                </span>
              )}
            </div>

            {/* Description */}
            {doc.description?.trim() && (
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                  dark ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  Description
                </p>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {doc.description}
                </p>
              </div>
            )}

            {/* File actions */}
            {href && (
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${
                  dark ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* View button */}
                  <button
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                               bg-blue-600 hover:bg-blue-700 text-white transition
                               shadow-lg shadow-blue-600/25"
                  >
                    <FiEye className="w-4 h-4" /> View Document
                  </button>

                  {/* Open in new tab */}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                      dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open</span>
                  </a>

                  {/* Download or lock badge */}
                  {doc.allowDownload ? (
                    <a
                      href={href}
                      download={doc.fileName || true}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                                 bg-emerald-600 hover:bg-emerald-700 text-white transition
                                 shadow-lg shadow-emerald-600/25"
                    >
                      <FiDownload className="w-4 h-4" /> Download
                    </a>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold ${
                      dark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <FiLock className="w-3.5 h-3.5" />
                      Download locked
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Metadata grid */}
            <div className={`grid grid-cols-2 gap-3 pt-4 border-t text-sm ${
              dark ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-600'
            }`}>
              {doc.subject && (
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <FiBook className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      dark ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                      Subject
                    </p>
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {doc.subject.name}
                    </p>
                  </div>
                </div>
              )}

              {doc.uploadedBy && (
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <FiUser className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      dark ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                      Uploaded by
                    </p>
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                    </p>
                  </div>
                </div>
              )}

              {doc.createdAt && (
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <FiCalendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      dark ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                      Created
                    </p>
                    <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {doc.viewCount !== undefined && (
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <FiTrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      dark ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                      Views
                    </p>
                    <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {doc.viewCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {doc.tags?.length > 0 && (
              <div className="pt-3">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2.5 ${
                  dark ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map(t => (
                    <span
                      key={t}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${
                        dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <FiTag className="w-3 h-3" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-5 py-4 border-t flex-shrink-0 ${
            dark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ── FilePreviewModal (overlay on top) ─────────────────── */}
      {showPreview && href && (
        <FilePreviewModal
          url={href}
          name={doc.fileName || doc.title}
          allowDownload={doc.allowDownload}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
