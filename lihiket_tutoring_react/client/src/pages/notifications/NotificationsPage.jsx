import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useNotifications } from '../../store/notifications/NotificationContext';
import { FiBell, FiCheckCircle, FiTrash2, FiRefreshCw,
         FiFilter, FiX, FiInbox } from 'react-icons/fi';
import NotificationItem from './NotificationItem';

const FILTERS = [
  { key: 'all',    label: 'All'     },
  { key: 'unread', label: 'Unread'  },
  { key: 'read',   label: 'Read'    },
];

export default function NotificationsPage() {
  const { theme }  = useTheme();
  const dark       = theme === 'dark';
  const {
    notifications, unreadCount, loading,
    fetchNotifications, markAllRead, clearAll,
  } = useNotifications();

  const [filter,    setFilter]    = useState('all');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [refreshing,setRefreshing]= useState(false);
  const LIMIT = 20;

  const load = useCallback(async (p = 1, f = filter) => {
    const params = { page: p, limit: LIMIT };
    if (f === 'unread') params.unreadOnly = true;
    const res = await fetchNotifications(params);
    setTotal(res.total || 0);
    setPage(p);
  }, [filter, fetchNotifications]);

  useEffect(() => { load(1, filter); }, [filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(1, filter);
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    load(1, filter);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    await clearAll();
    setTotal(0);
  };

  const displayed = filter === 'read'
    ? notifications.filter(n => n.isRead)
    : filter === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
              ðŸ”” Notifications
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {unreadCount > 0
                ? <span className="font-semibold text-blue-500">{unreadCount} unread</span>
                : 'All caught up'
              }
              {total > 0 && ` Â· ${total} total`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              title="Refresh"
              className={`p-2 rounded-xl border transition ${dark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${dark ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50'}`}
              >
                <FiCheckCircle className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {total > 0 && (
              <button
                onClick={handleClearAll}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${dark ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-red-500/10' : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'}`}
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                filter === f.key
                  ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <FiInbox className={`w-12 h-12 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className={`divide-y ${dark ? 'divide-slate-700' : 'divide-gray-100'}`}>
              {displayed.map(n => (
                <NotificationItem key={n._id} notification={n} theme={theme} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${dark ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              â† Prev
            </button>
            <span className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages || loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${dark ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              Next â†’
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

