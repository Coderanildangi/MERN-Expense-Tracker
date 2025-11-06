import axio from 'axios';

const api = axio.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;