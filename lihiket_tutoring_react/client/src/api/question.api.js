import axios from './axios';

export const getQuestions = async (params = {}) => {
  const res = await axios.get('/question-bank', { params });
  return res.data;
};

export const getQuestion = async (id) => {
  const res = await axios.get(`/question-bank/${id}`);
  return res.data;
};

export const createQuestion = async (data) => {
  const res = await axios.post('/question-bank', data);
  return res.data;
};

export const updateQuestion = async (id, data) => {
  const res = await axios.put(`/question-bank/${id}`, data);
  return res.data;
};

export const deleteQuestion = async (id) => {
  const res = await axios.delete(`/question-bank/${id}`);
  return res.data;
};
