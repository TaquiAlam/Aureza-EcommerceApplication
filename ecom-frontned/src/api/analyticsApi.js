import api from './axiosConfig';

export const getAnalytics = async () => {
  try {
    return await api.get('/admin/app/analytics');
  } catch {
    return await api.get('/admin/analytics');
  }
};
  