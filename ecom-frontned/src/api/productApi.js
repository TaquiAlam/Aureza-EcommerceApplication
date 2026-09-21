import api from './axiosConfig';

export const getAllProducts = (
  pageNumber = 0,
  pageSize = 10,
  sortBy = 'productId',
  sortOrder = 'asc',
  keyword = '',
  category = ''
) => {
  if (typeof pageNumber === 'object' && pageNumber !== null) {
    const opts = pageNumber;
    const params = {
      pageNumber: opts.pageNumber ?? 0,
      pageSize: opts.pageSize ?? 10,
      sortBy: opts.sortBy ?? 'productId',
      sortOrder: opts.sortOrder ?? 'asc',
    };
    if (opts.keyword && String(opts.keyword).trim()) params.keyword = String(opts.keyword).trim();
    if (opts.category && opts.category !== 'All') params.category = opts.category;
    return api.get('/public/products', { params });
  }

  const params = { pageNumber, pageSize, sortBy, sortOrder };
  if (keyword && String(keyword).trim()) params.keyword = String(keyword).trim();
  if (category && category !== 'All') params.category = category;

  return api.get('/public/products', { params });
};

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
