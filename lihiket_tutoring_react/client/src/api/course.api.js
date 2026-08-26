import axios from './axios';

export const getCoursesBySubject = async (subjectId) => {
  const res = await axios.get(`/courses/subject/${subjectId}`);
  return res.data;
};

export const getCourse = async (id) => {
  const res = await axios.get(`/courses/${id}`);
  return res.data;
};

export const createCourse = async (data) => {
  const res = await axios.post('/courses', data);
  return res.data;
};

export const updateCourse = async (id, data) => {
  const res = await axios.put(`/courses/${id}`, data);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await axios.delete(`/courses/${id}`);
  return res.data;
};

export const createLesson = async (formData) => {
  const res = await axios.post('/lessons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateLesson = async (id, formData) => {
  const res = await axios.put(`/lessons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteLesson = async (id) => {
  const res = await axios.delete(`/lessons/${id}`);
  return res.data;
};
