import API from './api';

export const login = (email, password) => API.post('/auth/login', { email, password });
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);