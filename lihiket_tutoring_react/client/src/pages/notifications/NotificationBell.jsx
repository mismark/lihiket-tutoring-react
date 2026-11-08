import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../../store/notifications/NotificationContext';
import { useAuth } from '../../store/auth/AuthContext';

export default function NotificationBell({ theme }) {
  const { isAuthenticated } = useAuth();
  const { unreadCount }     = useNotifications();
  const dark = theme === 'dark';
  const hasUnread = unreadCount > 0;

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/notifications"
      title={hasUnread ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'Notifications'}
      className={`relative p-2 rounded-xl transition ${
        dark
          ? 'text-slate-300 hover:bg-white/[0.07]'
          : 'text-slate-600 hover:bg-white/[0.07]'
      }`}
    >
      {/* Bell icon — shakes when there are unread notifications */}
      <FiBell
        className={`w-5 h-5 ${hasUnread ? 'animate-[ring_1s_ease-in-out]' : ''}`}
        style={hasUnread ? { color: '#f59e0b' } : {}}
      />

      {/* Badge */}
      {hasUnread && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full
                         bg-red-500 text-white text-[10px] font-black
                         flex items-center justify-center px-1 leading-none
                         shadow-sm ring-2 ring-white dark:ring-slate-900
                         animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      <style>{`
        @keyframes ring {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(12deg); }
          30%      { transform: rotate(-10deg); }
          45%      { transform: rotate(8deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(4deg); }
        }
      `}</style>
    </Link>
  );
}
