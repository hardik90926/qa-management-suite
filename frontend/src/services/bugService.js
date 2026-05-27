import API from './api';

export const getBugs = (params) => API.get('/bugs', { params });
export const getBug = (id) => API.get(`/bugs/${id}`);
export const createBug = (data) => API.post('/bugs', data);
export const updateBug = (id, data) => API.put(`/bugs/${id}`, data);
export const deleteBug = (id) => API.delete(`/bugs/${id}`);
export const assignBug = (id, assignedTo) => API.put(`/bugs/${id}/assign`, { assignedTo });