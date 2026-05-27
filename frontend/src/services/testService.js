import API from './api';

// Test Suites
export const getTestSuites = () => API.get('/test-suites');
export const getTestSuite = (id) => API.get(`/test-suites/${id}`);
export const createTestSuite = (data) => API.post('/test-suites', data);
export const updateTestSuite = (id, data) => API.put(`/test-suites/${id}`, data);
export const deleteTestSuite = (id) => API.delete(`/test-suites/${id}`);

// Test Cases
export const getTestCases = (params) => API.get('/test-cases', { params });
export const getTestCase = (id) => API.get(`/test-cases/${id}`);
export const createTestCase = (data) => API.post('/test-cases', data);
export const updateTestCase = (id, data) => API.put(`/test-cases/${id}`, data);
export const executeTestCase = (id, data) => API.put(`/test-cases/${id}/execute`, data);
export const deleteTestCase = (id) => API.delete(`/test-cases/${id}`);