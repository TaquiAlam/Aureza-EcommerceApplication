import api from './axiosConfig';

export const signin = (username, password) =>
  api.post('/auth/signin', { username, password });

export const signup = (username, email, password, role = ['user']) =>
  api.post('/auth/signup', { username, email, password, role: Array.isArray(role) ? role : [role] });

export const signout = () =>
  api.post('/auth/signout');

export const getCurrentUser = () =>
  api.get('/auth/user');

export const getCurrentUsername = () =>
  api.get('/auth/username');

export const getAllSellers = async (pageNumber = 0, pageSize = 50, sortBy = 'userid', sortOrder = 'asc') => {
  try {
    return await api.get('/auth/admin/sellers', {
      params: { pageNumber, pageSize, sortBy, sortOrder }
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return await api.get('/auth/sellers', {
        params: { pageNumber, pageSize, sortBy, sortOrder }
      });
    }
    throw err;
  }
};

export const addSeller = (username, email, password) =>
  api.post('/auth/signup', { username, email, password, role: ['seller'] });
