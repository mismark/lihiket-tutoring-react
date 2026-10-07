import axios from './axios';

/**
 * Get the current user's certificates (student) or all certificates (admin).
 * @returns {{ success, count, total, page, pages, data: Certificate[] }}
 */
export const getMyCertificates = async (params = {}) => {
  const res = await axios.get('/certificates', { params });
  return res.data;
};

/**
 * Get a single certificate by Mongo _id.
 * @returns {{ success, data: Certificate }}
 */
export const getCertificate = async (id) => {
  const res = await axios.get(`/certificates/${id}`);
  return res.data;
};

/**
 * Public certificate verification by short certificateId (CERT-xxxx).
 * No auth required.
 * @returns {{ success, valid, data }}
 */
export const verifyCertificate = async (certId) => {
  const res = await axios.get(`/certificates/verify/${certId}`);
  return res.data;
};

/**
 * Admin: issue a certificate to a student for a subject.
 * @param {{ studentId, subjectId, grade?, completionDate? }} data
 */
export const issueCertificate = async (data) => {
  const res = await axios.post('/certificates', data);
  return res.data;
};

/**
 * Admin: revoke a certificate.
 * @param {string} id  - Mongo _id of the certificate
 * @param {string} reason
 */
export const revokeCertificate = async (id, reason = '') => {
  const res = await axios.patch(`/certificates/${id}/revoke`, { reason });
  return res.data;
};

/**
 * Returns the full download URL for a certificate PDF.
 * Used directly as an <a href> or window.open target.
 * @param {string} id  - Mongo _id
 */
export const getCertificateDownloadUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');
  return `${base}/certificates/${id}/download?token=${token}`;
};
