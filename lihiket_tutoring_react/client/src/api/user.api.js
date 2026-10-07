import axios from './axios';

// Get pending users (Admin only)
export const getPendingUsers = async (params = {}) => {
  const response = await axios.get('/users/pending', { params });
  return response.data;
};

// Get all users (Admin only)
export const getAllUsers = async (params = {}) => {
  const response = await axios.get('/users', { params });
  return response.data;
};

// Approve user (Admin only)
export const approveUser = async (userId, userType) => {
  const response = await axios.post(`/users/${userId}/approve`, { userType });
  return response.data;
};

// Reject user (Admin only)
export const rejectUser = async (userId, userType) => {
  const response = await axios.delete(`/users/${userId}/reject`, { data: { userType } });
  return response.data;
};

// Toggle user active status (Admin only)
export const toggleUserActive = async (userId, userType) => {
  const response = await axios.patch(`/users/${userId}/toggle-active`, { userType });
  return response.data;
};

// Get all teachers (Admin only)
export const getAllTeachers = async () => {
  const response = await axios.get('/users/teachers');
  return response.data;
};

// Get parent's children with enrollments (Parent only)
export const getMyChildren = async () => {
  const response = await axios.get('/users/my-children');
  return response.data;
};

// Link a student to the logged-in parent by their public student ID (e.g. LIKST10001)
export const linkChild = async (studentUserId) => {
  const response = await axios.post('/users/link-child', { studentUserId });
  return response.data;
};

// Unlink a student from the logged-in parent
export const unlinkChild = async (studentId) => {
  const response = await axios.delete(`/users/unlink-child/${studentId}`);
  return response.data;
};

// Get full academic progress for one linked child
export const getChildProgress = async (studentId) => {
  const response = await axios.get(`/users/child-progress/${studentId}`);
  return response.data;
};

// Get single user by id + userType (Admin only)
export const getUser = async (userId, userType) => {
  const response = await axios.get(`/users/${userId}`, { params: { userType } });
  return response.data;
};

// Update user (Admin only)
export const updateUser = async (userId, userType, data) => {
  const response = await axios.put(`/users/${userId}`, data, { params: { userType } });
  return response.data;
};

// Hard-delete user (Admin only)
export const deleteUser = async (userId, userType) => {
  const response = await axios.delete(`/users/${userId}`, { params: { userType } });
  return response.data;
};
