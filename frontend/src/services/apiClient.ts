import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  console.log(
    `[apiClient] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    config.params || {},
    config.data || {}
  );
  return config;
});
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[apiClient] ← ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.status,
      response.data
    );
    if (response.data && response.data.result !== undefined) {
      return response.data.result;
    }
    return response.data;
  },
  (error) => {
    console.error(
      `[apiClient] × ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.status,
      error.response?.data || error.message
    );
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
