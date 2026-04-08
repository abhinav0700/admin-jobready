/// <reference types="vite/client" />
import axios from 'axios';

// Use environment variable for API URL in production, fallback to localhost for dev
let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:54321/api';

// Ensure the URL ends with /api if it's a production URL (starts with http)
let baseURL = rawBaseURL;
if (rawBaseURL.startsWith('http') && !rawBaseURL.endsWith('/api') && !rawBaseURL.endsWith('/api/')) {
  baseURL = `${rawBaseURL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL,
});

// Only use the port-hunting logic locally (if VITE_API_URL is not set)
const isLocal = !import.meta.env.VITE_API_URL;
const possiblePorts = isLocal ? [54321, 54322, 54323, 54324, 54325, 54330, 54335, 54340] : [];

// Add health check interceptor to fallback to other ports if needed
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 503 || !error.response) {
      // Try other ports
      for (const port of possiblePorts) {
        try {
          const response = await axios.get(`http://localhost:${port}/api/health`);
          if (response.status === 200) {
            baseURL = `http://localhost:${port}/api`;
            api.defaults.baseURL = baseURL;
            // Retry the original request with the new port
            return api(error.config);
          }
        } catch (e) {
          // Continue to next port
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
