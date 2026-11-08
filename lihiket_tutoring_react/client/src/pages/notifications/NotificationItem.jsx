import { useNavigate } from 'react-router-dom';
import {
  FiBell, FiCheck, FiTrash2, FiUsers, FiBook, FiAward,
  FiFileText, FiVideo, FiZap, FiCreditCard, FiCheckCircle,
  FiAlertCircle, FiBookOpen, FiUserCheck, FiUserX, FiStar,
} from 'react-icons/fi';
import { useNotifications } from '../../store/notifications/NotificationContext';

// ── Map server event type strings → icon + colour ─────────────────────────────
const TYPE_META = {
  // Auth / account
  new_registration:        { icon: FiUsers,       color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  account_approved:        { icon: FiUserCheck,    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  account_rejected:        { icon: FiUserX,        color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  // Subjects
  subject_assigned:        { icon: FiBook,         color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  subject_removed:         { icon: FiBook,         color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  subject_deleted:         { icon: FiBook,         color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  // Enrollment
  enrolled_in_course:      { icon: FiCheckCircle,  color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  student_enrolled:        { icon: FiUsers,        color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  student_dropped:         { icon: FiUsers,        color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  // Lessons / documents / courses
  new_lesson:              { icon: FiBookOpen,     color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  lesson_updated:          { icon: FiBookOpen,     color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  lesson_deleted:          { icon: FiBookOpen,     color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  new_document:            { icon: FiFileText,     color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  new_course:              { icon: FiBook,         color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  course_updated:          { icon: FiBook,         color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  course_deleted:          { icon: FiBook,         color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  // Assignments
  new_assignment:          { icon: FiFileText,     color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  assignment_submitted:    { icon: FiFileText,     color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  assignment_graded:       { icon: FiAward,        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  assignment_rejected:     { icon: FiAlertCircle,  color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  assignment_due_soon:     { icon: FiFileText,     color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  // Quizzes
  new_quiz:                { icon: FiZap,          color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
  quiz_published:          { icon: FiZap,          color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
  quiz_submitted:          { icon: FiZap,          color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  quiz_result:             { icon: FiStar,         color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  // Exams
  new_exam:                { icon: FiAward,        color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  exam_published:          { icon: FiAward,        color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  exam_submitted:          { icon: FiAward,        color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  exam_result:             { icon: FiStar,         color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  exam_starting_soon:      { icon: FiAward,        color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  // Live classes
  live_class_scheduled:    { icon: FiVideo,        color: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' },
  // Payments / certs
  certificate_issued:      { icon: FiAward,        color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  payment_success:         { icon: FiCreditCard,   color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  payment_failed:          { icon: FiAlertCircle,  color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
  // Posts / social feed
  post:                    { icon: FiBell,         color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
};

const DEFAULT_META = { icon: FiBell, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' };

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return 'Just now';
}

export default function NotificationItem({ notification: n, theme }) {
  const dark     = theme === 'dark';
  const navigate = useNavigate();
  const { markRead, removeNotification } = useNotifications();

  // Match lowercase server type OR uppercase legacy type
  const meta  = TYPE_META[n.type?.toLowerCase()] || TYPE_META[n.type] || DEFAULT_META;
  const Icon  = meta.icon;
  const color = meta.color;

  const handleClick = async () => {
    if (!n.isRead) await markRead(n._id);
    if (n.link)    navigate(n.link);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await removeNotification(n._id);
  };

  const handleMarkRead = async (e) => {
    e.stopPropagation();
    if (!n.isRead) await markRead(n._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-start gap-3 px-4 py-4 cursor-pointer transition-all ${
        n.isRead
          ? dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
          : dark
            ? 'bg-blue-500/5 hover:bg-blue-500/10 border-l-2 border-blue-500'
            : 'bg-blue-50/60 hover:bg-blue-50 border-l-2 border-blue-500'
      }`}
    >
      {/* Icon badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${
            n.isRead
              ? dark ? 'text-slate-300' : 'text-gray-700'
              : dark ? 'text-white'     : 'text-gray-900'
          }`}>
            {n.title}
          </p>
          {!n.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className={`text-xs mt-0.5 leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {n.message}
        </p>
        <p className={`text-xs mt-1 font-medium ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {/* Actions on hover */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.isRead && (
          <button onClick={handleMarkRead} title="Mark as read"
            className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' : 'hover:bg-gray-200 text-gray-400 hover:text-emerald-600'}`}>
            <FiCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={handleDelete} title="Delete"
          className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
