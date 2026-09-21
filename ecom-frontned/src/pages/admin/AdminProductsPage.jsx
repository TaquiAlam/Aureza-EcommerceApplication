import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, Save, X, Image as ImageIcon } from 'lucide-react';
import { getAllProducts, addProduct, updateProduct, deleteProduct, updateProductImage } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: 0,
    specialPrice: 0,
    discount: 0,
    quantity: 0,
    categoryId: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getAllProducts(0, 50),
        getAllCategories(0, 50)
      ]);
      setProducts(prodRes.data?.content || []);
      setCategories(catRes.data?.content || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      await addProduct(formData.categoryId, formData);
      toast.success('Product created');
      setIsAdding(false);
      setFormData({
        productName: '', description: '', price: 0, specialPrice: 0, discount: 0, quantity: 0, categoryId: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleImageUpload = async (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await updateProductImage(productId, file);
      toast.success('Image uploaded successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to upload image');
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
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Products Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-primary/30">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
            <input name="productName" value={formData.productName} onChange={handleInputChange} className="input-field" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field" rows="3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Special Price</label>
            <input type="number" name="specialPrice" value={formData.specialPrice} onChange={handleInputChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="input-field bg-dark-100" required>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Save Product
            </button>
          </div>
        </form>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-100/50 border-b border-primary/20">
                <th className="p-4 text-sm font-semibold text-gray-300">Image</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Price</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Stock</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-100 border border-white/10 flex items-center justify-center">
                        {product.image && product.image !== 'default.png' ? (
                          <img src={`http://localhost:8080/api/public/products/image/${product.image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">{product.productName}</td>
                    <td className="p-4 text-accent font-semibold">{formatPrice(product.specialPrice)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${product.quantity > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <label className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors" title="Upload Image">
                          <ImageIcon size={18} />
                          <input type="file" className="hidden" onChange={(e) => handleImageUpload(product.productId, e)} />
                        </label>
                        <button className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => handleDelete(product.productId)} title="Delete">
                          <Trash2 size={18} />
                        </button>
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