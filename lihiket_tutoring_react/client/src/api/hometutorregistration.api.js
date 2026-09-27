import api from './axios';

/** Submit a home tutor registration (public + optional auth). */
export const submitRegistration = async (payload) => {
  const res = await api.post('/home-tutor-register', payload);
  return res.data;
};

/** Student: get own registrations. */
export const getMyRegistrations = async () => {
  const res = await api.get('/home-tutor-register/my');
  return res.data;
};

/** Admin: all registrations (paginated). */
export const getAllRegistrations = async (params = {}) => {
  const res = await api.get('/home-tutor-register', { params });
  return res.data;
};

/** Admin: single registration. */
export const getRegistrationById = async (id) => {
  const res = await api.get(`/home-tutor-register/${id}`);
  return res.data;
};

/** Admin: update status / teacher / notes. */
export const updateRegistration = async (id, updates) => {
  const res = await api.patch(`/home-tutor-register/${id}`, updates);
  return res.data;
};

/** Admin: delete. */
export const deleteRegistration = async (id) => {
  const res = await api.delete(`/home-tutor-register/${id}`);
  return res.data;
};
