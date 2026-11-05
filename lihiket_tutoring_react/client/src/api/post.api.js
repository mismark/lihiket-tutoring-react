import api, { uploadApi } from './axios';

// ── Feed ──────────────────────────────────────────────────────────────────────
export const getFeed    = (params = {}) => api.get('/posts', { params }).then(r => r.data);
export const getPost    = (id)          => api.get(`/posts/${id}`).then(r => r.data);

// ── Post CRUD ─────────────────────────────────────────────────────────────────
export const createPost = (formData) =>
  uploadApi.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const updatePost = (id, formData) =>
  uploadApi.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const deletePost = (id) => api.delete(`/posts/${id}`).then(r => r.data);

// ── Reactions ─────────────────────────────────────────────────────────────────
export const toggleLike  = (id)          => api.post(`/posts/${id}/like`).then(r => r.data);
export const sharePost   = (id)          => api.post(`/posts/${id}/share`).then(r => r.data);

// ── Comments ──────────────────────────────────────────────────────────────────
export const addComment          = (id, text)       => api.post(`/posts/${id}/comments`, { text }).then(r => r.data);
export const deleteComment       = (id, cid)        => api.delete(`/posts/${id}/comments/${cid}`).then(r => r.data);
export const toggleCommentLike   = (id, cid)        => api.post(`/posts/${id}/comments/${cid}/like`).then(r => r.data);

// ── Replies ───────────────────────────────────────────────────────────────────
export const addReply          = (id, cid, text)      => api.post(`/posts/${id}/comments/${cid}/replies`, { text }).then(r => r.data);
export const deleteReply       = (id, cid, rid)       => api.delete(`/posts/${id}/comments/${cid}/replies/${rid}`).then(r => r.data);
export const toggleReplyLike   = (id, cid, rid)       => api.post(`/posts/${id}/comments/${cid}/replies/${rid}/like`).then(r => r.data);
