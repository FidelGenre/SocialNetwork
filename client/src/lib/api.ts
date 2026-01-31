import axios from 'axios';

const api = axios.create({
  // Ahora usa la variable de entorno. 
  // Si no encuentra la variable, usa localhost por defecto (útil para desarrollo)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  withCredentials: true // Importante si usas cookies/sesiones
});

// Interceptor opcional: si recibes un 401 (no autorizado), limpia el usuario
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
         // Opcional: localStorage.removeItem('user');
         // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;