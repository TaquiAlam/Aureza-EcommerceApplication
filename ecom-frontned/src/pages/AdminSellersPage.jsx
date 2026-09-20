import { useState, useEffect } from 'react';
import { Loader, Plus, X, ShieldCheck } from 'lucide-react';
import { getAllSellers, addSeller } from '../api/authApi';
import toast from 'react-hot-toast';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      const res = await getAllSellers();
      setSellers(res.data?.content || []);
    } catch (err) {
      toast.error('Failed to load sellers');
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
      toast.success('Seller account created');
      setIsAdding(false);
      setFormData({ username: '', email: '', password: '' });
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create seller');
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
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Sellers Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Add Seller'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-primary/30">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
              className="input-field" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              className="input-field" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password"
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className="input-field" 
              required 
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">
              Create Seller Account
            </button>
          </div>
        </form>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-100/50 border-b border-primary/20">
                <th className="p-4 text-sm font-semibold text-gray-300">Seller ID</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Username</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-medium">#{seller.userId}</td>
                    <td className="p-4 text-white font-medium">{seller.username}</td>
                    <td className="p-4 text-gray-400">{seller.email}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                        <ShieldCheck size={14} /> Active
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