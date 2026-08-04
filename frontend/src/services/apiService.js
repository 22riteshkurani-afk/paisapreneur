import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatApi = {
  sendMessage: (message, history = []) =>
    api.post("/api/chat", { message, history }),
};

export const resumeApi = {
  generate: (payload) => api.post("/api/resume/generate", payload),
  save: (payload) => api.post("/api/resume/save", payload),
  exportPdf: (id) => api.get(`/api/resume/${id}/export/pdf`),
  exportDocx: (id) => api.get(`/api/resume/${id}/export/docx`),
};

export const interviewApi = {
  generateQuestions: (payload) => api.post("/api/interview/questions", payload),
  evaluateAnswer: (payload) => api.post("/api/interview/evaluate", payload),
  history: () => api.get("/api/interview/history"),
};

export const jobsApi = {
  search: (params) => api.get("/api/jobs/search", { params }),
  save: (payload) => api.post("/api/jobs/save", payload),
  applications: () => api.get("/api/jobs/applications"),
};

export const passportApi = {
  saveProfile: (payload) => api.post("/api/passport/profile", payload),
  saveAchievement: (payload) => api.post("/api/passport/achievement", payload),
  getProfile: () => api.get("/api/passport/profile"),
};

export const businessApi = {
  generatePlan: (payload) => api.post("/api/business/plan", payload),
  generateMarketing: (payload) => api.post("/api/business/marketing", payload),
  generateRevenue: (payload) => api.post("/api/business/revenue", payload),
};

export const authApi = {
  googleLogin: (token) => api.post("/api/auth/google", { token }),
  login: (payload) => api.post("/api/auth/login", payload),
  register: (payload) => api.post("/api/auth/register", payload),
  me: () => api.get("/api/auth/me"),
  refresh: () => api.post("/api/auth/refresh"),
  logout: () => api.post("/api/auth/logout"),
};

export default api;
