import { useState, useEffect } from 'react';
import { Loader, Eye, ChevronDown } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data?.content || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Orders Management</h1>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-100/50 border-b border-primary/20">
                <th className="p-4 text-sm font-semibold text-gray-300">Order ID</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Total Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-medium">#{order.orderId}</td>
                    <td className="p-4 text-gray-400">{order.email}</td>
                    <td className="p-4 text-white font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="p-4 text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {updatingId === order.orderId ? (
                          <Loader className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <div className="relative group">
                            <select
                              className="appearance-none bg-dark-100 border border-primary/20 rounded-lg py-1.5 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}