import api from './axiosConfig';

export const placeOrder = (paymentMethod, orderData) =>
  api.post(`/order/users/payments/${paymentMethod}`, orderData);

export const getAllOrders = (pageNumber = 0, pageSize = 10, sortbyID = 'orderId', sortAS_DS = 'desc') =>
  api.get('/admin/orders', {
    params: { PageNumber: pageNumber, PageSize: pageSize, sortbyID, sortAS_DS }
  });

export const updateOrderStatus = (orderId, status) =>
  api.put(`/admin/orders/${orderId}/status`, { status });

// ==========================================
// 🚀 DEDICATED SELLER PANEL ORDER APIs
// ==========================================
export const getSellerOrders = (pageNumber = 0, pageSize = 10, sortbyID = 'orderId', sortAS_DS = 'desc') =>
  api.get('/seller/orders', {
    params: { PageNumber: pageNumber, PageSize: pageSize, sortbyID, sortAS_DS }
  });

export const updateSellerOrderStatus = (orderId, status) =>
  api.put(`/seller/orders/${orderId}/status`, { status });

export const createStripeClientSecret = (data) =>
  api.post('/order/stripe-client-secret', data);

