import api from './axiosConfig';

export const signin = (username, password) =>
  api.post('/auth/signin', { username, password });

export const signup = (username, email, password) =>
  api.post('/auth/signup', { username, email, password });

export const signout = () =>
  api.post('/auth/signout');

export const getCurrentUser = () =>
  api.get('/auth/user');

export const getCurrentUsername = () =>
  api.get('/auth/username');

export const getAllSellers = (pageNumber = 0, pageSize = 50, sortBy = 'userId', sortOrder = 'asc') =>
  api.get('/auth/sellers', {
    params: { pageNumber, pageSize, sortBy, sortOrder }
  });

export const addSeller = (username, email, password) =>
  api.post('/auth/signup', { username, email, password, role: ['ROLE_SELLER'] });
