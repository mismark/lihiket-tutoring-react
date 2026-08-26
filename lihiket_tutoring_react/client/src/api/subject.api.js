import axios from './axios';

// Get all subjects
export const getAllSubjects = async (params = {}) => {
  const response = await axios.get('/subjects', { params });
  return response.data;
};

// Get single subject
export const getSubject = async (id) => {
  const response = await axios.get(`/subjects/${id}`);
  return response.data;
};

// Alias for getSubject
export const getSubjectById = getSubject;

// Create new subject (Admin only)
export const createSubject = async (subjectData) => {
  const response = await axios.post('/subjects', subjectData);
  return response.data;
};

// Update subject (Admin only)
export const updateSubject = async (id, subjectData) => {
  const response = await axios.put(`/subjects/${id}`, subjectData);
  return response.data;
};

// Delete subject (Admin only)
export const deleteSubject = async (id) => {
  const response = await axios.delete(`/subjects/${id}`);
  return response.data;
};

// Assign subject to teacher (Admin only)
export const assignSubjectToTeacher = async (subjectId, teacherId) => {
  const response = await axios.post(`/subjects/${subjectId}/assign`, { teacherId });
  return response.data;
};

// Remove subject from teacher (Admin only)
export const removeSubjectFromTeacher = async (subjectId, teacherId) => {
  const response = await axios.delete(`/subjects/${subjectId}/assign/${teacherId}`);
  return response.data;
};

// Get teachers assigned to a subject (Admin only)
export const getSubjectTeachers = async (subjectId) => {
  const response = await axios.get(`/subjects/${subjectId}/teachers`);
  return response.data;
};
