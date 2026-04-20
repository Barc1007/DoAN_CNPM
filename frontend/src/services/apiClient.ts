import axios from "axios";

/**
 * Global toggle for Mock Data
 * Set to true to use static data from src/data/
 * Set to false to call real API
 */
export const IS_MOCK = true;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
