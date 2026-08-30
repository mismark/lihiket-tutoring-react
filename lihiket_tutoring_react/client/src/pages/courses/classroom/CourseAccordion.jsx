import { useState } from 'react';
import {
  FiChevronDown, FiChevronRight, FiVideo, FiFileText,
  FiBookOpen, FiPlayCircle, FiLayers, FiUser, FiCheckCircle,
} from 'react-icons/fi';
import LessonPanel from './LessonPanel';

// Same gradient palette as CourseCard
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

function LessonIcon({ type, className }) {
  if (type === 'video')    return <FiPlayCircle className={className} />;
  if (type === 'document') return <FiFileText   className={className} />;
  if (type === 'mixed')    return <FiLayers     className={className} />;
  return <FiBookOpen className={className} />;
}

const TYPE_COLOR = {
  video:    'text-blue-500',
  document: 'text-amber-500',
  text:     'text-purple-500',
  mixed:    'text-emerald-500',
};

export default function CourseAccordion({ course, theme }) {
  const dark        = theme === 'dark';
  const [open, setOpen]          = useState(false);
  const [activeLesson, setActive] = useState(null);

  const lessonCount  = course.lessons?.length || 0;
  const grad         = gradientFor(course._id);
  const initials     = course.title.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

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
  const isDone   = progress === 100;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>

      {/* ── Gradient banner (like CourseCard) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left focus:outline-none"
      >
        <div className={`h-20 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4 transition`}>
          <div className="absolute inset-0 bg-black/10" />
          {/* Progress badge */}
          {lessonCount > 0 && (
            <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${
              isDone
                ? 'bg-emerald-500/80 text-white'
                : 'bg-black/25 text-white'
            }`}>
              {isDone ? '✓ Complete' : `${completed.size}/${lessonCount}`}
            </span>
          )}
          <div className="relative flex items-center gap-3">
            {/* Initials avatar */}
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30 flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-white/75 text-xs font-medium">
                {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {/* Open/close chevron */}
          <div className="absolute bottom-3 right-4">
            {open
              ? <FiChevronDown  className="w-5 h-5 text-white/70" />
              : <FiChevronRight className="w-5 h-5 text-white/70" />
            }
          </div>
        </div>

        {/* Title + meta + progress bar */}
        <div className={`px-5 pt-4 pb-3 ${!open ? 'pb-4' : ''}`}>
          <h3 className={`text-base font-bold leading-snug mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
            {course.title}
          </h3>
          {(course.description || course.teacher) && (
            <div className={`flex flex-wrap items-center gap-3 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'} mb-3`}>
              {course.description && (
                <span className="line-clamp-1">{course.description}</span>
              )}
              {course.teacher && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <FiUser className="w-3 h-3" />
                  {course.teacher.firstName} {course.teacher.lastName}
                </span>
              )}
            </div>
          )}
          {lessonCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Progress</span>
                <span className={`text-xs font-semibold ${isDone ? 'text-emerald-500' : dark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {isDone ? '✓ All done' : `${progress}%`}
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${isDone ? 'from-emerald-500 to-teal-500' : grad}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </button>

      {/* ── Expanded lesson list ── */}
      {open && (
        <div className={`border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
          {lessonCount === 0 ? (
            <div className={`px-5 py-8 text-center text-sm ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              <FiBookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No lessons in this course yet.
            </div>
          ) : (
            <div className={`divide-y ${dark ? 'divide-slate-700/60' : 'divide-gray-50'}`}>
              {course.lessons.map((lesson, idx) => {
                const isDoneLesson = completed.has(lesson._id);
                const isActive     = activeLesson?._id === lesson._id;
                const typeColor    = TYPE_COLOR[lesson.type] || 'text-purple-500';

                return (
                  <div key={lesson._id} className={`transition-colors ${
                    isActive
                      ? dark ? 'bg-blue-500/10' : 'bg-blue-50'
                      : dark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                  }`}>
                    {/* Lesson row */}
                    <div className="flex items-center gap-3 px-5 py-4">
                      {/* Complete toggle */}
                      <button
                        onClick={() => toggleComplete(lesson._id)}
                        title={isDoneLesson ? 'Mark incomplete' : 'Mark complete'}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-all ${
                          isDoneLesson
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isActive
                              ? 'bg-blue-600 text-white'
                              : dark
                                ? 'bg-slate-700 text-slate-400 hover:bg-emerald-500/25 hover:text-emerald-400'
                                : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                        }`}>
                        {isDoneLesson ? <FiCheckCircle className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
                      </button>

                      {/* Type icon */}
                      <LessonIcon type={lesson.type} className={`w-4 h-4 flex-shrink-0 ${typeColor}`} />

                      {/* Lesson info — click to expand */}
                      <button onClick={() => setActive(isActive ? null : lesson)} className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {lesson.title}
                        </p>
                        <p className={`text-xs capitalize mt-0.5 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {lesson.type}{lesson.duration ? ` · ${lesson.duration}` : ''}
                        </p>
                      </button>

                      {/* Expand chevron */}
                      <button onClick={() => setActive(isActive ? null : lesson)}
                        className="flex-shrink-0 p-1">
                        {isActive
                          ? <FiChevronDown  className="w-4 h-4 text-blue-500" />
                          : <FiChevronRight className={`w-4 h-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                        }
                      </button>
                    </div>

                    {/* Lesson content panel */}
                    {isActive && (
                      <div className={`border-t px-5 pb-6 pt-5 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
                        <LessonPanel lesson={lesson} theme={theme} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
