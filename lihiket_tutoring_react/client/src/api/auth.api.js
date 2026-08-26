import api from './axios';

/**
 * Register a new user.
 * Uses multipart/form-data when a CV file is included (teacher role).
 * @param {FormData|Object} data
 */
export const registerUser = async (data) => {
  const isFormData = data instanceof FormData;
  const res = await api.post('/auth/register', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const verifyOTP = async (payload) => {
  const res = await api.post('/auth/verify-otp', payload);
  return res.data;
};

export const setNewPassword = async (payload) => {
  const res = await api.post('/auth/set-new-password', payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put('/auth/change-password', data);
  return res.data;
};
