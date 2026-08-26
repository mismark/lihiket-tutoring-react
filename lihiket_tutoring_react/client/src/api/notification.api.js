import axios from './axios';

export const getNotifications  = async (params = {}) => (await axios.get('/notifications', { params })).data;
export const getUnreadCount    = async ()              => (await axios.get('/notifications/unread-count')).data;
export const markRead          = async (id)            => (await axios.patch(`/notifications/${id}/read`)).data;
export const markAllRead       = async ()              => (await axios.patch('/notifications/read-all')).data;
export const deleteNotification= async (id)            => (await axios.delete(`/notifications/${id}`)).data;
export const clearAll          = async ()              => (await axios.delete('/notifications/clear-all')).data;
