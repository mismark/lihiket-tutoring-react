import api from './axios';

// ── Conversations ─────────────────────────────────────────────────────────────

export const getConversations   = ()                      => api.get('/chats');
export const startConversation  = (data)                  => api.post('/chats', data);
export const deleteConversation = (conversationId)        => api.delete(`/chats/${conversationId}`);

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMessages        = (conversationId, page = 1) =>
  api.get(`/chats/${conversationId}/messages`, { params: { page } });

export const sendMessage        = (conversationId, text)  =>
  api.post(`/chats/${conversationId}/messages`, { text });

export const deleteMessage      = (messageId)             =>
  api.delete(`/chats/messages/${messageId}`);

// ── Misc ──────────────────────────────────────────────────────────────────────

export const getUnreadCount     = ()                      => api.get('/chats/unread-count');
export const getChatableUsers   = ()                      => api.get('/chats/users');
