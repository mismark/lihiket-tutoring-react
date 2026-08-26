import axios from './axios';

// Get all active enrollments for the logged-in student
export const getMyEnrollments = async () => {
  const res = await axios.get('/enrollments');
  return res.data;
};

// Enroll in a FREE subject directly
export const enrollInSubject = async (subjectId) => {
  const res = await axios.post(`/enrollments/${subjectId}`);
  return res.data;
};

// Unenroll (drop) from a subject
export const unenrollFromSubject = async (subjectId) => {
  const res = await axios.delete(`/enrollments/${subjectId}`);
  return res.data;
};
