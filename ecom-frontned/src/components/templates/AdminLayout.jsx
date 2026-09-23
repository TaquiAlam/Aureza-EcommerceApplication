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
  Store,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
    <div className="h-full flex flex-col bg-[#131921] text-white border-r border-[#232F3E] w-64 shadow-xl z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#232F3E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FFD814] flex items-center justify-center text-[#131921] font-black shadow-md shadow-amber-500/20">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">Aureza</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF9900]/20 text-[#FF9900] px-1.5 py-0.5 rounded border border-[#FF9900]/40">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const isActive = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#FF9900] text-[#131921] shadow-md shadow-amber-500/20' 
                  : 'text-gray-300 hover:text-white hover:bg-[#232F3E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#131921]' : 'text-gray-400'} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-[#131921]" />}
            </Link>
          );
        })}
      </div>

      {/* User and Logout */}
      <div className="p-4 border-t border-[#232F3E] bg-[#0c1117] flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'Admin User'}</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-400" /> Super Admin
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex text-[#131921]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E8E2D6] px-4 sm:px-6 py-3.5 sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 font-medium">Store Management</p>
              <h2 className="text-sm font-bold text-gray-900">Control Center</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F0EBE1] border border-[#E8E2D6] text-[#0F1111] text-xs font-bold rounded-lg transition-all shadow-xs"
            >
              <Store size={15} className="text-[#FF9900]" />
              <span>Return to Store</span>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}