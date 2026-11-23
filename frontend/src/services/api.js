// ============================================
// Crowd Snap AI - API Service
// ============================================
import axios from 'axios';

// In production: use full backend URL; In dev: proxy handles it
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE = (configuredApiUrl || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for large uploads
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crowdsnap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crowdsnap_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ──── Auth ────
export const adminLogin = (email, password) =>
  api.post('/admin/login', { email, password });

export const getAdminProfile = () =>
  api.get('/admin/me');

export const getDashboardStats = () =>
  api.get('/admin/dashboard');

// ──── Events ────
export const createEvent = (data) =>
  api.post('/events/', data);

export const listEvents = () =>
  api.get('/events/');

export const getEvent = (eventId) =>
  api.get(`/events/${eventId}`);

export const updateEvent = (eventId, data) =>
  api.put(`/events/${eventId}`, data);

export const deleteEvent = (eventId) =>
  api.delete(`/events/${eventId}`);

export const getEventByCode = (eventCode) =>
  api.get(`/events/code/${eventCode}`);

// ──── Photos ────
export const uploadPhotos = (eventId, files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return api.post(`/photos/upload/${eventId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 min for bulk uploads
    onUploadProgress: onProgress,
  });
};

export const listEventPhotos = (eventId, skip = 0, limit = 50) =>
  api.get(`/photos/event/${eventId}?skip=${skip}&limit=${limit}`);

export const getProcessingStatus = (eventId) =>
  api.get(`/photos/processing-status/${eventId}`);

export const retryProcessing = (eventId) =>
  api.post(`/photos/retry/${eventId}`);

export const deletePhoto = (photoId) =>
  api.delete(`/photos/${photoId}`);

// ──── Search ────
export const searchFace = (eventCode, faceImage, tolerance) => {
  const formData = new FormData();
  formData.append('face_image', faceImage);
  if (tolerance) {
    formData.append('tolerance', tolerance);
  }

  return api.post(`/search/${eventCode}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

export const searchFaceWithRegistration = (eventCode, registrationId, tolerance) => {
  const formData = new FormData();
  formData.append('registration_id', registrationId);
  if (tolerance) formData.append('tolerance', tolerance);
  return api.post(`/search/${eventCode}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

export const registerFaces = (frontFace, leftFace, rightFace, consent) => {
  const formData = new FormData();
  formData.append('front_face', frontFace, 'front-face.jpg');
  if (leftFace) formData.append('left_face', leftFace, 'left-face.jpg');
  if (rightFace) formData.append('right_face', rightFace, 'right-face.jpg');
  formData.append('consent', String(consent));
  return api.post('/registrations/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

export const deleteFaceRegistration = (registrationId, deletionToken) => {
  const formData = new FormData();
  formData.append('deletion_token', deletionToken);
  return api.delete(`/registrations/${registrationId}`, { data: formData });
};

// ──── Interactive Demo ────
export const processDemoGallery = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return api.post('/demo/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
  });
};

export const searchDemoGallery = (sessionId, selfie) => {
  const formData = new FormData();
  formData.append('face_image', selfie);
  return api.post(`/demo/search/${sessionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

export const deleteDemoSession = (sessionId) =>
  api.delete(`/demo/session/${sessionId}`);

export const getDemoAssetUrl = (path) => {
  if (!path) return '';
  if (API_BASE.startsWith('http')) {
    const apiHost = API_BASE.replace(/\/api\/?$/, '');
    return `${apiHost}${path}`;
  }
  return path;
};

// ──── Files ────
export const getPhotoUrl = (photoId) => `${API_BASE}/files/photo/${photoId}`;
export const getThumbnailUrl = (photoId) => `${API_BASE}/files/thumbnail/${photoId}`;

export const downloadPhoto = (photoId) =>
  api.get(`/files/download/${photoId}`, { responseType: 'blob' });

export const downloadZip = (photoIds) =>
  api.post('/files/download-zip', photoIds, { responseType: 'blob' });

export default api;
