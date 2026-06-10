import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      // Using window.location.href works anywhere, even outside components
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;