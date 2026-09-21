import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Store
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Sellers', path: '/admin/sellers', icon: Users },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-dark-200 border-r border-primary/20 w-64 shadow-2xl z-40">
      <div className="p-6 border-b border-primary/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <Store size={22} />
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Admin Panel
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/20 text-primary font-semibold' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-100'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-primary/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-300 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-dark-200 border-b border-primary/20 p-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-300 p-1">
              <Menu size={28} />
            </button>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
          <Link to="/" className="text-primary text-sm font-medium hover:underline">
            View Store
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in relative z-0">
          <div className="hidden lg:flex justify-end mb-6">
            <Link to="/" className="btn btn-secondary py-2">
              <Store size={18} />
              Return to Store
            </Link>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}