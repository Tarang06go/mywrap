import api from './api';
const groupService = {
  createGroup: (data) => api.post('/groups', data),
  joinGroup: (groupCode) => api.post('/groups/join', { groupCode }),
  getGroupDetails: (id) => api.get(`/groups/${id}`),
  lockGroup: (id) => api.post(`/groups/${id}/lock`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
};
export default groupService;
