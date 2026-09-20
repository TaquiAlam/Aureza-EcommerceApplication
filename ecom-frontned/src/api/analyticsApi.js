import api from './axiosConfig';

export const getAnalytics = async () => {
  return await api.get('/api/admin/analytics');
};
