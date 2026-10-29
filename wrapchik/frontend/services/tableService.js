import api from './api';

const tableService = {
  getTables: () => api.get('/tables'),
  getAvailableTables: () => api.get('/tables/available'),
};

export default tableService;
