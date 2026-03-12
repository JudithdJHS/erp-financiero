import axios from 'axios';

const api = axios.create({
  // Esta es la dirección de tu servidor en Render que creamos
  baseURL: 'https://erp-financiero-vpml.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('erp_token');
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);

export default api;
