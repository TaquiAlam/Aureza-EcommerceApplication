import api from './axiosConfig';

export const createAddress = (addressData) =>
  api.post('/addresses', addressData);

export const getAllAddresses = () =>
  api.get('/addresses');

export const getAddressById = (addressId) =>
  api.get(`/addresses/${addressId}`);

export const getUserAddresses = () =>
  api.get('/users/addresses');

export const updateAddress = (addressId, addressData) =>
  api.put(`/addresses/${addressId}`, addressData);

export const deleteAddress = (addressId) =>
  api.delete(`/addresses/${addressId}`);
