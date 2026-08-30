import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from '../../api/axios';

const NotificationContext = createContext(null);

// Poll interval — 5 min fallback in case the socket misses something
// (e.g. browser was backgrounded, connection briefly dropped)
const POLL_MS = 5 * 60 * 1000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const pollRef = useRef(null);

  // ── Fetch unread count only (lightweight badge refresh) ──────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!localStorage.getItem('token')) return;
      const res = await axios.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch { /* silent */ }
  }, []);

  // ── Fetch full notification list ─────────────────────────────────────────
  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      if (!localStorage.getItem('token')) return { data: [], total: 0, unreadCount: 0 };
      const res = await axios.get('/notifications', { params });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount ?? 0);
      return res.data;
    } catch {
      return { data: [], total: 0, unreadCount: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mark single as read ───────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await axios.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  // ── Delete one ────────────────────────────────────────────────────────────
  const removeNotification = useCallback(async (id) => {
    try {
      const n = notifications.find(x => x._id === id);
      await axios.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(x => x._id !== id));
      if (n && !n.isRead) setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  }, [notifications]);

  // ── Delete all ────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    try {
      await axios.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  }, []);

  // ── Add a notification locally (optimistic, called by socket handler) ─────
  const addNotification = useCallback((n) => {
    setNotifications(prev => {
      // Deduplicate — socket can occasionally fire twice
      if (prev.some(x => x._id === n._id)) return prev;
      return [n, ...prev];
    });
    setUnreadCount(c => c + 1);
  }, []);

  // ── Real-time: receive new notification via socket DOM event ─────────────
  // SocketContext dispatches 'socket:notification:new' to avoid circular imports.
  useEffect(() => {
    const onNew = (e) => {
      const notification = e.detail;
      if (!notification) return;
      addNotification(notification);

      // Optional: browser notification when tab is in background
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        try {
          new Notification(notification.title, {
            body:     notification.message,
            icon:     '/favicon.ico',
            tag:      `notif-${notification._id}`,
          });
        } catch { /* some browsers block this */ }
      }
    };

    window.addEventListener('socket:notification:new', onNew);
    return () => window.removeEventListener('socket:notification:new', onNew);
  }, [addNotification]);

  // ── Fallback poll: every 5 min, just refresh the badge count ────────────
  // This catches any notifications delivered while the socket was reconnecting.
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, POLL_MS);

    const onLogout = () => {
      clearInterval(pollRef.current);
      setUnreadCount(0);
      setNotifications([]);
    };
    const onStorage = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) onLogout();
        else fetchUnreadCount();
      }
    };

    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('storage',     onStorage);

    return () => {
      clearInterval(pollRef.current);
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('storage',     onStorage);
    };
  }, [fetchUnreadCount]);

  // Resume count fetch when tab regains focus
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && localStorage.getItem('token')) fetchUnreadCount();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifications, fetchUnreadCount,
      markRead, markAllRead,
      removeNotification, clearAll,
      addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};

export default NotificationContext;
