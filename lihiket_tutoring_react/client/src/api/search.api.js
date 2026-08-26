import axios from './axios';

export const globalSearch = async (q, type = '') => {
  const params = { q };
  if (type) params.type = type;
  const res = await axios.get('/search', { params });
  return res.data;
};
