import api from './axiosConfig';

export const getAllCategories = (
  pageNumber = 0,
  pageSize = 10,
  sortbyID = 'id',
  sortAS_DS = 'asc'
) =>
  api.get('/public/categories', {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      pageNumber,
      pageSize,
      sortbyID,
      sortAS_DS
    }
  });

export const parseCategoriesResponse = (resData) => {
  let root = resData;
  if (Array.isArray(resData)) {
    root = resData[0] || {};
  }
  const rawList = root?.Content || root?.content || (Array.isArray(root) ? root : []);
  const normalizedList = Array.isArray(rawList)
    ? rawList.map(cat => ({
        categoryId: cat.categoryID ?? cat.categoryId ?? cat.id,
        categoryID: cat.categoryID ?? cat.categoryId ?? cat.id,
        categoryName: cat.categoryName ?? cat.name ?? ''
      }))
    : [];

  return {
    content: normalizedList,
    totalPages: root?.totalPages ?? 1,
    totalElements: root?.totalElements ?? normalizedList.length,
    pageNumber: root?.PageNumber ?? root?.pageNumber ?? 0,
    pageSize: root?.PageSize ?? root?.pageSize ?? normalizedList.length,
    lastPage: root?.lastPage ?? true
  };
};

export const createCategory = (categoryData) =>
  api.post('/admin/categories', categoryData);

export const updateCategory = (categoryId, categoryData) =>
  api.put(`/admin/categories/${categoryId}`, categoryData);

export const deleteCategory = (categoryId) =>
  api.delete(`/admin/categories/${categoryId}`);
