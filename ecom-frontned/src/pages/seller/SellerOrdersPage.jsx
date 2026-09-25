import { useState, useEffect } from 'react';
import { Loader2, ShoppingCart, ChevronDown, RefreshCw, ArrowUpDown, PackageCheck } from 'lucide-react';
import { getSellerOrders, updateSellerOrderStatus } from '../../api/orderApi';
import Pagination from '../../components/molecules/Pagination';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination & Sorting state
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [sortBy, setSortBy] = useState('orderId');

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, pageSize, sortOrder, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getSellerOrders(pageNumber, pageSize, sortBy, sortOrder);
      const data = res.data;
      const orderList = data?.contents || data?.content || (Array.isArray(data) ? data : []);
      setOrders(orderList);

      if (data && typeof data === 'object') {
        if (data.totalPages !== undefined) setTotalPages(data.totalPages);
        if (data.totalElements !== undefined) setTotalElements(data.totalElements);
      }
    } catch {
      toast.error('Failed to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateSellerOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPageNumber(0);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(0);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF9900] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Order Fulfillment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight mt-1">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage purchases, track customer deliveries, and update shipment fulfillment status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button 
            onClick={toggleSortOrder}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-[#E8E2D6] text-gray-700 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            title={`Sort Order: ${sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}`}
          >
            <ArrowUpDown size={13} className="text-[#FF9900]" />
            <span>{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
          </button>

          <button 
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-[#E8E2D6] text-gray-800 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#FF9900]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-[#E8E2D6] bg-[#FAF7F2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-[#FF9900]" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Orders Queue ({totalElements > 0 ? totalElements : orders.length})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-white border border-[#E8E2D6] rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF9900] cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {totalPages > 1 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
                variant="compact"
              />
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading Customer Orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E2D6]">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Order ID</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Customer</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Total Value</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Order Placed</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Status</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600 text-center">Fulfill Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">
                      <PackageCheck size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700">No customer orders recorded yet.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">When customers purchase items from your inventory, orders will populate here.</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-xs text-[#007185]">
                        #{order.orderId}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-[#0F1111]">{order.email || 'Customer'}</p>
                      </td>

                      <td className="py-3.5 px-4 font-black text-xs text-[#0F1111]">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500 font-medium">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recent'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {updatingId === order.orderId ? (
                          <Loader2 className="w-4 h-4 text-[#FF9900] animate-spin mx-auto" />
                        ) : (
                          <div className="relative inline-block">
                            <select
                              className="appearance-none bg-[#FAF7F2] hover:bg-white border border-[#E8E2D6] focus:border-[#FF9900] rounded-lg py-1 pl-2.5 pr-6 text-xs font-semibold text-gray-800 outline-none cursor-pointer"
                              value={order.orderStatus || 'Pending'}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E8E2D6] bg-[#FAF7F2]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Page <strong className="text-gray-900">{pageNumber + 1}</strong> of <strong className="text-gray-900">{totalPages}</strong> (Total {totalElements} orders)
            </span>

            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
              variant="full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
