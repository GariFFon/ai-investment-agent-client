import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

export const analyzeCompany = (companyName, ticker) =>
  API.post('/api/analyze', { companyName, ticker }).then((r) => r.data);

export const reanalyzeCompany = (companyName, ticker) =>
  API.post('/api/analyze', { companyName, ticker, force: true }).then((r) => r.data);

export const searchCompanies = (q) =>
  API.get(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.data);

export const getHistory = () =>
  API.get('/api/history').then((r) => r.data);

export const getCompany = (ticker) =>
  API.get(`/api/company/${ticker}`).then((r) => r.data);

export const getChart = (ticker, range = '1Y') =>
  API.get(`/api/chart/${encodeURIComponent(ticker)}?range=${range}`).then((r) => r.data);
