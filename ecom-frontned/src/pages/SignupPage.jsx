import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Store, ShoppingBag, Sparkles, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApiError } from '../hooks/useApiError';
import AuthLayout from '../components/templates/AuthLayout';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';

export default function SignupPage() {
  const { register, user } = useAuth();
  const { handleError } = useApiError();
  const navigate = useNavigate();

  // Account Type Switcher: 'customer' | 'seller'
  const [accountType, setAccountType] = useState('customer');

  // Customer Form State
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Seller Form State
  const [sellerUsername, setSellerUsername] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [showSellerPassword, setShowSellerPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  // Handle Customer Signup
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerUsername.trim() || !customerEmail.trim() || !customerPassword.trim()) {
      handleError(null, 'Please fill all fields');
      return;
    }
    if (customerPassword.length < 6) {
      handleError(null, 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(customerUsername.trim(), customerEmail.trim(), customerPassword, 'user');
      navigate('/login');
    } catch (err) {
      handleError(err, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Seller Signup
  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    if (!sellerUsername.trim() || !sellerEmail.trim() || !sellerPassword.trim()) {
      handleError(null, 'Please fill all fields');
      return;
    }
    if (sellerPassword.length < 6) {
      handleError(null, 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(sellerUsername.trim(), sellerEmail.trim(), sellerPassword, 'seller');
      navigate('/login');
    } catch (err) {
      handleError(err, 'Seller registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 🚀 Sliding Tab Switcher */}
      <div className="mb-6">
        <div className="relative bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8E2D6] flex items-center shadow-inner">
          {/* Active Slider Background Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md border border-[#E8E2D6] transition-transform duration-300 ease-out ${
              accountType === 'seller' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
            }`}
          />

          {/* Customer Tab Button */}
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`relative z-10 w-1/2 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'customer' ? 'text-[#0F1111]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={16} className={accountType === 'customer' ? 'text-[#FF9900]' : 'text-gray-400'} />
            <span>Customer Account</span>
          </button>

          {/* Seller Tab Button */}
          <button
            type="button"
            onClick={() => setAccountType('seller')}
            className={`relative z-10 w-1/2 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'seller' ? 'text-[#0F1111]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Store size={16} className={accountType === 'seller' ? 'text-[#FF9900]' : 'text-gray-400'} />
            <span>Seller Partner</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🛍️ VIEW 1: CUSTOMER SIGNUP (Visible when accountType === 'customer') */}
      {/* ========================================================= */}
      {accountType === 'customer' && (
        <div className="animate-in fade-in slide-in-from-left-3 duration-250">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#FFF8E7] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#FFD814] shadow-sm">
              <UserPlus size={26} className="text-[#E47911]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">Create Customer Account</h1>
            <p className="text-gray-500 mt-1 text-xs">Join Aureza to discover millions of products with fast delivery & deals.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleCustomerSubmit}>
            <FormField
              label="Username"
              name="username"
              placeholder="e.g. rahul_kumar"
              value={customerUsername}
              onChange={(e) => setCustomerUsername(e.target.value)}
              autoComplete="username"
            />
            
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              autoComplete="email"
            />
            
            <FormField label="Password" name="password">
              <div className="relative">
                <Input
                  type={showCustomerPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F1111] transition-colors p-1"
                >
                  {showCustomerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2 font-bold text-xs"
            >
              Create Aureza Customer Account
            </Button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🏢 VIEW 2: SELLER SIGNUP (Visible when accountType === 'seller') */}
      {/* ========================================================= */}
      {accountType === 'seller' && (
        <div className="animate-in fade-in slide-in-from-right-3 duration-250">
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-300 shadow-sm">
              <Store size={26} className="text-[#FF9900]" />
            </div>
            <div className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <Sparkles size={11} className="text-[#E47911]" /> Aureza Merchant Partner
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">Sell on Aureza</h1>
            <p className="text-gray-500 mt-1 text-xs">Start selling to millions of active buyers across India.</p>
          </div>

          {/* Seller Perks Mini Banner */}
          <div className="grid grid-cols-3 gap-1.5 p-2.5 mb-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D6] text-center text-[10px] text-gray-700">
            <div className="flex flex-col items-center gap-0.5">
              <Zap size={14} className="text-[#FF9900]" />
              <span className="font-bold">0% Listing Fees</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Truck size={14} className="text-[#007185]" />
              <span className="font-bold">Pan-India Reach</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="font-bold">Fast Payouts</span>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSellerSubmit}>
            <FormField
              label="Seller / Merchant Username"
              name="sellerUsername"
              placeholder="e.g. apex_electronics"
              value={sellerUsername}
              onChange={(e) => setSellerUsername(e.target.value)}
              autoComplete="username"
            />
            
            <FormField
              label="Business / Contact Email"
              name="sellerEmail"
              type="email"
              placeholder="vendor@yourbusiness.com"
              value={sellerEmail}
              onChange={(e) => setSellerEmail(e.target.value)}
              autoComplete="email"
            />
            
            <FormField label="Password" name="sellerPassword">
              <div className="relative">
                <Input
                  type={showSellerPassword ? 'text' : 'password'}
                  placeholder="Create secure seller password (min 6 chars)"
                  value={sellerPassword}
                  onChange={(e) => setSellerPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSellerPassword(!showSellerPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F1111] transition-colors p-1"
                >
                  {showSellerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2 font-bold text-xs"
            >
              Register as Aureza Seller Partner
            </Button>
          </form>
        </div>
      )}

      {/* Footer Switch to Sign In */}
      <p className="text-center text-gray-600 mt-6 text-xs">
        Already have an account?{' '}
        <Link to="/login" className="text-[#007185] font-bold hover:underline hover:text-[#C7511F] transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
