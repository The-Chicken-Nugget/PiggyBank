// src/api.js
import axios from 'axios';
export default axios.create({
  baseURL: '/api',
  withCredentials: true        // sends cookie
});
