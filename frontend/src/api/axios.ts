import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://localhost/github/qr-menu/backend/api',
  headers: { 'Content-Type': 'application/json' }
});
export default api;
