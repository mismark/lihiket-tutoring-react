import { useEffect, useRef, useState, useCallback } from 'react';
import { FiSend, FiTrash2, FiArrowLeft, FiLoader, FiWifiOff, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth }   from '../../store/auth/AuthContext';
import { useTheme }  from '../../store/theme/ThemeContext';
import { useChat }   from '../../store/chat/ChatContext';
import { useSocket } from '../../store/socket/SocketContext';
import { getMessages, sendMessage, deleteMessage } from '../../api/chat.api';

// ── Constants ─────────────────────────────────────────────────────────────────
// Poll is a fallback only — socket handles real-time delivery.
// 30 s is enough to catch any edge cases (tab-visibility changes, etc.)
const POLL_INTERVAL         = 30_000;
const NEAR_BOTTOM_THRESHOLD = 120;

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin:   'from-amber-500 to-orange-500',
  teacher: 'from-blue-500 to-indigo-500',
  student: 'from-emerald-500 to-teal-500',
  parent:  'from-purple-500 to-violet-500',
};

function Avatar({ user }) {
  const grad = ROLE_COLORS[user?.role] || 'from-slate-400 to-slate-500';
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDay(date) {
  const d   = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDay(messages) {
  const groups   = [];
  let currentDay = null;
  messages.forEach((msg) => {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== currentDay) {
      groups.push({ type: 'divider', label: formatDay(msg.createdAt), key: day + msg._id });
      currentDay = day;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatWindow({ conversation, onBack }) {
  const { user }    = useAuth();
  const { theme }   = useTheme();
  const { connected: globalConnected } = useChat();
  const { socket }  = useSocket();
  const dark        = theme === 'dark';

  const [messages,    setMessages]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState('');
  const [sending,     setSending]     = useState(false);
  const [sendError,   setSendError]   = useState('');
  const [text,        setText]        = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pollOk,      setPollOk]      = useState(true);
  const [retrying,    setRetrying]    = useState(false);

  const scrollAreaRef = useRef(null);
  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);
  const pollTimerRef  = useRef(null);
  const convIdRef     = useRef(null);

  useEffect(() => { convIdRef.current = conversation?._id; }, [conversation?._id]);

  const other = conversation?.otherUser;

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const isNearBottom = () => {
    const el = scrollAreaRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
  };
  const scrollToBottom = (behavior = 'smooth') =>
    bottomRef.current?.scrollIntoView({ behavior });

  // ── Page loader ─────────────────────────────────────────────────────────────
  const loadPage = useCallback(async (p = 1, prepend = false) => {
    const id = convIdRef.current;
    if (!id || !localStorage.getItem('token')) return;
    try {
      const res        = await getMessages(id, p);
      const data       = res.data?.data || [];
      const pagination = res.data?.pagination || {};
      setTotalPages(pagination.pages || 1);
      setLoadError('');

      if (prepend) {
        const el = scrollAreaRef.current;
        const prev = el?.scrollHeight ?? 0;
        setMessages((m) => [...data, ...m]);
        requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prev; });
      } else {
        setMessages(data);
      }
    } catch (err) {
      if (!prepend) setLoadError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset on conversation change
  useEffect(() => {
    if (!conversation?._id) return;
    setLoading(true);
    setMessages([]);
    setPage(1);
    setTotalPages(1);
    setLoadError('');
    setSendError('');
    loadPage(1, false);
  }, [conversation?._id, loadPage]);

  // Scroll to bottom after initial load
  useEffect(() => { if (!loading) scrollToBottom('auto'); }, [loading]);

  // ── Socket: join / leave conversation room ──────────────────────────────────
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit('chat:join', conversation._id);
    return () => socket.emit('chat:leave', conversation._id);
  }, [socket, conversation?._id]);

  // ── Socket: receive new messages instantly ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      // Only handle messages for the currently open conversation
      if (msg.conversationId?.toString() !== convIdRef.current?.toString()) return;

      setMessages((prev) => {
        // Replace matching optimistic placeholder if present
        const hasOptimistic = prev.some(
          (m) => m._optimistic &&
                 m.text === msg.text &&
                 Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 10_000
        );
        if (hasOptimistic) {
          return prev.map((m) =>
            m._optimistic && m.text === msg.text ? { ...msg } : m
          );
        }
        // Skip if already in list (double-delivery guard)
        if (prev.some((m) => m._id === msg._id)) return prev;

        // Append and auto-scroll if near bottom
        setTimeout(() => { if (isNearBottom()) scrollToBottom(); }, 50);
        return [...prev, msg];
      });
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:deleted', onDeleted);
    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:deleted', onDeleted);
    };
  }, [socket]);

  // ── Fallback poll (30 s) — catches socket gaps ──────────────────────────────
  const pollMessages = useCallback(async () => {
    const id = convIdRef.current;
    if (!id || document.hidden || !localStorage.getItem('token')) return;
    try {
      const res   = await getMessages(id, 1);
      const fresh = res.data?.data || [];
      setPollOk(true);
      if (!fresh.length) return;

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        // Replace optimistic messages
        const replaced = prev.map((m) => {
          if (!m._optimistic) return m;
          const match = fresh.find(
            (s) => s.text === m.text &&
                   Math.abs(new Date(s.createdAt) - new Date(m.createdAt)) < 10_000
          );
          return match || m;
        });
        const newMsgs = fresh.filter((m) => !existingIds.has(m._id));
        if (!newMsgs.length) return replaced;
        setTimeout(() => { if (isNearBottom()) scrollToBottom(); }, 50);
        return [...replaced, ...newMsgs];
      });
    } catch (err) {
      if (!err.message?.includes('Session expired')) setPollOk(false);
    }
  }, []);

  useEffect(() => {
    clearInterval(pollTimerRef.current);
    if (!conversation?._id) return;
    pollTimerRef.current = setInterval(pollMessages, POLL_INTERVAL);
    return () => clearInterval(pollTimerRef.current);
  }, [conversation?._id, pollMessages]);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && convIdRef.current && localStorage.getItem('token')) pollMessages();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [pollMessages]);

  useEffect(() => {
    const stop = () => { clearInterval(pollTimerRef.current); pollTimerRef.current = null; };
    window.addEventListener('auth:logout', stop);
    return () => window.removeEventListener('auth:logout', stop);
  }, []);

  // ── Auto-resize textarea ────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    if (!localStorage.getItem('token')) {
      setSendError('Session expired. Please log in again.');
      return;
    }

    const msgText    = text.trim();
    const tmpId      = `tmp_${Date.now()}`;
    const optimistic = {
      _id:         tmpId,
      text:        msgText,
      createdAt:   new Date().toISOString(),
      sender:      { userId: user._id, ...user },
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText('');
    setSendError('');
    scrollToBottom();
    setSending(true);

    try {
      const res   = await sendMessage(conversation._id, msgText);
      const saved = res.data?.data;
      // Replace optimistic entry with confirmed message
      setMessages((prev) => prev.map((m) => m._id === tmpId ? { ...saved } : m));
      setPollOk(true);
      // The socket room emit from the server will deliver to the other side;
      // no need to manually poll here.
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tmpId));
      setText(msgText);
      setSendError(err.message || 'Failed to send');
      if (!err.message?.includes('Session expired')) setPollOk(false);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextChange = (e) => { setText(e.target.value); if (sendError) setSendError(''); };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      // Socket will notify the other side via chat:deleted
    } catch (err) {
      setSendError(err.message || 'Could not delete message');
    }
  };

  // ── Load earlier ────────────────────────────────────────────────────────────
  const hasMore  = page < totalPages;
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await loadPage(next, true);
  };

  // ── Manual retry ───────────────────────────────────────────────────────────
  const handleRetry = async () => {
    setRetrying(true);
    await loadPage(1, false);
    setPollOk(true);
    if (!pollTimerRef.current && conversation?._id) {
      pollTimerRef.current = setInterval(pollMessages, POLL_INTERVAL);
    }
    setRetrying(false);
  };

  const showOfflineBanner = !globalConnected || !pollOk;
  const grouped           = groupByDay(messages);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${
        dark ? 'bg-slate-950 text-slate-500' : 'bg-gray-50 text-gray-400'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          dark ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
          <FiSend className="w-8 h-8 opacity-30" />
        </div>
        <p className="text-sm font-medium">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${dark ? 'bg-slate-950' : 'bg-gray-50'}`}>

      {/* ── Top bar ── */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <button onClick={onBack} className={`lg:hidden p-2 rounded-xl transition ${
          dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
        }`}>
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <Avatar user={other} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
            {other?.firstName} {other?.lastName}
          </p>
          <p className={`text-xs capitalize ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            {other?.role}
          </p>
        </div>
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0"
          title={showOfflineBanner ? 'Connection lost' : 'Live'}>
          <span className={`w-2 h-2 rounded-full transition-colors ${
            showOfflineBanner ? 'bg-red-500' : 'bg-green-500 animate-pulse'
          }`} />
          <span className={`text-xs hidden sm:block ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            {showOfflineBanner ? 'Offline' : 'Live'}
          </span>
        </div>
      </div>

      {/* ── Offline banner ── */}
      {showOfflineBanner && (
        <div className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium flex-shrink-0 ${
          dark ? 'bg-red-500/10 text-red-400 border-b border-red-500/20'
               : 'bg-red-50 text-red-600 border-b border-red-100'
        }`}>
          <div className="flex items-center gap-2">
            <FiWifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Connection lost — messages may not be delivered</span>
          </div>
          <button onClick={handleRetry} disabled={retrying}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              dark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                   : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}>
            <FiRefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

        {hasMore && (
          <div className="flex justify-center mb-2">
            <button onClick={loadMore} disabled={loadingMore}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition ${
                dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                     : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}>
              {loadingMore ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className={`flex flex-col items-center justify-center py-20 gap-3 ${
            dark ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <FiAlertCircle className="w-10 h-10 text-red-400 opacity-70" />
            <p className="text-sm font-medium text-center">{loadError}</p>
            <button onClick={() => { setLoadError(''); setLoading(true); loadPage(1, false); }}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
              <FiRefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        ) : grouped.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 gap-2 ${
            dark ? 'text-slate-500' : 'text-gray-400'
          }`}>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          grouped.map((item) => {
            if (item.type === 'divider') {
              return (
                <div key={item.key} className="flex items-center gap-3 py-3">
                  <div className={`flex-1 h-px ${dark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                  <span className={`text-xs font-medium px-2 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  <div className={`flex-1 h-px ${dark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                </div>
              );
            }

            const mine =
              item.sender?.userId?.toString() === user?._id?.toString() ||
              item.sender?._id?.toString()    === user?._id?.toString();

            return (
              <div key={item._id} className={`flex gap-2 group ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!mine && <Avatar user={item.sender} />}
                <div className={`max-w-[70%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    mine
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : dark ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                              : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'
                  } ${item._optimistic ? 'opacity-60' : ''}`}>
                    {item.text || <span className="italic opacity-50">Message deleted</span>}
                  </div>
                  <div className={`flex items-center gap-1.5 px-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
                      {formatTime(item.createdAt)}
                    </span>
                    {item._optimistic && (
                      <FiLoader className="w-3 h-3 text-blue-400 animate-spin" />
                    )}
                    {mine && !item._optimistic && (
                      <button onClick={() => handleDelete(item._id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${
                          dark ? 'text-slate-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'
                        }`} title="Delete message">
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Send error ── */}
      {sendError && (
        <div className={`flex items-center gap-2 mx-4 mb-2 px-3 py-2 rounded-xl text-xs font-medium ${
          dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
        }`}>
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1">{sendError}</span>
          <button onClick={() => setSendError('')} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Input ── */}
      <div className={`px-4 py-3 border-t flex-shrink-0 ${
        dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-end gap-2 rounded-2xl border px-4 py-2 transition-colors ${
          dark ? 'bg-slate-800 border-slate-700 focus-within:border-blue-500'
               : 'bg-gray-50 border-gray-200 focus-within:border-blue-400'
        }`}>
          <textarea ref={textareaRef} rows={1} value={text}
            onChange={handleTextChange} onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder={
              showOfflineBanner
                ? 'Connection lost — check your network…'
                : 'Type a message… (Enter to send, Shift+Enter for newline)'
            }
            className={`flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed max-h-32 py-1 disabled:opacity-50 ${
              dark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <button onClick={handleSend} disabled={!text.trim() || sending}
            className={`p-2 rounded-xl flex-shrink-0 transition-all ${
              text.trim() && !sending
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : dark ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {sending
              ? <FiLoader className="w-4 h-4 animate-spin" />
              : <FiSend   className="w-4 h-4" />
            }
          </button>
        </div>
        <p className={`text-xs mt-1.5 px-1 ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
