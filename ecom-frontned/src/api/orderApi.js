import api from './axiosConfig';

export const placeOrder = (paymentMethod, orderData) =>
  api.post(`/order/users/payments/${paymentMethod}`, orderData);

export const getAllOrders = (pageNumber = 0, pageSize = 50, sortbyID = 'orderId', sortAS_DS = 'asc') =>
  api.get('/admin/orders', {
    params: { PageNumber: pageNumber, PageSize: pageSize, sortbyID, sortAS_DS }
  });

export const updateOrderStatus = (orderId, status) =>
  api.put(`/admin/orders/${orderId}/status`, { status });

export const createStripeClientSecret = (data) =>
  api.post('/order/stripe-client-secret', data);
