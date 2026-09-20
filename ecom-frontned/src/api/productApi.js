import api from './axiosConfig';

export const getAllProducts = (pageNumber = 0, pageSize = 10, sortBy = 'productId', sortOrder = 'asc') =>
  api.get('/public/products', {
    params: { pageNumber, pageSize, sortBy, sortOrder }
  });

export const getProductsByCategory = (categoryId, pageNumber = 0, pageSize = 10, sortBy = 'productId', sortOrder = 'asc') =>
  api.get(`/public/categories/${categoryId}/products`, {
    params: { pageNumber, pageSize, sortBy, sortOrder }
  });

export const searchProducts = (keyword, pageNumber = 0, pageSize = 10, sortBy = 'productId', sortOrder = 'asc') =>
  api.get(`/public/products/keyword/${keyword}`, {
    params: { pageNumber, pageSize, sortBy, sortOrder }
  });

export const addProduct = (categoryId, productData) =>
  api.post(`/admin/categories/${categoryId}/product`, productData);

export const updateProduct = (productId, productData) =>
  api.put(`/admin/products/${productId}`, productData);

export const deleteProduct = (productId) =>
  api.delete(`/admin/products/${productId}`);

export const updateProductImage = (productId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.put(`/products/${productId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
