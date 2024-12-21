import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_backend_url,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});



export default api;