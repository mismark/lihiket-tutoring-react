import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useChat }  from '../../store/chat/ChatContext';
import { getConversations, startConversation } from '../../api/chat.api';
import ChatList      from './ChatList';
import ChatWindow    from './ChatWindow';
import NewChatModal  from './NewChatModal';

// default exports 
export default function ChatPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const { markConversationRead } = useChat();

  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations,    setConversations]    = useState([]);
  const [loadingList,      setLoadingList]      = useState(true);
  const [activeConv,       setActiveConv]       = useState(null);
  const [showNewModal,     setShowNewModal]     = useState(false);
  const [mobileShowWindow, setMobileShowWindow] = useState(false);

  // ── Load conversation list ─────────────────────────────────────────────────
  // Use a ref so we can call it from effects without it being a dependency
  const loadConversationsRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res  = await getConversations();
      const list = res.data?.data || [];
      setConversations(list);
      return list; // return so callers can use the fresh data
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Keep ref in sync
  useEffect(() => { loadConversationsRef.current = loadConversations; }, [loadConversations]);

  // ── Initial load + handle ?recipientId query param ─────────────────────────
  useEffect(() => {
    const recipientId    = searchParams.get('recipientId');
    const recipientModel = searchParams.get('recipientModel');

    const init = async () => {
      const list = await loadConversations();

      if (recipientId) {
        // Try to find an existing conversation with this recipient
        const existing = list.find((c) =>
          c.participants?.some((p) => p.userId?.toString() === recipientId)
        );

        if (existing) {
          setActiveConv(existing);
          setMobileShowWindow(true);
        } else if (recipientModel) {
          // Create it automatically
          try {
            const res2   = await startConversation({ recipientId, recipientModel });
            const newConv = res2.data?.data?.conversation;
            if (newConv) {
              // Add to list then open it
              setConversations((prev) => [newConv, ...prev]);
              setActiveConv(newConv);
              setMobileShowWindow(true);
            }
          } catch { /* ignore — user can start manually */ }
        }

        // Clear query params so back-navigation works cleanly
        setSearchParams({}, { replace: true });
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Select a conversation ──────────────────────────────────────────────────
  const handleSelect = (conv) => {
    setActiveConv(conv);
    setMobileShowWindow(true);
    // Immediately subtract this conversation's unread count from the global badge
    if (conv.unread > 0) markConversationRead(conv.unread);
    // Zero out locally so the badge in the list clears instantly
    setConversations((prev) =>
      prev.map((c) => c._id === conv._id ? { ...c, unread: 0 } : c)
    );
  };

  // ── Delete a conversation ──────────────────────────────────────────────────
  const handleDelete = (id) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (activeConv?._id === id) {
      setActiveConv(null);
      setMobileShowWindow(false);
    }
  };

  // ── New conversation created from modal ────────────────────────────────────
  const handleCreated = async (conv) => {
    setShowNewModal(false);
    if (!conv) return;

    // Re-fetch the list to get fully-populated conversations from the server,
    // then open the new one. Do NOT call loadConversations inside setState.
    const fresh = await loadConversationsRef.current?.();
    const found = fresh?.find((c) => c._id === conv._id) || conv;
    setActiveConv(found);
    setMobileShowWindow(true);
  };

  const handleBack = () => setMobileShowWindow(false);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex h-[calc(100vh-64px)] overflow-hidden ${dark ? 'bg-slate-950' : 'bg-gray-50'}`}>

      {/* Conversation list — always on desktop, hidden on mobile when window is open */}
      <div className={`
        w-full lg:w-80 xl:w-96 flex-shrink-0
        ${mobileShowWindow ? 'hidden lg:flex' : 'flex'}
        flex-col h-full
      `}>
        <ChatList
          conversations={conversations}
          activeId={activeConv?._id}
          onSelect={handleSelect}
          onNew={() => setShowNewModal(true)}
          onDelete={handleDelete}
          loading={loadingList}
        />
      </div>

      {/* Divider — desktop only */}
      <div className={`hidden lg:block w-px flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-gray-200'}`} />

      {/* Chat window — always on desktop, shown on mobile when a conv is selected */}
      <div className={`
        flex-1 flex flex-col h-full
        ${mobileShowWindow ? 'flex' : 'hidden lg:flex'}
      `}>
        <ChatWindow
          conversation={activeConv}
          onBack={handleBack}
        />
      </div>

      {showNewModal && (
        <NewChatModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
