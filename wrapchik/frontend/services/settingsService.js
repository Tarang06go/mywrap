import api from './api';

const settingsService = {
  getSettings: () => api.get('/settings'),
};

export default settingsService;
