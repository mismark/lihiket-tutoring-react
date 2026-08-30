import axios from './axios';

/**
 * Initiate a Chapa payment for a paid subject.
 * @param {string} subjectId
 * @param {string} [paymentMethod] - optional: 'telebirr' | 'cbebirr' | 'boa' |
 *   'dashen_bank' | 'awash_bank' | 'abyssinia_bank' | 'mpesa' | 'hello_cash' |
 *   'ebirr' | 'card'  (if omitted, customer chooses on Chapa checkout page)
 * @returns {{ success, checkoutUrl, txRef, supportedMethods }}
 */
export const initiatePayment = async (subjectId, paymentMethod) => {
  const body = { subjectId };
  if (paymentMethod) body.paymentMethod = paymentMethod;
  const res = await axios.post('/payments/initiate', body);
  return res.data;
};

/**
 * Verify a payment after returning from Chapa (called with tx_ref from URL).
 * @returns {{ success, message, data: enrollment, payment }}
 */
export const verifyPayment = async (txRef) => {
  const res = await axios.get('/payments/verify', { params: { tx_ref: txRef } });
  return res.data;
};

/**
 * Get the student's payment history.
 * @returns {{ success, count, data: Payment[] }}
 */
export const getMyPayments = async () => {
  const res = await axios.get('/payments/my-payments');
  return res.data;
};

/**
 * Get the list of supported payment methods from the server.
 * @returns {{ success, data: { value, label }[] }}
 */
export const getPaymentMethods = async () => {
  const res = await axios.get('/payments/methods');
  return res.data;
};
