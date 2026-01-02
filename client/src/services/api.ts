import axios from 'axios';

const api = axios.create({
  // Cambiamos localhost por tu URL de Render
  baseURL: 'https://socialnetworkserver-3kyu.onrender.com/api',
});

export default api;