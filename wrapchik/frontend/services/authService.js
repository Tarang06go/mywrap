import api from './api';

const authService = {
  register: (name, email, phone, password) => api.post('/auth/register', { name, email, phone, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  requestOtp: (phone) => api.post('/auth/otp/request', { phone }),
  verifyOtp: (phone, challengeId, otp) => api.post('/auth/otp/verify', { phone, challengeId, otp }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export default authService;
