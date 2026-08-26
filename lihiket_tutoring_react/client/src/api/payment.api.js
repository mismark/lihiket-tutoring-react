import axios from './axios';

// Initiate a Chapa payment for a paid subject
// Returns { success, checkoutUrl, txRef }
export const initiatePayment = async (subjectId) => {
  const res = await axios.post('/payments/initiate', { subjectId });
  return res.data;
};

// Verify a payment after returning from Chapa (called with tx_ref from URL)
// Returns { success, message, data: enrollment }
export const verifyPayment = async (txRef) => {
  const res = await axios.get('/payments/verify', { params: { tx_ref: txRef } });
  return res.data;
};

// Get the student's payment history
export const getMyPayments = async () => {
  const res = await axios.get('/payments/my-payments');
  return res.data;
};
