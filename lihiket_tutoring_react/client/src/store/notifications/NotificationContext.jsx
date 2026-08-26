import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../../api/axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // Fetch unread count — lightweight, called periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch { /* silent */ }
  }, []);

  // Fetch full list — called when notifications page opens
  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return { data: [], total: 0, unreadCount: 0 };
      const res = await axios.get('/notifications', { params });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount ?? 0);
      return res.data;
    } catch { return { data: [], total: 0, unreadCount: 0 }; }
    finally { setLoading(false); }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axios.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const removeNotification = useCallback(async (id) => {
    try {
      const n = notifications.find(x => x._id === id);
      await axios.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(x => x._id !== id));
      if (n && !n.isRead) setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      await axios.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  }, []);

  // Add a notification locally (used by other parts of app)
  const addNotification = useCallback((n) => {
    setNotifications(prev => [n, ...prev]);
    setUnreadCount(c => c + 1);
  }, []);

  // Poll unread count every 60 seconds while logged in
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
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
