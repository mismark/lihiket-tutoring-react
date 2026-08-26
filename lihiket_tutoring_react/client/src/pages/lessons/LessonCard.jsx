import {
  FiVideo, FiFileText, FiBookOpen, FiEye, FiEdit2,
  FiTrash2, FiClock, FiDownload, FiLock, FiBook,
} from 'react-icons/fi';

const TYPE_CONFIG = {
  video:    { icon: FiVideo,    color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-500/20'    },
  document: { icon: FiFileText, color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-500/20'  },
  text:     { icon: FiBookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  mixed:    { icon: FiBook,     color: 'text-emerald-500',bg: 'bg-emerald-100 dark:bg-emerald-500/20'},
};

export default function LessonCard({ lesson, index, onView, onEdit, onDelete, theme }) {
  const dark   = theme === 'dark';
  const tc     = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;
  const Icon   = tc.icon;
  const hasFile = lesson.videoUrl || lesson.fileUrl;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      !lesson.isPublished
        ? dark ? 'bg-slate-800/60 border-slate-700 opacity-75' : 'bg-gray-50 border-gray-200 opacity-80'
        : dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
          <Icon className={`w-5 h-5 ${tc.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
            }`}>{index + 1}</span>
            <h3 className={`text-sm font-bold truncate flex-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {lesson.title}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
              dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {lesson.type.replace('_', ' ')}
            </span>
            {lesson.duration && (
              <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                <FiClock className="w-3 h-3" /> {lesson.duration}
              </span>
            )}
            {!lesson.isPublished && (
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>Draft</span>
            )}
            {hasFile && (
              <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-400'}`}>
                {lesson.allowDownload
                  ? <><FiDownload className="w-3 h-3 text-emerald-500" /> Downloadable</>
                  : <><FiLock className="w-3 h-3 text-amber-500" /> View only</>
                }
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content preview */}
      {lesson.content && (
        <p className={`text-xs line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {lesson.content}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
        <button onClick={() => onView(lesson)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <FiEye className="w-3.5 h-3.5" /> View
        </button>
        <button onClick={() => onEdit(lesson)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>
          <FiEdit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(lesson)}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
