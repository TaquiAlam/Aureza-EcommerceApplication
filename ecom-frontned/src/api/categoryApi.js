import api from './axiosConfig';

export const getAllCategories = (PageNumber = 0, PageSize = 50, sortbyID = 'id', sortAS_DS = 'asc') =>
  api.get('/public/categories', {
    params: { PageNumber, PageSize, sortbyID, sortAS_DS }
  });

export const createCategory = (categoryData) =>
  api.post('/public/categories', categoryData);

export const updateCategory = (categoryId, categoryData) =>
  api.put(`/public/categories/${categoryId}`, categoryData);

export const deleteCategory = (categoryId) =>
  api.delete(`/admin/categories/${categoryId}`);
