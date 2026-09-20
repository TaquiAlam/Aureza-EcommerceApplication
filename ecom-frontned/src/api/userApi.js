import api from './axiosConfig';

export const getUserProfile = () => api.get('/users/profile');

export const updateUserProfile = (data) => api.put('/users/profile', data);

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/users/profile/photo', formData);
};
