import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../../store/notifications/NotificationContext';
import { useAuth } from '../../store/auth/AuthContext';

export default function NotificationBell({ theme }) {
  const { isAuthenticated } = useAuth();
  const { unreadCount }     = useNotifications();
  const dark = theme === 'dark';

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/notifications"
      title="Notifications"
      className={`relative p-2 rounded-xl transition ${
        dark
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <FiBell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1 leading-none shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
