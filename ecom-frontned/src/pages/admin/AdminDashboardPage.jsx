import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Tags, Loader2, ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import { getAnalytics } from '../../api/analyticsApi';
import { getAllProducts } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import { formatPrice, formatCurrency } from '../../utils/formatPrice';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState({
    productCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    categoryCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      let productCount = 0;
      let categoryCount = 0;
      let totalOrders = 0;
      let totalRevenue = 0;

      // 1. Primary: Fetch from new Analytics API (/api/admin/app/analytics)
      try {
        const res = await getAnalytics();
        if (res.data) {
          productCount = Number(res.data.productCount || 0);
          totalOrders = Number(res.data.totalOrders || 0);
          totalRevenue = Number(res.data.totalRevenue || 0);
        }
      } catch {
        // Fallback: Fetch product count if analytics endpoint fails
        try {
          const prodRes = await getAllProducts(0, 1);
          productCount = prodRes.data?.totalElements ?? prodRes.data?.content?.length ?? 0;
        } catch {
          // ignore fallback error
        }
      }

      // 2. Fetch category count for catalog badge
      try {
        const catRes = await getAllCategories(0, 1);
        const raw = catRes.data;
        if (Array.isArray(raw)) {
          categoryCount = raw[0]?.totalElements ?? raw[0]?.content?.length ?? raw.length;
        } else {
          categoryCount = raw?.totalElements ?? raw?.content?.length ?? 0;
        }
      } catch {
        // ignore fallback error
      }

      setAnalytics({
        productCount,
        totalOrders,
        totalRevenue,
        categoryCount
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: analytics.productCount,
      icon: Package,
      link: '/admin/products',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: 'Inventory'
    },
    {
      title: 'Categories',
      value: analytics.categoryCount,
      icon: Tags,
      link: '/admin/categories',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'Catalog'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: ShoppingCart,
      link: '/admin/orders',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'Sales'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      link: '/admin/orders',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Earnings'
    }
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Live Store Data
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track sales, catalog items, and order fulfillment in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.link}
              className="bg-white border border-[#E8E2D6] hover:border-[#FF9900]/60 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {stat.title}
                </span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color} transition-transform group-hover:scale-105 shadow-xs`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">
                  {stat.value}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#007185] group-hover:translate-x-0.5 transition-transform">
                  View <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action & Insights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white border border-[#E8E2D6] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FF9900]" />
              <h2 className="text-base font-bold text-[#0F1111]">Management Quick Links</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/products"
              className="p-4 rounded-xl border border-[#F0EBE1] hover:border-[#FF9900]/40 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Manage Products</p>
                  <p className="text-[11px] text-gray-500">Add, edit stock & prices</p>
                </div>
              </div>
              <ArrowUpRight size={15} className="text-gray-400" />
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 rounded-xl border border-[#F0EBE1] hover:border-[#FF9900]/40 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Tags size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Manage Categories</p>
                  <p className="text-[11px] text-gray-500">Organize store catalog</p>
                </div>
              </div>
              <ArrowUpRight size={15} className="text-gray-400" />
            </Link>

            <Link
              to="/admin/orders"
              className="p-4 rounded-xl border border-[#F0EBE1] hover:border-[#FF9900]/40 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Customer Orders</p>
                  <p className="text-[11px] text-gray-500">Track and fulfill orders</p>
                </div>
              </div>
              <ArrowUpRight size={15} className="text-gray-400" />
            </Link>

            <Link
              to="/admin/sellers"
              className="p-4 rounded-xl border border-[#F0EBE1] hover:border-[#FF9900]/40 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Seller Accounts</p>
                  <p className="text-[11px] text-gray-500">Manage vendor partners</p>
                </div>
              </div>
              <ArrowUpRight size={15} className="text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D6] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F1111] mb-2">Store Status</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Your Aureza Storefront is online with active Stripe Card checkout, instant UPI verification, and COD support.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0EBE1]">
                <span className="text-gray-500">Gateway Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0EBE1]">
                <span className="text-gray-500">Security</span>
                <span className="font-bold text-[#007185]">SSL 256-bit</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-gray-500">Total Products</span>
                <span className="font-bold text-gray-900">{analytics.productCount} items</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/products"
            className="w-full mt-4 py-2.5 text-center text-xs font-bold bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] rounded-xl shadow-xs transition-all"
          >
            + Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}