import axios from './axios';

export const getExams         = async (params = {}) => (await axios.get('/exams', { params })).data;
export const getExam          = async (id)           => (await axios.get(`/exams/${id}`)).data;
export const createExam       = async (data)          => (await axios.post('/exams', data)).data;
export const updateExam       = async (id, data)      => (await axios.put(`/exams/${id}`, data)).data;
export const deleteExam       = async (id)            => (await axios.delete(`/exams/${id}`)).data;
export const submitExam       = async (id, data)      => (await axios.post(`/exams/${id}/submit`, data)).data;
export const getExamResults   = async (id)            => (await axios.get(`/exams/${id}/results`)).data;
export const getMyExamResults = async (id)            => (await axios.get(`/exams/${id}/my-results`)).data;
