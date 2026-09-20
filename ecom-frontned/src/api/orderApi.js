import api from './axiosConfig';

export const placeOrder = (paymentMethod, orderData) =>
  api.post(`/order/users/payments/${paymentMethod}`, orderData);

export const getAllOrders = (pageNumber = 0, pageSize = 50, sortBy = 'orderId', sortOrder = 'asc') =>
  api.get('/admin/orders', {
    params: { pageNumber, pageSize, sortBy, sortOrder }
  });

export const updateOrderStatus = (orderId, status) =>
  api.put(`/admin/orders/${orderId}/status`, { status });
