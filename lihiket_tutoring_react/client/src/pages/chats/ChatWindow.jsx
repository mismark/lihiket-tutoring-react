import { useEffect, useRef, useState, useCallback } from 'react';
import {
  FiSend, FiTrash2, FiArrowLeft, FiLoader,
  FiWifiOff, FiAlertCircle, FiRefreshCw, FiCheck,
} from 'react-icons/fi';
import { useAuth }   from '../../store/auth/AuthContext';
import { useTheme }  from '../../store/theme/ThemeContext';
import { useChat }   from '../../store/chat/ChatContext';
import { useSocket } from '../../store/socket/SocketContext';
import { getMessages, sendMessage, deleteMessage, markMessagesRead } from '../../api/chat.api';

const POLL_INTERVAL         = 30_000;
const NEAR_BOTTOM_THRESHOLD = 120;

// ── Role gradient colours ─────────────────────────────────────────────────────
const ROLE_GRAD = {
  admin:   'from-amber-500 to-orange-500',
  teacher: 'from-blue-500 to-indigo-500',
  student: 'from-emerald-500 to-teal-500',
  parent:  'from-purple-500 to-violet-500',
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, online }) {
  const grad = ROLE_GRAD[user?.role] || 'from-slate-400 to-slate-500';
  return (
    <div className="relative flex-shrink-0">
      <div className="w-8 h-8 rounded-full overflow-hidden">
        {user?.profilePicture
          ? <img src={user.profilePicture} alt={user?.firstName} className="w-full h-full object-cover" />
          : <div className={`bg-gradient-to-br ${grad} w-full h-full flex items-center justify-center text-white text-xs font-bold`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>}
      </div>
      {/* Online dot */}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500
                         border-2 border-white dark:border-slate-900" />
      )}
    </div>
  );
}

// ── Read receipt ticks ────────────────────────────────────────────────────────
// single grey ✓  = sending or delivered (not yet seen)
// double blue ✓✓ = seen by receiver
function Ticks({ seen, optimistic }) {
  if (seen) {
    return (
      <span className="inline-flex text-blue-400" title="Seen">
        <FiCheck className="w-3 h-3 -mr-1" />
        <FiCheck className="w-3 h-3" />
      </span>
    );
  }
  // Single grey tick — sending or delivered but not seen yet
  return (
    <span className="inline-flex text-slate-400" title={optimistic ? 'Sending…' : 'Delivered'}>
      <FiCheck className="w-3 h-3" />
    </span>
  );
}

// ── Time helpers ──────────────────────────────────────────────────────────────
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
function fmtDay(date) {
  const d   = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}
function groupByDay(msgs) {
  const groups = []; let curDay = null;
  msgs.forEach(m => {
    const day = new Date(m.createdAt).toDateString();
    if (day !== curDay) { groups.push({ type: 'divider', label: fmtDay(m.createdAt), key: day + m._id }); curDay = day; }
    groups.push({ type: 'message', ...m });
  });
  return groups;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatWindow({ conversation, onBack }) {
  const { user }   = useAuth();
  const { theme }  = useTheme();
  const { connected: globalConnected } = useChat();
  const { socket } = useSocket();
  const dark = theme === 'dark';

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
  const [otherOnline, setOtherOnline] = useState(false);

  const scrollRef  = useRef(null);
  const bottomRef  = useRef(null);
  const textRef    = useRef(null);
  const pollRef    = useRef(null);
  const convIdRef  = useRef(null);

  useEffect(() => { convIdRef.current = conversation?._id; }, [conversation?._id]);

  const other    = conversation?.otherUser;
  const otherId  = other?._id?.toString();
  const myId     = (user?._id || user?.id)?.toString();

  const isNearBottom = () => {
    const el = scrollRef.current;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
  };
  const scrollToBottom = (b = 'smooth') => bottomRef.current?.scrollIntoView({ behavior: b });

  // ── Load page ─────────────────────────────────────────────────────────────
  const loadPage = useCallback(async (p = 1, prepend = false) => {
    const id = convIdRef.current;
    if (!id || !localStorage.getItem('token')) return;
    try {
      const res  = await getMessages(id, p);
      const data = res.data?.data || [];
      setTotalPages(res.data?.pagination?.pages || 1);
      setLoadError('');
      if (prepend) {
        const el = scrollRef.current;
        const prev = el?.scrollHeight ?? 0;
        setMessages(m => [...data, ...m]);
        requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prev; });
      } else {
        setMessages(data);
      }
    } catch (err) {
      if (!prepend) setLoadError(err.message || 'Failed to load messages');
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  // Reset on conversation change
  useEffect(() => {
    if (!conversation?._id) return;
    setLoading(true); setMessages([]); setPage(1); setTotalPages(1);
    setLoadError(''); setSendError('');
    loadPage(1, false);
  }, [conversation?._id, loadPage]);

  useEffect(() => { if (!loading) scrollToBottom('auto'); }, [loading]);

  // ── Mark messages as read when window is open ─────────────────────────────
  useEffect(() => {
    if (!conversation?._id) return;
    markMessagesRead(conversation._id).catch(() => {});
  }, [conversation?._id, messages.length]);

  // ── Socket: join room ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit('chat:join', conversation._id);
    return () => socket.emit('chat:leave', conversation._id);
  }, [socket, conversation?._id]);

  // ── Socket: messages, read receipts, presence ────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      if (msg.conversationId?.toString() !== convIdRef.current?.toString()) return;
      setMessages(prev => {
        const hasOpt = prev.some(m => m._optimistic && m.text === msg.text &&
          Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 10_000);
        if (hasOpt) return prev.map(m => m._optimistic && m.text === msg.text ? { ...msg } : m);
        if (prev.some(m => m._id === msg._id)) return prev;
        setTimeout(() => { if (isNearBottom()) scrollToBottom(); }, 50);
        return [...prev, msg];
      });
      // Mark received messages as read immediately
      markMessagesRead(msg.conversationId).catch(() => {});
    };

    const onDeleted = ({ messageId }) =>
      setMessages(prev => prev.filter(m => m._id !== messageId));

    // Update read ticks when other user reads our messages
    const onRead = ({ conversationId, readerId }) => {
      if (conversationId !== convIdRef.current?.toString()) return;
      setMessages(prev => prev.map(m => ({
        ...m,
        readBy: m.readBy?.includes(readerId) ? m.readBy : [...(m.readBy || []), readerId],
      })));
    };

    // Presence
    const onOnline  = (uid) => { if (uid === otherId) setOtherOnline(true); };
    const onOffline = (uid) => { if (uid === otherId) setOtherOnline(false); };

    socket.on('chat:message', onMessage);
    socket.on('chat:deleted', onDeleted);
    socket.on('chat:read',    onRead);
    socket.on('presence:online',  onOnline);
    socket.on('presence:offline', onOffline);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:deleted', onDeleted);
      socket.off('chat:read',    onRead);
      socket.off('presence:online',  onOnline);
      socket.off('presence:offline', onOffline);
    };
  }, [socket, otherId]);

  // ── Poll fallback ─────────────────────────────────────────────────────────
  const pollMessages = useCallback(async () => {
    const id = convIdRef.current;
    if (!id || document.hidden || !localStorage.getItem('token')) return;
    try {
      const res   = await getMessages(id, 1);
      const fresh = res.data?.data || [];
      setPollOk(true);
      setMessages(prev => {
        const ids = new Set(prev.map(m => m._id));
        const replaced = prev.map(m => {
          if (!m._optimistic) return m;
          const match = fresh.find(s => s.text === m.text &&
            Math.abs(new Date(s.createdAt) - new Date(m.createdAt)) < 10_000);
          return match || m;
        });
        const newMsgs = fresh.filter(m => !ids.has(m._id));
        if (!newMsgs.length) return replaced;
        setTimeout(() => { if (isNearBottom()) scrollToBottom(); }, 50);
        return [...replaced, ...newMsgs];
      });
    } catch (err) {
      if (!err.message?.includes('Session expired')) setPollOk(false);
    }
  }, []);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!conversation?._id) return;
    pollRef.current = setInterval(pollMessages, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [conversation?._id, pollMessages]);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && convIdRef.current && localStorage.getItem('token')) pollMessages();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [pollMessages]);

  useEffect(() => {
    const stop = () => { clearInterval(pollRef.current); pollRef.current = null; };
    window.addEventListener('auth:logout', stop);
    return () => window.removeEventListener('auth:logout', stop);
  }, []);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    if (!localStorage.getItem('token')) { setSendError('Session expired. Please log in again.'); return; }
    const msgText = text.trim();
    const tmpId   = `tmp_${Date.now()}`;
    setMessages(prev => [...prev, {
      _id: tmpId, text: msgText, createdAt: new Date().toISOString(),
      sender: { userId: myId, ...user }, readBy: [], _optimistic: true,
    }]);
    setText(''); setSendError(''); scrollToBottom(); setSending(true);
    try {
      const res   = await sendMessage(conversation._id, msgText);
      const saved = res.data?.data;
      setMessages(prev => prev.map(m => m._id === tmpId ? { ...saved } : m));
      setPollOk(true);
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tmpId));
      setText(msgText);
      setSendError(err.message || 'Failed to send');
      if (!err.message?.includes('Session expired')) setPollOk(false);
    } finally { setSending(false); textRef.current?.focus(); }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) { setSendError(err.message || 'Could not delete message'); }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await loadPage(1, false); setPollOk(true);
    if (!pollRef.current && conversation?._id)
      pollRef.current = setInterval(pollMessages, POLL_INTERVAL);
    setRetrying(false);
  };

  const showOffline = !globalConnected || !pollOk;
  const grouped     = groupByDay(messages);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-4
          ${dark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
        <FiSend className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${dark ? 'bg-[#0d1117]' : 'bg-[#eae6df]'}`}>

      {/* ── Top bar ── */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 z-10
          ${dark ? 'bg-[#1f2937] border-slate-700/60' : 'bg-[#075e54] border-transparent'}`}>
        <button onClick={onBack} className="lg:hidden p-2 rounded-xl transition text-white/70 hover:text-white hover:bg-white/10">
          <FiArrowLeft className="w-5 h-5" />
        </button>

        <Avatar user={other} online={otherOnline} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-white">
            {other?.firstName} {other?.lastName}
          </p>
          <p className="text-xs text-white/60">
            {otherOnline ? (
              <span className="text-emerald-300 font-semibold">● Online</span>
            ) : (
              <span className="capitalize">{other?.role}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5" title={showOffline ? 'Connection lost' : 'Connected'}>
          <span className={`w-2 h-2 rounded-full ${showOffline ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
        </div>
      </div>

      {/* ── Offline banner ── */}
      {showOffline && (
        <div className={`flex items-center justify-between gap-3 px-4 py-2 text-xs font-medium flex-shrink-0
            ${dark ? 'bg-red-500/10 text-red-400 border-b border-red-500/20'
                   : 'bg-red-50 text-red-600 border-b border-red-100'}`}>
          <div className="flex items-center gap-2">
            <FiWifiOff className="w-3.5 h-3.5" />
            Connection lost — messages may not be delivered
          </div>
          <button onClick={handleRetry} disabled={retrying}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition
              ${dark ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-100 hover:bg-red-200'}`}>
            <FiRefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Load earlier */}
        {page < totalPages && (
          <div className="flex justify-center mb-3">
            <button onClick={async () => {
              setLoadingMore(true); const next = page + 1; setPage(next); await loadPage(next, true);
            }} disabled={loadingMore}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition
                ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                       : 'bg-white text-slate-600 hover:bg-gray-100 shadow-sm'}`}>
              {loadingMore ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className={`w-6 h-6 border-2 rounded-full animate-spin
              ${dark ? 'border-blue-500 border-t-transparent' : 'border-teal-600 border-t-transparent'}`} />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
            <FiAlertCircle className="w-10 h-10 text-red-400 opacity-70" />
            <p className="text-sm text-center">{loadError}</p>
            <button onClick={() => { setLoadError(''); setLoading(true); loadPage(1, false); }}
              className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
              Try again
            </button>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-2 text-slate-400">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          grouped.map(item => {
            // ── Date divider ──────────────────────────────────────────────
            if (item.type === 'divider') {
              return (
                <div key={item.key} className="flex items-center justify-center py-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm
                    ${dark ? 'bg-slate-700 text-slate-400' : 'bg-white/80 text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              );
            }

            const mine = item.sender?.userId?.toString() === myId ||
                         item.sender?._id?.toString()    === myId;

            // Did the other user read this message?
            const seen = mine && (item.readBy || []).some(id => id?.toString() === otherId);

            return (
              <div key={item._id}
                className={`flex items-end gap-1.5 group ${mine ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar — only for received messages */}
                {!mine && <Avatar user={item.sender} online={false} />}
                {/* Spacer so sent messages align without avatar */}
                {mine && <div className="w-8 flex-shrink-0" />}

                {/* Bubble */}
                <div className={`max-w-[72%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-sm relative
                    ${mine
                      ? dark
                        ? 'bg-[#005c4b] text-white rounded-br-sm'          // Telegram dark sent
                        : 'bg-[#dcf8c6] text-gray-900 rounded-br-sm'       // Telegram light sent (green)
                      : dark
                        ? 'bg-[#1f2937] text-slate-100 rounded-bl-sm'      // Telegram dark received
                        : 'bg-white text-gray-900 rounded-bl-sm'           // Telegram light received
                    } ${item._optimistic ? 'opacity-70' : ''}`}>
                    {item.isDeleted
                      ? <span className="italic opacity-50 text-xs">Message deleted</span>
                      : item.text}
                  </div>

                  {/* Time + ticks */}
                  <div className={`flex items-center gap-1 mt-0.5 px-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {fmtTime(item.createdAt)}
                    </span>
                    {mine && <Ticks seen={seen} optimistic={!!item._optimistic} />}

                    {/* Delete button on hover */}
                    {mine && !item._optimistic && (
                      <button onClick={() => handleDelete(item._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        title="Delete">
                        <FiTrash2 className={`w-3 h-3 ${dark ? 'text-slate-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`} />
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
        <div className={`flex items-center gap-2 mx-4 mb-2 px-3 py-2 rounded-xl text-xs
            ${dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1">{sendError}</span>
          <button onClick={() => setSendError('')} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Input ── */}
      <div className={`px-3 py-3 flex-shrink-0
          ${dark ? 'bg-[#1f2937]' : 'bg-[#f0f2f5]'}`}>
        <div className={`flex items-end gap-2 rounded-3xl px-4 py-2 shadow-sm
            ${dark ? 'bg-[#2a3942]' : 'bg-white'}`}>
          <textarea ref={textRef} rows={1} value={text}
            onChange={e => { setText(e.target.value); if (sendError) setSendError(''); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={sending}
            placeholder={showOffline ? 'Connection lost…' : 'Type a message…'}
            className={`flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed
                        max-h-32 py-1 disabled:opacity-50
              ${dark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          <button onClick={handleSend} disabled={!text.trim() || sending}
            className={`p-2 rounded-full flex-shrink-0 transition-all
              ${text.trim() && !sending
                ? dark ? 'bg-[#00a884] hover:bg-[#00917a] text-white'
                       : 'bg-[#00a884] hover:bg-[#00917a] text-white'
                : dark ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                       : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {sending
              ? <FiLoader className="w-4 h-4 animate-spin" />
              : <FiSend   className="w-4 h-4" />}
          </button>
        </div>
        <p className={`text-[10px] mt-1 px-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
