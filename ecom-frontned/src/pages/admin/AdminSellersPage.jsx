import { useState, useEffect } from 'react';
import { Loader2, Plus, X, ShieldCheck, Users, AlertCircle, UserPlus } from 'lucide-react';
import { getAllSellers, addSeller } from '../../api/authApi';
import toast from 'react-hot-toast';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApiPending, setIsApiPending] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setIsApiPending(false);
      const res = await getAllSellers();
      setSellers(res.data?.content || res.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsApiPending(true);
      } else {
        toast.error('Failed to load sellers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSeller(formData.username, formData.email, formData.password);
      toast.success('Seller account created successfully');
      setIsAdding(false);
      setFormData({ username: '', email: '', password: '' });
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create seller');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading Sellers...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">
            Sellers Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage authorized merchant accounts and vendor access permissions.
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          <span>{isAdding ? 'Cancel' : 'Add New Seller'}</span>
        </button>
      </div>

      {/* Backend API Notice if not yet created */}
      {isApiPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend Sellers API Pending</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              The endpoint <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold">GET /api/auth/sellers</code> has not been created in Spring Boot yet. Once added to <code className="font-mono">AuthController.java</code>, all registered sellers will display here.
            </p>
          </div>
        </div>
      )}

      {/* Add Seller Form */}
      {isAdding && (
        <form 
          onSubmit={handleAddSubmit} 
          className="bg-white border-2 border-[#FF9900]/40 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="md:col-span-3 pb-2 border-b border-[#F0EBE1] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
              <UserPlus size={17} className="text-[#FF9900]" />
              Create New Seller Account
            </h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Username *</label>
            <input 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
              placeholder="e.g. seller_taqui"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
            <input 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="seller@aureza.com"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
            <input 
              type="password"
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none" 
              required 
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-[#E8E2D6] hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* Sellers Table Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E2D6] bg-[#FAF7F2]/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <Users size={15} className="text-[#FF9900]" />
            Registered Sellers ({sellers.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8E2D6]">
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Seller ID</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Username</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Email Address</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500 text-xs">
                    <Users size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700">No sellers registered yet.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Use the "Add New Seller" button to onboard vendor partners.</p>
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller.userId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-xs text-[#007185]">
                      #{seller.userId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs text-[#0F1111]">
                      {seller.username}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                      {seller.email}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <ShieldCheck size={12} /> Active Partner
                      </span>
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