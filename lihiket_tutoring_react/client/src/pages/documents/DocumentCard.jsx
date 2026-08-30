import {
  FiFileText, FiDownload, FiLock, FiEye, FiEdit2,
  FiTrash2, FiUser, FiCalendar, FiTag,
} from 'react-icons/fi';

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];
function gradientFor(id = '') {
  const sum = (id + '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

const CATEGORY = {
  notes:      'Notes',
  worksheet:  'Worksheet',
  past_paper: 'Past Paper',
  syllabus:   'Syllabus',
  reference:  'Reference',
  other:      'Other',
};

const CAT_CHIP = {
  notes:      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  worksheet:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  past_paper: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  syllabus:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  reference:  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  other:      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

function fmtSize(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export default function DocumentCard({ doc, onView, onEdit, onDelete, canManage, theme }) {
  const dark  = theme === 'dark';
  const grad  = gradientFor(doc._id);
  const ext   = doc.fileName?.split('.').pop()?.toUpperCase() || '';
  const initials = doc.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      doc.isPublished
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
    }`}>

      {/* ── Colour banner ── */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Draft badge */}
        {!doc.isPublished && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-black/30 text-white backdrop-blur-sm">
            Draft
          </span>
        )}
        {/* File ext chip */}
        {ext && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-extrabold bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {ext}
          </span>
        )}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {initials}
          </div>
          <div>
            <p className="text-white/75 text-xs font-medium">
              {CATEGORY[doc.category] || 'Document'}
            </p>
            {doc.fileSize && (
              <p className="text-white/50 text-xs">{fmtSize(doc.fileSize)}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {doc.title}
          </h3>
          {doc.description && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {doc.description}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3">
            {doc.gradeLevel && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                {doc.gradeLevel}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_CHIP[doc.category] || CAT_CHIP.other}`}>
              {CATEGORY[doc.category] || 'Other'}
            </span>
          </div>
          <span className={`flex items-center gap-1 font-medium ${
            doc.allowDownload ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {doc.allowDownload
              ? <><FiDownload className="w-3 h-3" /> Download</>
              : <><FiLock    className="w-3 h-3" /> View only</>
            }
          </span>
        </div>

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map(t => (
              <span key={t} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}>
                <FiTag className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar — uses createdAt age as proxy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {doc.uploadedBy
                ? <span className="flex items-center gap-1"><FiUser className="w-3 h-3" /> {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</span>
                : 'Document'
              }
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${grad}`}
              style={{ width: doc.allowDownload ? '100%' : '60%' }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
        <button onClick={() => onView(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                     text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
          <FiEye className="w-3.5 h-3.5" /> {doc.allowDownload ? 'View / Download' : 'View'}
        </button>
        {canManage && (
          <>
            <button onClick={() => onEdit(doc)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(doc)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
