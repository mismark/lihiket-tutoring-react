import {
  FiFileText, FiDownload, FiLock, FiEye, FiEdit2,
  FiTrash2, FiBook, FiTag, FiUser, FiCalendar,
} from 'react-icons/fi';

const CATEGORY_COLORS = {
  notes:      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  worksheet:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  past_paper: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  syllabus:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  reference:  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  other:      'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
};

const CATEGORY_LABELS = {
  notes: 'Notes', worksheet: 'Worksheet', past_paper: 'Past Paper',
  syllabus: 'Syllabus', reference: 'Reference', other: 'Other',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentCard({ doc, onView, onEdit, onDelete, canManage, theme }) {
  const dark = theme === 'dark';

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      !doc.isPublished
        ? dark ? 'bg-slate-800/60 border-slate-700 opacity-75' : 'bg-gray-50 border-gray-200'
        : dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
               : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Icon + title */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <FiFileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {doc.title}
          </h3>
          {doc.fileName && (
            <p className={`text-xs mt-0.5 truncate ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {doc.fileName} {doc.fileSize ? `· ${formatSize(doc.fileSize)}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {doc.description && (
        <p className={`text-xs line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {doc.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.other}`}>
          {CATEGORY_LABELS[doc.category] || doc.category}
        </span>
        {doc.gradeLevel && (
          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {doc.gradeLevel}
          </span>
        )}
        {!doc.isPublished && (
          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
            Draft
          </span>
        )}
        <span className={`flex items-center gap-1 ml-auto text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
          {doc.allowDownload
            ? <><FiDownload className="w-3 h-3 text-emerald-500" /> Downloadable</>
            : <><FiLock className="w-3 h-3 text-amber-500" /> View only</>
          }
        </span>
      </div>

      {/* Meta */}
      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
        {doc.subject && (
          <span className="flex items-center gap-1">
            <FiBook className="w-3 h-3" /> {doc.subject.name}
          </span>
        )}
        {doc.uploadedBy && (
          <span className="flex items-center gap-1">
            <FiUser className="w-3 h-3" /> {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FiCalendar className="w-3 h-3" /> {new Date(doc.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Tags */}
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.slice(0, 4).map(t => (
            <span key={t} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
            }`}>
              <FiTag className="w-2.5 h-2.5" /> {t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 pt-2 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        <button onClick={() => onView(doc)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        {canManage && (
          <>
            <button onClick={() => onEdit(doc)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(doc)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
