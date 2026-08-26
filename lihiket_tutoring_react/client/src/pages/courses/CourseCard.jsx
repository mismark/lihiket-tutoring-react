import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBook, FiBookOpen, FiEye } from 'react-icons/fi';

export default function CourseCard({ course, subjectId, onEdit, onDelete, theme }) {
  const dark = theme === 'dark';
  const lessonCount = course.lessons?.length || 0;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      !course.isPublished
        ? dark ? 'bg-slate-800/60 border-slate-700 opacity-80' : 'bg-gray-50 border-gray-200'
        : dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
               : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <FiBook className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {course.title}
            </h3>
            {!course.isPublished && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>Draft</span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            {course.teacher && ` · ${course.teacher.firstName} ${course.teacher.lastName}`}
          </p>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <p className={`text-xs line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {course.description}
        </p>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 pt-2 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        <Link
          to={`/subjects/${subjectId}/courses/${course.slug || course._id}/lessons`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiBookOpen className="w-3.5 h-3.5" /> Lessons
        </Link>
        <button onClick={() => onEdit(course)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>
          <FiEdit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(course)}
          className="px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
