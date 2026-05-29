import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const incidentsAPI = {
  create: (data) => api.post('/incidents/create', data),
  list: (params) => api.get('/incidents/', { params }),
  get: (id) => api.get(`/incidents/${id}`),
};

export const statsAPI = {
  byCategory: () => api.get('/stats/incidents_by_category'),
  overTime: () => api.get('/stats/incidents_over_time'),
  topTags: () => api.get('/stats/top_tags'),
  severityDist: () => api.get('/stats/severity_distribution'),
};

export const orgsAPI = {
  list: () => api.get('/organizations/'),
  create: (data) => api.post('/organizations/create', data),
  join: (id) => api.post(`/organizations/join/${id}`),
  members: (orgId) => api.get(`/organizations/${orgId}/members`),
  setRole: (orgId, userId, role) => api.patch(`/organizations/${orgId}/members/${userId}/role`, { role }),
};

export const uploadsAPI = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
