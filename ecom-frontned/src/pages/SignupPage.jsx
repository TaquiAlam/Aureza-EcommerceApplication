import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in relative">
      <div className="w-full max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-8 md:p-10 relative z-10 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD814] shadow-sm">
            <UserPlus size={28} className="text-[#E47911]" />
          </div>
          <h1 className="text-3xl font-black text-[#0F1111] tracking-tight">Create Account</h1>
          <p className="text-gray-600 mt-2 text-sm">Join Aureza and start shopping</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#0F1111] mb-1.5 ml-1">Username</label>
            <input
              className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#0F1111] mb-1.5 ml-1">Email</label>
            <input
              className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#0F1111] mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 pr-12 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F1111] transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            className="w-full py-3.5 mt-2 text-base font-bold bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] rounded-lg border border-[#FCD200] shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
            ) : (
              'Create your Aureza account'
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#007185] font-bold hover:underline hover:text-[#C7511F] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
