import axios from './axios';

export const getQuizzes     = async (params = {}) => (await axios.get('/quizzes', { params })).data;
export const getQuiz        = async (id)           => (await axios.get(`/quizzes/${id}`)).data;
export const createQuiz     = async (data)          => (await axios.post('/quizzes', data)).data;
export const updateQuiz     = async (id, data)      => (await axios.put(`/quizzes/${id}`, data)).data;
export const deleteQuiz     = async (id)            => (await axios.delete(`/quizzes/${id}`)).data;
export const submitQuiz     = async (id, data)      => (await axios.post(`/quizzes/${id}/submit`, data)).data;
export const getQuizResults = async (id)            => (await axios.get(`/quizzes/${id}/results`)).data;
