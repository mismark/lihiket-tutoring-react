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

// ── WebAuthn (passkey / fingerprint login) ────────────────────────────────────
// Each "begin" call returns { options, requestId }; the client passes the
// options to @simplewebauthn/browser, then sends the authenticator response +
// requestId back to the matching "finish" call.

export const webauthnRegisterBegin = async () => {
  const res = await api.post('/auth/webauthn/register/begin');
  return res.data;
};

export const webauthnRegisterFinish = async ({ response, requestId, deviceName }) => {
  const res = await api.post('/auth/webauthn/register/finish', { response, requestId, deviceName });
  return res.data;
};

export const webauthnAuthBegin = async () => {
  const res = await api.post('/auth/webauthn/auth/begin');
  return res.data;
};

// Returns { data: { token, user } } — same shape as loginUser()
export const webauthnAuthFinish = async ({ response, requestId }) => {
  const res = await api.post('/auth/webauthn/auth/finish', { response, requestId });
  return res.data;
};

// ── Passkey management (authenticated) ────────────────────────────────────────
export const listPasskeys = async () => {
  const res = await api.get('/auth/webauthn');
  return res.data;
};

export const renamePasskey = async (id, deviceName) => {
  const res = await api.patch(`/auth/webauthn/${id}`, { deviceName });
  return res.data;
};

export const removePasskey = async (id) => {
  const res = await api.delete(`/auth/webauthn/${id}`);
  return res.data;
};
