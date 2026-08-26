import axios from './axios';

export const getLiveClasses    = async (params = {}) => (await axios.get('/live-classes', { params })).data;
export const getLiveClass      = async (id)           => (await axios.get(`/live-classes/${id}`)).data;
export const createLiveClass   = async (data)          => (await axios.post('/live-classes', data)).data;
export const updateLiveClass   = async (id, data)      => (await axios.put(`/live-classes/${id}`, data)).data;
export const deleteLiveClass   = async (id)            => (await axios.delete(`/live-classes/${id}`)).data;
