import {
  FiVideo, FiFileText, FiBookOpen, FiEye, FiEdit2,
  FiTrash2, FiClock, FiDownload, FiLock, FiLayers,
  FiPlayCircle,
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

const TYPE_META = {
  video:    { icon: FiVideo,    label: 'Video',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  document: { icon: FiFileText, label: 'Document', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  text:     { icon: FiBookOpen, label: 'Text',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  mixed:    { icon: FiLayers,   label: 'Mixed',    color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
};

export default function LessonCard({ lesson, index, onView, onEdit, onDelete, canManage, theme }) {
  const dark  = theme === 'dark';
  const grad  = gradientFor(lesson._id);
  const meta  = TYPE_META[lesson.type] || TYPE_META.text;
  const Icon  = meta.icon;

  const isVideo    = lesson.type === 'video' || !!lesson.videoUrl;
  const hasFile    = !!lesson.fileUrl;
  const hasContent = !!lesson.content?.trim();

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
        ${lesson.isPublished
          ? dark
            ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
            : 'bg-white border-gray-200 hover:border-blue-300'
          : dark
            ? 'bg-slate-800/60 border-slate-700 opacity-75'
            : 'bg-gray-50 border-gray-200 opacity-75'
        }`}>

      {/* ── Banner ── */}
      <div className={`relative h-28 bg-gradient-to-br ${grad} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/15" />

        {/* Draft badge */}
        {!lesson.isPublished && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold
                           bg-black/40 text-white backdrop-blur-sm">
            Draft
          </span>
        )}

        {/* Lesson number */}
        <span className="absolute top-2.5 left-3 w-7 h-7 rounded-full
                         bg-white/25 backdrop-blur-sm border border-white/30
                         flex items-center justify-center text-white text-xs font-extrabold">
          {index + 1}
        </span>

        {/* Video play icon overlay */}
        {isVideo && (
          <button
            onClick={() => onView(lesson)}
            className="absolute inset-0 flex items-center justify-center group/play">
            <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm border border-white/40
                            flex items-center justify-center text-white
                            group-hover/play:scale-110 transition-transform duration-200">
              <FiPlayCircle className="w-7 h-7" />
            </div>
          </button>
        )}

        {/* Type label bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white/80 text-xs font-semibold capitalize">{meta.label}</span>
        </div>

        {/* Duration badge */}
        {lesson.duration && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1
                          px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs">
            <FiClock className="w-3 h-3" />
            {lesson.duration}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title + excerpt */}
        <div>
          <h3 className={`text-sm font-bold leading-snug line-clamp-2 mb-1
            ${dark ? 'text-white' : 'text-gray-900'}`}>
            {lesson.title}
          </h3>
          {hasContent && (
            <p className={`text-xs leading-relaxed line-clamp-2
              ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {lesson.content}
            </p>
          )}
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: meta.bg, color: meta.color }}>
            <Icon className="w-3 h-3" /> {meta.label}
          </span>

          {/* Download / view-only */}
          {hasFile && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
              ${lesson.allowDownload
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                : dark
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-gray-100 text-gray-400'
              }`}>
              {lesson.allowDownload
                ? <><FiDownload className="w-3 h-3" /> Download</>
                : <><FiLock className="w-3 h-3" /> View only</>}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className={`flex items-center border-t divide-x
          ${dark
            ? 'border-slate-700 divide-slate-700'
            : 'border-gray-100 divide-gray-100'}`}>

        <button
          onClick={() => onView(lesson)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors
            ${dark
              ? 'text-blue-400 hover:bg-blue-500/10'
              : 'text-blue-600 hover:bg-blue-50'}`}>
          <FiEye className="w-3.5 h-3.5" />
          {isVideo ? 'Watch' : 'View'}
        </button>

        {canManage && (
          <>
            <button
              onClick={() => onEdit(lesson)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors
                ${dark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-600 hover:bg-gray-50'}`}>
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(lesson)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors
                ${dark
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-500 hover:bg-red-50'}`}>
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
