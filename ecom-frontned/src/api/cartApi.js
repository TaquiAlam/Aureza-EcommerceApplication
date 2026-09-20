import api from './axiosConfig';

export const addToCart = (productId, quantity) =>
  api.post(`/carts/products/${productId}/quantity/${quantity}`);

export const getAllCarts = () =>
  api.get('/carts');

export const getUserCart = () =>
  api.get('/carts/users/cart');

export const updateCartItemQuantity = (productId, operation) =>
  api.put(`/cart/products/${productId}/quantity/${operation}`);

export const removeFromCart = (cartId, productId) =>
  api.delete(`/carts/${cartId}/product/${productId}`);
