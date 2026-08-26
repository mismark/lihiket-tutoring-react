import axios from './axios';

export const getDocuments = async (params = {}) => {
  const res = await axios.get('/documents', { params });
  return res.data;
};

export const getDocument = async (id) => {
  const res = await axios.get(`/documents/${id}`);
  return res.data;
};

export const createDocument = async (formData) => {
  const res = await axios.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateDocument = async (id, formData) => {
  const res = await axios.put(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await axios.delete(`/documents/${id}`);
  return res.data;
};
