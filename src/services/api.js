import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

export const analyzeCompany = (companyName, ticker) =>
  API.post('/api/analyze', { companyName, ticker }).then((r) => r.data);

export const searchCompanies = (q) =>
  API.get(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.data);

export const getHistory = () =>
  API.get('/api/history').then((r) => r.data);

export const getCompany = (ticker) =>
  API.get(`/api/company/${ticker}`).then((r) => r.data);
