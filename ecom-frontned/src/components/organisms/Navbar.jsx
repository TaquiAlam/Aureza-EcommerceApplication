import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, MapPin, ChevronDown, LayoutDashboard, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { getAllCategories, parseCategoriesResponse } from '../../api/categoryApi';
import { getUserAddresses } from '../../api/addressApi';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getAllCategories(0, 100);
        const parsed = parseCategoriesResponse(res.data);
        setCategories(parsed.content.filter(c => c.categoryName));
      } catch {
        // ignore
      }
    };
    fetchCats();
  }, []);

  // Keep Navbar search and category in sync with current URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const cat = params.get('category');
    if (search !== null) setSearchQuery(search);
    if (cat !== null) setSelectedCategory(cat);
    else if (location.pathname === '/products' && !cat) setSelectedCategory('All');
  }, [location.search, location.pathname]);

  // Dynamically fetch user address for location badge
  useEffect(() => {
    const fetchLocation = async () => {
      if (!user) {
        setUserAddress(null);
        return;
      }
      try {
        const res = await getUserAddresses();
        const addrs = res.data || [];
        if (addrs.length > 0) {
          const savedId = localStorage.getItem('selectedAddressId');
          const active = addrs.find(a => String(a.addressId) === String(savedId)) || addrs[0];
          setUserAddress(active);
        } else {
          setUserAddress(null);
        }
      } catch {
        setUserAddress(null);
      }
    };

    fetchLocation();
    window.addEventListener('addressUpdated', fetchLocation);
    return () => window.removeEventListener('addressUpdated', fetchLocation);
  }, [user]);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    navigate(`/products?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Primary Top Bar (Amazon Slate Navy) */}
      <div className="bg-[#131921] text-white px-3 sm:px-4 py-2.5">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Deliver-to */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-1 py-1 px-2 border border-transparent hover:border-white rounded transition-colors group">
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Aureza<span className="text-[#FF9900]">.in</span>
              </span>
            </Link>

            {/* Dynamic Location Badge */}
            <div
              onClick={() => navigate(user ? '/addresses' : '/login')}
              className="hidden lg:flex items-center gap-1.5 py-1 px-2 border border-transparent hover:border-white rounded transition-colors cursor-pointer text-xs leading-tight"
              title={userAddress ? `${userAddress.buildingName ? userAddress.buildingName + ', ' : ''}${userAddress.streetAddress}, ${userAddress.city} - ${userAddress.pincode}` : 'Click to manage delivery addresses'}
            >
              <MapPin size={16} className="text-gray-300 self-end mb-0.5" />
              <div className="flex flex-col">
                <span className="text-gray-300 text-[11px] truncate max-w-[130px]">
                  Deliver to {user?.username || 'Guest'}
                </span>
                <span className="font-bold text-white text-xs truncate max-w-[140px]">
                  {userAddress
                    ? `${userAddress.city} ${userAddress.pincode}`
                    : (user ? 'Select address' : 'India')}
                </span>
              </div>
            </div>
          </div>

          {/* Central Search Bar (Amazon Style) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:flex items-center h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#F3A847] border border-transparent focus-within:border-transparent">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-full bg-[#E6E6E6] hover:bg-[#D4D4D4] text-[#0F1111] text-xs font-medium px-2.5 outline-none cursor-pointer border-r border-[#CDCDCD] shrink-0"
            >
              <option value="All">All</option>
              {categories.map((cat) => {
                const id = cat.categoryID || cat.categoryId || cat.id;
                return (
                  <option key={id} value={id}>
                    {cat.categoryName}
                  </option>
                );
              })}
            </select>

            {/* Input */}
            <input
              type="text"
              placeholder="Search Aureza.in"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full px-3.5 bg-white text-[#0F1111] text-sm outline-none placeholder:text-gray-500"
            />

            {/* Search Submit Button */}
            <button
              type="submit"
              className="h-full px-5 bg-[#FEB800] hover:bg-[#F3A847] text-[#131921] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Search"
            >
              <Search size={19} className="stroke-[2.5]" />
            </button>
          </form>

          {/* Right Nav Elements */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language */}
            <div className="hidden xl:flex items-center gap-1 py-1.5 px-2 border border-transparent hover:border-white rounded transition-colors cursor-pointer text-xs font-bold">
              <span>🇮🇳</span>
              <span>EN</span>
              <ChevronDown size={11} className="text-gray-400 ml-0.5" />
            </div>

            {/* Account & Lists */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 py-1 px-2 border border-transparent hover:border-white rounded transition-colors cursor-pointer text-xs"
              >
                {user && profile?.profileImage ? (
                  <img
                    src={profile.profileImage.startsWith('http') ? profile.profileImage : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : 'http://localhost:8080'}/images/${profile.profileImage}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover border border-[#FEB800] shrink-0"
                  />
                ) : null}
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-gray-300">
                    Hello, {user ? (profile?.fullName && typeof profile.fullName === 'string' ? profile.fullName.split(' ')[0] : (user?.username || 'User')) : 'Sign in'}
                  </span>
                  <span className="font-bold text-white flex items-center gap-0.5 text-xs">
                    Account & Lists <ChevronDown size={12} className="text-gray-400" />
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white text-[#0F1111] rounded-md shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {user ? (
                    <div className="flex flex-col">
                      <div className="pb-3 border-b border-gray-200 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 border border-amber-300 flex items-center justify-center font-bold text-sm text-[#E47911] overflow-hidden shrink-0">
                          {profile?.profileImage ? (
                            <img
                              src={profile.profileImage.startsWith('http') ? profile.profileImage : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : 'http://localhost:8080'}/images/${profile.profileImage}`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            String(profile?.fullName || user?.username || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-bold text-sm text-[#131921] truncate">{profile?.fullName || user?.username || 'User'}</p>
                          <p className="text-[11px] text-gray-500 truncate">@{user?.username || 'user'}</p>
                        </div>
                      </div>

                      <div className="py-2 flex flex-col gap-1 text-xs">
                        <Link to="/profile" className="py-1.5 px-2 rounded hover:bg-gray-100 hover:text-[#007185] flex items-center gap-2 font-semibold text-[#0F1111] transition-colors">
                          <User size={14} className="text-[#E47911]" /> Your Profile & Photo
                        </Link>
                        <Link to="/addresses" className="py-1.5 px-2 rounded hover:bg-gray-100 hover:text-[#007185] flex items-center gap-2 font-semibold text-[#0F1111] transition-colors">
                          <MapPin size={14} className="text-[#E47911]" /> Your Addresses
                        </Link>
                        <Link to="/products" className="py-1.5 px-2 rounded hover:bg-gray-100 hover:text-[#007185] transition-colors">
                          Your Products & Orders
                        </Link>
                        <Link to="/cart" className="py-1.5 px-2 rounded hover:bg-gray-100 hover:text-[#007185] transition-colors">
                          Your Cart ({cartItemCount})
                        </Link>
                        {(user?.roles?.includes('ROLE_SELLER') || user?.roles?.includes('ROLE_ADMIN')) && (
                          <Link to="/seller/products" className="py-1.5 px-2 rounded hover:bg-amber-50 hover:text-[#FF9900] flex items-center gap-1.5 text-amber-800 font-semibold transition-colors">
                            <Store size={14} className="text-[#FF9900]" /> Seller Portal
                          </Link>
                        )}
                        {user?.roles?.includes('ROLE_ADMIN') && (
                          <Link to="/admin" className="py-1.5 px-2 rounded hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1.5 text-indigo-700 font-semibold transition-colors">
                            <LayoutDashboard size={14} /> Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-semibold transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 text-center">
                      <Link
                        to="/login"
                        className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-xs font-bold rounded-md shadow-sm transition-colors text-center"
                      >
                        Sign in
                      </Link>
                      <p className="text-[11px] text-gray-600">
                        New customer?{' '}
                        <Link to="/signup" className="text-[#007185] hover:underline font-semibold">
                          Start here.
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              to="/cart"
              className="hidden sm:flex flex-col py-1 px-2 border border-transparent hover:border-white rounded transition-colors text-xs"
            >
              <span className="text-[11px] text-gray-300">Returns</span>
              <span className="font-bold text-white">& Orders</span>
            </Link>

            {/* Cart Icon & Count */}
            <Link
              to="/cart"
              className="flex items-center gap-1 py-1 px-2.5 border border-transparent hover:border-white rounded transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={26} className="text-white" />
                <span className="absolute -top-1.5 left-3 bg-[#FF9900] text-[#131921] text-[11px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-bold text-white text-xs mt-2 hidden sm:inline">Cart</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-white hover:bg-white/10 rounded"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <form onSubmit={handleSearch} className="mt-2 flex md:hidden items-center h-9 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#F3A847]">
          <input
            type="text"
            placeholder="Search Aureza.in"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-full px-3 bg-white text-[#0F1111] text-xs outline-none"
          />
          <button
            type="submit"
            className="h-full px-4 bg-[#FEB800] text-[#131921] flex items-center justify-center"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Mobile Delivery Location */}
        <div
          onClick={() => navigate(user ? '/addresses' : '/login')}
          className="flex lg:hidden items-center gap-1.5 pt-2 text-xs cursor-pointer text-gray-300"
        >
          <MapPin size={14} className="text-[#FF9900] shrink-0" />
          <span className="truncate">
            Deliver to {user?.username || 'Guest'} -{' '}
            <span className="text-white font-bold">
              {userAddress
                ? `${userAddress.city} ${userAddress.pincode}`
                : (user ? 'Select delivery address' : 'India')}
            </span>
          </span>
        </div>
      </div>

      {/* Secondary Sub-Navbar (Amazon Navy 2) */}
      <div className="bg-[#232F3E] text-white px-3 sm:px-4 py-1.5 text-xs font-medium">
        <div className="max-w-[1480px] mx-auto flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <Link
            to="/products"
            className="flex items-center gap-1.5 py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 font-bold text-white"
          >
            <Menu size={16} /> All
          </Link>
          <Link
            to="/products?deals=true"
            className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium"
          >
            Today's Deals
          </Link>
          {categories.length > 0 ? (
            categories.slice(0, 6).map((cat) => {
              const id = cat.categoryID || cat.categoryId || cat.id;
              return (
                <Link
                  key={id}
                  to={`/products?category=${id}&catName=${encodeURIComponent(cat.categoryName)}`}
                  className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium"
                >
                  {cat.categoryName}
                </Link>
              );
            })
          ) : (
            <>
              <Link to="/products?category=electronics" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">Electronics</Link>
              <Link to="/products?category=smartphones" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">Mobiles</Link>
              <Link to="/products?category=fashion" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">Fashion</Link>
              <Link to="/products?category=home" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">Home & Living</Link>
            </>
          )}
          <Link to="/about" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">
            About Us
          </Link>
          <Link to="/contact" className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-gray-200 hover:text-white font-medium">
            Contact Us
          </Link>
          <Link 
            to={user?.roles?.includes('ROLE_SELLER') || user?.roles?.includes('ROLE_ADMIN') ? "/seller/products" : "/signup"} 
            className="py-1 px-2 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 text-[#FEB800] hover:text-[#FF9900] font-bold flex items-center gap-1"
          >
            <Store size={13} /> {user?.roles?.includes('ROLE_SELLER') || user?.roles?.includes('ROLE_ADMIN') ? 'Seller Portal' : 'Sell on Aureza'}
          </Link>
          <div className="ml-auto hidden lg:flex items-center gap-1 text-[#FEB800] py-1 px-2 shrink-0">
            <Sparkles size={14} />
            <span className="font-semibold text-[11px] text-white">Join Prime for Free Fast Delivery</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#232F3E] text-white border-t border-gray-700 px-4 py-3 flex flex-col gap-2 text-sm">
          <Link to="/" className="py-2 border-b border-gray-700">Home</Link>
          <Link to="/products" className="py-2 border-b border-gray-700">All Products</Link>
          <Link to="/cart" className="py-2 border-b border-gray-700">Cart ({cartItemCount})</Link>
          {user && (
            <Link to="/profile" className="py-2 border-b border-gray-700 flex items-center gap-2 text-[#FEB800] font-semibold">
              <User size={15} /> Your Profile & Photo
            </Link>
          )}
          {(user?.roles?.includes('ROLE_SELLER') || user?.roles?.includes('ROLE_ADMIN')) && (
            <Link to="/seller/products" className="py-2 border-b border-gray-700 flex items-center gap-2 text-[#FEB800] font-bold">
              <Store size={15} /> Seller Portal
            </Link>
          )}
          <Link to="/about" className="py-2 border-b border-gray-700">About</Link>
          <Link to="/contact" className="py-2 border-b border-gray-700">Contact</Link>
          {user ? (
            <button onClick={handleLogout} className="py-2 text-left text-red-400 font-semibold">
              Sign Out ({user.username})
            </button>
          ) : (
            <Link to="/login" className="py-2 text-[#FEB800] font-bold">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
