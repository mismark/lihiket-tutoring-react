import api from './axios';

// ── Subjects ─────────────────────────────────────────────────────────────────

/** Browse active subjects (public). Optionally filter by gradeLevel, category, search. */
export const getActiveSubjects = async (params = {}) => {
  const res = await api.get('/home-tutor/subjects', { params });
  return res.data;
};

/** Get one subject by id (public). */
export const getSubjectById = async (id) => {
  const res = await api.get(`/home-tutor/subjects/${id}`);
  return res.data;
};

/** Admin: get ALL subjects including inactive. */
export const getAllSubjectsAdmin = async (params = {}) => {
  const res = await api.get('/home-tutor/subjects/admin/all', { params });
  return res.data;
};

/** Admin: create a new subject. */
export const createSubject = async (payload) => {
  const res = await api.post('/home-tutor/subjects', payload);
  return res.data;
};

/** Admin: update a subject. */
export const updateSubject = async (id, payload) => {
  const res = await api.put(`/home-tutor/subjects/${id}`, payload);
  return res.data;
};

/** Admin: delete a subject. */
export const deleteSubject = async (id) => {
  const res = await api.delete(`/home-tutor/subjects/${id}`);
  return res.data;
};

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * Create a booking for a subject (public + optional auth).
 * @param {{ subjectId, fullName, email, phone, hoursPerWeek, preferredSchedule,
 *           startDate, address, city, location:{lat,lng}, mapLink, message }} payload
 */
export const createBooking = async (payload) => {
  const res = await api.post('/home-tutor/bookings', payload);
  return res.data;
};

/** Authenticated student: get my bookings. */
export const getMyBookings = async () => {
  const res = await api.get('/home-tutor/bookings/my');
  return res.data;
};

/** Admin: all bookings (paginated). */
export const getAllBookings = async (params = {}) => {
  const res = await api.get('/home-tutor/bookings', { params });
  return res.data;
};

/** Admin: single booking by id. */
export const getBookingById = async (id) => {
  const res = await api.get(`/home-tutor/bookings/${id}`);
  return res.data;
};

/** Admin: update booking status / teacher / notes. */
export const updateBooking = async (id, updates) => {
  const res = await api.patch(`/home-tutor/bookings/${id}`, updates);
  return res.data;
};

/** Admin: delete a booking. */
export const deleteBooking = async (id) => {
  const res = await api.delete(`/home-tutor/bookings/${id}`);
  return res.data;
};
