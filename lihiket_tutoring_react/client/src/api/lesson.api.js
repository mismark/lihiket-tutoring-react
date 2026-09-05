import api, { uploadApi } from './axios';

export const getLessonsByCourse = async (courseId) => {
  const res = await api.get(`/lessons/course/${courseId}`);
  return res.data;
};

export const getLesson = async (id) => {
  const res = await api.get(`/lessons/${id}`);
  return res.data;
};

export const createLesson = async (formData) => {
  const res = await uploadApi.post('/lessons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateLesson = async (id, formData) => {
  const res = await uploadApi.put(`/lessons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteLesson = async (id) => {
  const res = await api.delete(`/lessons/${id}`);
  return res.data;
};
