import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getUnreadCount } from '../../api/chat.api';

const ChatContext = createContext(null);

const POLL_MS      = 20000;
const NOTIFY_TITLE = 'Lihiket – New Message';

export const ChatProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [connected,   setConnected]   = useState(true);
  const prevUnreadRef = useRef(0);
  const notifyPermRef = useRef(null);
  const intervalRef   = useRef(null);

  // ── Browser notification permission ────────────────────────────────────────
  useEffect(() => {
    if (!('Notification' in window)) return;
    notifyPermRef.current = Notification.permission;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => { notifyPermRef.current = p; });
    }
  }, []);

  const fireBrowserNotification = useCallback((count) => {
    if (notifyPermRef.current !== 'granted') return;
    if (!document.hidden) return;
    const diff = count - prevUnreadRef.current;
    if (diff <= 0) return;
    try {
      new Notification(NOTIFY_TITLE, {
        body:     diff === 1 ? 'You have 1 new message' : `You have ${diff} new messages`,
        icon:     '/favicon.ico',
        tag:      'lihiket-chat',
        renotify: true,
      });
    } catch { /* some browsers block */ }
  }, []);

  // ── Poll tick ───────────────────────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res   = await getUnreadCount();
      const count = res.data?.data?.count ?? 0;
      if (count > prevUnreadRef.current) fireBrowserNotification(count);
      prevUnreadRef.current = count;
      setTotalUnread(count);
      setConnected(true);
    } catch (err) {
      if (!err.message?.includes('Session expired')) setConnected(false);
    }
  }, [fireBrowserNotification]);

  // ── Start / stop poll ───────────────────────────────────────────────────────
  const startPoll = useCallback(() => {
    if (intervalRef.current) return;
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, POLL_MS);
  }, [fetchUnread]);

  const stopPoll = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) startPoll();
    const onLogout  = () => { stopPoll(); setTotalUnread(0); prevUnreadRef.current = 0; };
    const onStorage = (e) => {
      if (e.key === 'token') { if (!e.newValue) onLogout(); else startPoll(); }
    };
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('storage',     onStorage);
    return () => {
      stopPoll();
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('storage',     onStorage);
    };
  }, [startPoll, stopPoll]);

  // Resume on tab focus
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && localStorage.getItem('token')) {
        fetchUnread();
        if (!intervalRef.current) startPoll();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchUnread, startPoll]);

  // ── Socket: instant unread increment ───────────────────────────────────────
  // SocketContext dispatches 'socket:chat:unread' as a DOM event to avoid
  // circular provider ordering issues.
  useEffect(() => {
    const onChatUnread = () => {
      setTotalUnread((prev) => {
        const next = prev + 1;
        prevUnreadRef.current = next;
        fireBrowserNotification(next);
        return next;
      });
    };
    window.addEventListener('socket:chat:unread', onChatUnread);
    return () => window.removeEventListener('socket:chat:unread', onChatUnread);
  }, [fireBrowserNotification]);

  // ── Public helpers ──────────────────────────────────────────────────────────
  const markConversationRead = useCallback((n = 0) => {
    setTotalUnread((prev) => {
      const next = Math.max(0, prev - n);
      prevUnreadRef.current = next;
      return next;
    });
  }, []);

  const resetUnread = useCallback(() => {
    setTotalUnread(0);
    prevUnreadRef.current = 0;
  }, []);

  return (
    <ChatContext.Provider value={{
      totalUnread, connected,
      fetchUnread, startPoll, stopPoll,
      markConversationRead, resetUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
};

export default ChatContext;
