import api from './axios';

/**
 * Get the per-grade-level pricing table (public — no auth needed).
 * @returns {{ success, data: { grade, pricePerHour, currency }[] }}
 */
export const getHomeTutoringPricing = async () => {
  const res = await api.get('/home-tutoring/pricing');
  return res.data;
};

/**
 * Submit a home tutoring booking request.
 * Works for both guests and logged-in students.
 * @param {{
 *   fullName, email, phone,
 *   gradeLevel, subjects, hoursPerWeek, preferredSchedule, startDate,
 *   address, city,
 *   location: { lat, lng },
 *   mapLink,
 *   message
 * }} payload
 * @returns {{ success, message, data: HomeTutoringRequest }}
 */
export const submitHomeTutoringRequest = async (payload) => {
  const res = await api.post('/home-tutoring/requests', payload);
  return res.data;
};

/**
 * Get the logged-in student's own home tutoring requests.
 * @returns {{ success, count, data: HomeTutoringRequest[] }}
 */
export const getMyHomeTutoringRequests = async () => {
  const res = await api.get('/home-tutoring/my-requests');
  return res.data;
};

// ── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * Get all home tutoring requests (admin only).
 * @param {{ status?, gradeLevel?, page?, limit? }} params
 * @returns {{ success, count, total, page, pages, data }}
 */
export const getAllHomeTutoringRequests = async (params = {}) => {
  const res = await api.get('/home-tutoring/requests', { params });
  return res.data;
};

/**
 * Get a single request by ID (admin only).
 * @returns {{ success, data: HomeTutoringRequest }}
 */
export const getHomeTutoringRequestById = async (id) => {
  const res = await api.get(`/home-tutoring/requests/${id}`);
  return res.data;
};

/**
 * Update a request's status, assigned teacher, or admin notes (admin only).
 * @param {string} id
 * @param {{ status?, assignedTeacherId?, adminNotes? }} updates
 * @returns {{ success, message, data: HomeTutoringRequest }}
 */
export const updateHomeTutoringRequest = async (id, updates) => {
  const res = await api.patch(`/home-tutoring/requests/${id}`, updates);
  return res.data;
};

/**
 * Delete a home tutoring request (admin only).
 * @returns {{ success, message }}
 */
export const deleteHomeTutoringRequest = async (id) => {
  const res = await api.delete(`/home-tutoring/requests/${id}`);
  return res.data;
};

/**
 * Update the pricing table (admin only).
 * @param {{ [grade: string]: number }} priceMap  e.g. { G10: 320, G11: 380 }
 * @returns {{ success, message, data }}
 */
export const updateHomeTutoringPricing = async (priceMap) => {
  const res = await api.put('/home-tutoring/pricing', priceMap);
  return res.data;
};
