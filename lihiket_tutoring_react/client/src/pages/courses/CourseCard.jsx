import { Link } from 'react-router-dom';
import {
  FiBookOpen, FiEdit2, FiTrash2, FiPlayCircle,
  FiFileText, FiLayers, FiUser, FiClock, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../store/auth/AuthContext';

// Deterministic gradient per course (cycles through palette)
const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];
function gradientFor(id = '') {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

function LessonTypePill({ lessons }) {
  const videos = lessons.filter(l => l.type === 'video').length;
  const docs   = lessons.filter(l => l.type === 'document').length;
  const text   = lessons.filter(l => l.type === 'text').length;
  const parts  = [];
  if (videos) parts.push({ icon: FiPlayCircle, label: videos, color: 'text-blue-500'  });
  if (docs)   parts.push({ icon: FiFileText,   label: docs,   color: 'text-amber-500' });
  if (text)   parts.push({ icon: FiLayers,     label: text,   color: 'text-purple-500'});
  if (!parts.length) return null;
  return (
    <div className="flex items-center gap-2">
      {parts.map(({ icon: Icon, label, color }, i) => (
        <span key={i} className={`flex items-center gap-1 text-xs font-medium ${color}`}>
          <Icon className="w-3 h-3" />{label}
        </span>
      ))}
    </div>
  );
}

export default function CourseCard({ course, subjectId, onEdit, onDelete, view = 'grid' }) {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const lessons      = course.lessons || [];
  const lessonCount  = lessons.length;
  const grad         = gradientFor(course._id);
  const initials     = course.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  const lessonLink   = `/subjects/${subjectId}/courses/${course.slug || course._id}/lessons`;
  const documentLink = `/subjects/${subjectId}/courses/${course.slug || course._id}/documents`;

  // ── LIST view ─────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
        course.isPublished
          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
      }`}>
        {/* Colour swatch */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {course.title}
            </h3>
            {!course.isPublished && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex-shrink-0">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <FiBookOpen className="w-3 h-3" /> {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </span>
            {course.teacher && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <FiUser className="w-3 h-3" /> {course.teacher.firstName} {course.teacher.lastName}
              </span>
            )}
            <LessonTypePill lessons={lessons} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={lessonLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition">
            <FiBookOpen className="w-3.5 h-3.5" /> Lessons
          </Link>
          <Link to={documentLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition">
            <FiFileText className="w-3.5 h-3.5" /> Docs
          </Link>
          {canManage && (
            <>
              <button onClick={() => onEdit(course)}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition">
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(course)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <FiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
        </div>
      </div>
    );
  }

  // ── GRID view (default) ───────────────────────────────────────────────────
  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      course.isPublished
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700'
    }`}>

      {/* Colour banner */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />
        {!course.isPublished && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-black/30 text-white backdrop-blur-sm">
            Draft
          </span>
        )}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {initials}
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <LessonTypePill lessons={lessons} />
          {course.teacher && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
              <FiUser className="w-3 h-3" />
              {course.teacher.firstName} {course.teacher.lastName}
            </span>
          )}
        </div>

        {/* Progress bar (lesson count visual) */}
        {lessonCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 dark:text-slate-500">Content</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{lessonCount} lessons</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                style={{ width: `${Math.min(100, (lessonCount / 10) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-0 border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">
        <Link to={lessonLink}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
          <FiBookOpen className="w-3.5 h-3.5" /> Lessons
        </Link>
        <Link to={documentLink}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
          <FiFileText className="w-3.5 h-3.5" /> Docs
        </Link>
        {canManage && (
          <>
            <button onClick={() => onEdit(course)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(course)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
