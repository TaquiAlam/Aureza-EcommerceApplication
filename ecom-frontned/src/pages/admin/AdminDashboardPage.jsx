import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Loader } from 'lucide-react';
import { getAnalytics } from '../../api/analyticsApi';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState({
    productCount: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: analytics.productCount,
      icon: Package,
      color: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-400'
    },
    {
      title: 'Total Revenue',
      value: formatPrice(analytics.totalRevenue),
      icon: DollarSign,
      color: 'from-purple-500 to-pink-400'
    }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.title}</h3>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  <Icon size={24} />
                </div>
              </div>
              
              <div className="relative z-10">
                <span className="text-4xl font-black text-white">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Placeholder for charts or recent activity */}
      <div className="mt-10 glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
          <p className="text-gray-500">More analytics and charts coming soon.</p>
        </div>
      </div>
    </div>
  );
}