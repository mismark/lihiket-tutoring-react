import {
  FiVideo, FiFileText, FiBookOpen, FiEye, FiEdit2,
  FiTrash2, FiClock, FiDownload, FiLock, FiLayers,
} from 'react-icons/fi';

// Deterministic gradient (matches CourseCard pattern)
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

const TYPE_ICON = {
  video:    FiVideo,
  document: FiFileText,
  text:     FiBookOpen,
  mixed:    FiLayers,
};
const TYPE_LABEL = {
  video: 'Video', document: 'Document', text: 'Text', mixed: 'Mixed',
};

export default function LessonCard({ lesson, index, onView, onEdit, onDelete, canManage, theme }) {
  const dark     = theme === 'dark';
  const grad     = gradientFor(lesson._id);
  const Icon     = TYPE_ICON[lesson.type] || FiBookOpen;
  const initials = lesson.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      lesson.isPublished
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
    }`}>

      {/* ── Colour banner ── */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />
        {!lesson.isPublished && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-black/30 text-white backdrop-blur-sm">
            Draft
          </span>
        )}
        {/* Number badge */}
        <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-xs font-extrabold">
          {index + 1}
        </span>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {initials}
          </div>
          <p className="text-white/75 text-xs font-medium capitalize">
            {TYPE_LABEL[lesson.type] || lesson.type}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {lesson.title}
          </h3>
          {lesson.content && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {lesson.content}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3">
            {lesson.duration && (
              <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                <FiClock className="w-3 h-3" /> {lesson.duration}
              </span>
            )}
            {(lesson.videoUrl || lesson.fileUrl) && (
              <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                {lesson.allowDownload
                  ? <><FiDownload className="w-3 h-3 text-emerald-500" /> Downloadable</>
                  : <><FiLock className="w-3 h-3 text-amber-500" /> View only</>
                }
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
            <Icon className="w-3 h-3" /> {TYPE_LABEL[lesson.type]}
          </span>
        </div>

        {/* Progress bar — position in lesson order */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">Lesson</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">#{index + 1}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
              style={{ width: `${Math.min(100, ((index + 1) / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
        <button onClick={() => onView(lesson)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                     text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        {canManage && (
          <>
            <button onClick={() => onEdit(lesson)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(lesson)}
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
