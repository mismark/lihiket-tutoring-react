import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiUsers, FiBook,
         FiAward, FiFileText, FiVideo, FiZap } from 'react-icons/fi';
import { useNotifications } from '../../store/notifications/NotificationContext';

const TYPE_ICON = {
  NEW_REGISTRATION:   FiUsers,
  SUBJECT_ASSIGNED:   FiBook,
  GRADE_POSTED:       FiAward,
  ASSIGNMENT_POSTED:  FiFileText,
  EXAM_SCHEDULED:     FiAward,
  QUIZ_POSTED:        FiZap,
  LIVE_CLASS:         FiVideo,
};

const TYPE_COLOR = {
  NEW_REGISTRATION:   'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  SUBJECT_ASSIGNED:   'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  GRADE_POSTED:       'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  ASSIGNMENT_POSTED:  'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  EXAM_SCHEDULED:     'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  QUIZ_POSTED:        'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  LIVE_CLASS:         'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
};

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
  const dark      = theme === 'dark';
  const navigate  = useNavigate();
  const { markRead, removeNotification } = useNotifications();

  const Icon  = TYPE_ICON[n.type] || FiBell;
  const color = TYPE_COLOR[n.type] || 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';

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
          ? dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
          : dark ? 'bg-blue-500/5 hover:bg-blue-500/10 border-l-2 border-blue-500'
                 : 'bg-blue-50/60 hover:bg-blue-50 border-l-2 border-blue-500'
      }`}
    >
      {/* Icon */}
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
        <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.isRead && (
          <button
            onClick={handleMarkRead}
            title="Mark as read"
            className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' : 'hover:bg-gray-200 text-gray-400 hover:text-emerald-600'}`}
          >
            <FiCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete"
          className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
