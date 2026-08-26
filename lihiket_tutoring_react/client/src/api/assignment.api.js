import axios from './axios';

export const getAssignments    = async (params = {}) => (await axios.get('/assignments', { params })).data;
export const getAssignment     = async (id)           => (await axios.get(`/assignments/${id}`)).data;
export const createAssignment  = async (fd)            => (await axios.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
export const updateAssignment  = async (id, fd)        => (await axios.put(`/assignments/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
export const deleteAssignment  = async (id)            => (await axios.delete(`/assignments/${id}`)).data;
export const submitAssignment  = async (id, fd)        => (await axios.post(`/assignments/${id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
export const getSubmissions    = async (id)            => (await axios.get(`/assignments/${id}/submissions`)).data;
export const gradeSubmission   = async (id, studentId, data) => (await axios.put(`/assignments/${id}/submissions/${studentId}/grade`, data)).data;
