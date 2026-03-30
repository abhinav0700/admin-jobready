import axios from 'axios';

// Try to determine the backend port dynamically
let baseURL = 'http://localhost:54321/api';

// List of ports to try in case the backend chose a different one
const possiblePorts = [54321, 54322, 54323, 54324, 54325, 54330, 54335, 54340];

const api = axios.create({
  baseURL,
});

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
