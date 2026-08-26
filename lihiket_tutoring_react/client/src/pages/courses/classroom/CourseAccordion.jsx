import { useState } from 'react';
import { FiBook, FiChevronDown, FiChevronRight, FiVideo, FiFileText, FiBookOpen, FiPlayCircle } from 'react-icons/fi';
import LessonPanel from './LessonPanel';

function LessonIcon({ type, className }) {
  if (type === 'video')    return <FiPlayCircle className={className} />;
  if (type === 'document') return <FiFileText   className={className} />;
  return <FiBookOpen className={className} />;
}

export default function CourseAccordion({ course, theme }) {
  const dark        = theme === 'dark';
  const [open, setOpen]           = useState(false);
  const [activeLesson, setActive] = useState(null);
  const lessonCount = course.lessons?.length || 0;

  const completedKey = `course_completed_${course._id}`;
  const [completed, setCompleted] = useState(
    () => new Set(JSON.parse(localStorage.getItem(completedKey) || '[]'))
  );

  const toggleComplete = (lessonId) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      localStorage.setItem(completedKey, JSON.stringify([...next]));
      return next;
    });
  };

  const progress = lessonCount > 0 ? Math.round((completed.size / lessonCount) * 100) : 0;

  return (
    <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

      {/* Course header */}
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition ${dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
          <FiBook className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
              {course.teacher && ` · ${course.teacher.firstName} ${course.teacher.lastName}`}
            </span>
            {lessonCount > 0 && (
              <span className={`text-xs font-semibold ${progress === 100 ? 'text-emerald-500' : dark ? 'text-blue-400' : 'text-blue-600'}`}>
                {progress === 100 ? '✓ Complete' : `${completed.size}/${lessonCount} done`}
              </span>
            )}
          </div>
          {lessonCount > 0 && (
            <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        {open ? <FiChevronDown className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
               : <FiChevronRight className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />}
      </button>

      {open && course.description && (
        <p className={`px-5 pb-3 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{course.description}</p>
      )}

      {open && (
        <div className={`border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
          {lessonCount === 0 ? (
            <p className={`px-5 py-4 text-sm ${dark ? 'text-slate-500' : 'text-gray-400'}`}>No lessons yet.</p>
          ) : (
            <div>
              <div className={`divide-y ${dark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                {course.lessons.map((lesson, idx) => {
                  const isDone   = completed.has(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;
                  const typeColor = lesson.type === 'video' ? 'text-blue-500' : lesson.type === 'document' ? 'text-amber-500' : 'text-purple-500';

                  return (
                    <div key={lesson._id} className={`transition ${isActive ? dark ? 'bg-blue-500/10' : 'bg-blue-50' : dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3 px-5 py-3.5">
                        <button onClick={() => toggleComplete(lesson._id)} title={isDone ? 'Mark incomplete' : 'Mark complete'}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                            isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-600 text-white'
                                   : dark ? 'bg-slate-700 text-slate-400 hover:bg-emerald-500/30 hover:text-emerald-400'
                                          : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                          }`}>
                          {isDone ? '✓' : idx + 1}
                        </button>
                        <LessonIcon type={lesson.type} className={`w-4 h-4 flex-shrink-0 ${typeColor}`} />
                        <button onClick={() => setActive(isActive ? null : lesson)} className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</p>
                          <p className={`text-xs capitalize ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                            {lesson.type}{lesson.duration ? ` · ${lesson.duration}` : ''}
                          </p>
                        </button>
                        <button onClick={() => setActive(isActive ? null : lesson)} className={`flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {isActive ? <FiChevronDown className="w-4 h-4 text-blue-500" /> : <FiChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                      {isActive && (
                        <div className={`px-5 pb-5 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
                          <LessonPanel lesson={lesson} theme={theme} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
