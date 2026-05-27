import API from './api';

export const getDashboardMetrics = () => API.get('/dashboard/metrics');
export const getActivities = (params) => API.get('/activities', { params });