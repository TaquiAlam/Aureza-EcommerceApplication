import api from './axiosConfig';

export const normalizeProduct = (prod) => {
  if (!prod) return null;
  return {
    ...prod,
    productId: prod.productId ?? prod.id,
    productName: prod.productName ?? prod.name ?? '',
    description: prod.productDescription ?? prod.description ?? '',
    productDescription: prod.productDescription ?? prod.description ?? '',
    quantity: prod.quantity ?? prod.productQuantity ?? 0,
    price: prod.price ?? 0,
    specialPrice: prod.specialPrice ?? prod.price ?? 0,
    discount: prod.discount ?? 0,
    image: prod.image ?? 'default.png',
    categoryName: prod.category?.categoryName ?? prod.categoryName ?? ''
  };
};

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
    const pNum = opts.pageNumber ?? 0;
    const pSize = opts.pageSize ?? 10;
    const params = {
      pageNumber: pNum,
      pageSize: pSize,
      PageNumber: pNum,
      PageSize: pSize,
      sortBy: opts.sortBy ?? 'productId',
      sortOrder: opts.sortOrder ?? 'asc',
    };
    if (opts.keyword && String(opts.keyword).trim()) params.keyword = String(opts.keyword).trim();
    if (opts.category && opts.category !== 'All') params.category = opts.category;
    return api.get('/public/products', { params });
  }

  const params = { 
    pageNumber, 
    pageSize, 
    PageNumber: pageNumber,
    PageSize: pageSize,
    sortBy, 
    sortOrder 
  };
  if (keyword && String(keyword).trim()) params.keyword = String(keyword).trim();
  if (category && category !== 'All') params.category = category;

  return api.get('/public/products', { params });
};

export const getProductById = (productId) =>
  api.get(`/public/products/${productId}`);

export const parseProductsResponse = (resData) => {
  const root = resData || {};
  const rawList = root?.content || root?.Content || (Array.isArray(root) ? root : []);
  const normalizedList = Array.isArray(rawList)
    ? rawList.map(prod => normalizeProduct(prod))
    : [];

  return {
    content: normalizedList,
    totalPages: root?.totalPages ?? 1,
    totalElements: root?.totalElements ?? normalizedList.length,
    pageNumber: root?.Page_Number ?? root?.pageNumber ?? 0,
    pageSize: root?.Page_Size ?? root?.pageSize ?? normalizedList.length,
    lastPage: root?.lastPage ?? true
  };
};

export const getProductsByCategory = (categoryId, pageNumber = 0, pageSize = 10, sortBy = 'productId', sortOrder = 'asc') =>
  api.get(`/public/categories/${categoryId}/products`, {
    params: { pageNumber, pageSize, PageNumber: pageNumber, PageSize: pageSize, sortBy, sortOrder }
  });

export const searchProducts = (keyword, pageNumber = 0, pageSize = 10, sortBy = 'productId', sortOrder = 'asc') =>
  api.get(`/public/products/keyword/${keyword}`, {
    params: { pageNumber, pageSize, PageNumber: pageNumber, PageSize: pageSize, sortBy, sortOrder }
  });

export const addProduct = (categoryId, productData) => {
  const payload = {
    ...productData,
    productDescription: productData.productDescription || productData.description || 'Quality product from Aureza',
    quantity: Number(productData.quantity || productData.productQuantity || 0)
  };
  return api.post(`/admin/categories/${categoryId}/product`, payload);
};

export const updateProduct = (productId, productData) => {
  const payload = {
    ...productData,
    productDescription: productData.productDescription || productData.description || 'Quality product from Aureza',
    quantity: Number(productData.quantity || productData.productQuantity || 0)
  };
  return api.put(`/admin/products/${productId}`, payload);
};

export const deleteProduct = (productId) =>
  api.delete(`/admin/products/${productId}`);

export const updateProductImage = (productId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.put(`/products/${productId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==========================================
// 🚀 DEDICATED SELLER PANEL PRODUCT APIs
// ==========================================
export const getSellerProducts = (
  pageNumber = 0,
  pageSize = 10,
  sortBy = 'productId',
  sortOrder = 'asc',
  keyword = '',
  category = ''
) => {
  if (typeof pageNumber === 'object' && pageNumber !== null) {
    const opts = pageNumber;
    const pNum = opts.pageNumber ?? 0;
    const pSize = opts.pageSize ?? 10;
    const params = {
      pageNumber: pNum,
      pageSize: pSize,
      PageNumber: pNum,
      PageSize: pSize,
      sortBy: opts.sortBy ?? 'productId',
      sortOrder: opts.sortOrder ?? 'asc',
    };
    if (opts.keyword && String(opts.keyword).trim()) params.keyword = String(opts.keyword).trim();
    if (opts.category && opts.category !== 'All') params.category = opts.category;
    return api.get('/seller/products', { params });
  }

  const params = { 
    pageNumber, 
    pageSize, 
    PageNumber: pageNumber,
    PageSize: pageSize,
    sortBy, 
    sortOrder 
  };
  if (keyword && String(keyword).trim()) params.keyword = String(keyword).trim();
  if (category && category !== 'All') params.category = category;

  return api.get('/seller/products', { params });
};

export const addSellerProduct = (categoryId, productData) => {
  const desc = (productData.productDescription || productData.description || 'Quality product from Aureza').trim();
  const payload = {
    ...productData,
    productName: (productData.productName || '').trim(),
    productDescription: desc.length >= 6 ? desc : desc + ' quality item',
    description: desc.length >= 6 ? desc : desc + ' quality item',
    price: Number(productData.price || 0),
    discount: Number(productData.discount || 0),
    specialPrice: Number(productData.specialPrice || productData.price || 0),
    quantity: Number(productData.quantity || productData.productQuantity || 0),
    productQuantity: Number(productData.quantity || productData.productQuantity || 0)
  };
  return api.post(`/seller/categories/${categoryId}/product`, payload);
};

export const updateSellerProduct = (productId, productData) => {
  const desc = (productData.productDescription || productData.description || 'Quality product from Aureza').trim();
  const payload = {
    ...productData,
    productName: (productData.productName || '').trim(),
    productDescription: desc.length >= 6 ? desc : desc + ' quality item',
    description: desc.length >= 6 ? desc : desc + ' quality item',
    price: Number(productData.price || 0),
    discount: Number(productData.discount || 0),
    specialPrice: Number(productData.specialPrice || productData.price || 0),
    quantity: Number(productData.quantity || productData.productQuantity || 0),
    productQuantity: Number(productData.quantity || productData.productQuantity || 0)
  };
  return api.put(`/seller/products/${productId}`, payload);
};

export const deleteSellerProduct = (productId) =>
  api.delete(`/seller/products/${productId}`);

export const updateSellerProductImage = (productId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.put(`/seller/products/${productId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

