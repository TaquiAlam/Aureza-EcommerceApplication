import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Search, 
  Package, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  getAllProducts, 
  parseProductsResponse, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductImage 
} from '../../api/productApi';
import { getAllCategories, parseCategoriesResponse } from '../../api/categoryApi';
import { formatPrice } from '../../utils/formatPrice';
import { getProductImageUrl } from '../../utils/imageUtils';
import Pagination from '../../components/molecules/Pagination';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering state
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Add / Edit form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    specialPrice: '',
    discount: 0,
    quantity: '',
    categoryId: ''
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Fetch products whenever pageNumber, pageSize, selectedCategory changes
  useEffect(() => {
    fetchProductList();
  }, [pageNumber, pageSize, selectedCategory]);

  const fetchCategoryList = async () => {
    try {
      const res = await getAllCategories(0, 100);
      const parsed = parseCategoriesResponse(res.data);
      setCategories(parsed.content);
    } catch {
      // Fallback silently
    }
  };

  const fetchProductList = async (customSearch = searchTerm) => {
    try {
      setLoading(true);
      const res = await getAllProducts(
        pageNumber,
        pageSize,
        'productId',
        'asc',
        customSearch,
        selectedCategory
      );
      const parsed = parseProductsResponse(res.data);
      setProducts(parsed.content);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.totalElements);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(0);
    fetchProductList(searchTerm);
  };

  const handleCategoryFilterChange = (catId) => {
    setSelectedCategory(catId);
    setPageNumber(0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setFormData({
      productName: '',
      description: '',
      price: '',
      specialPrice: '',
      discount: 0,
      quantity: '',
      categoryId: ''
    });
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setIsAdding(false);
    setFormData({
      productName: product.productName || '',
      description: product.productDescription || product.description || '',
      price: product.price || '',
      specialPrice: product.specialPrice || '',
      discount: product.discount || 0,
      quantity: product.quantity || '',
      categoryId: product.category?.categoryId || product.category?.categoryID || categories[0]?.categoryId || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      await addProduct(formData.categoryId, formData);
      toast.success('Product created successfully');
      resetForm();
      fetchProductList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.productId, formData);
      toast.success('Product updated successfully');
      resetForm();
      fetchProductList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProductList();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleImageUpload = async (productId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await updateProductImage(productId, file);
      toast.success('Product image updated successfully');
      fetchProductList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    }
  };

  const resolveImageUrl = (img, productId) => {
    if (!img || img === 'default.png') return null;
    return getProductImageUrl(img, productId);
  };

  const startIndex = pageNumber * pageSize + 1;
  const endIndex = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">
            Products Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Total {totalElements} items in store inventory. Manage prices, stock & media.
          </p>
        </div>

        <button 
          onClick={() => {
            if (isAdding || editingProduct) {
              resetForm();
            } else {
              setIsAdding(true);
              setEditingProduct(null);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          {isAdding || editingProduct ? <X size={16} /> : <Plus size={16} />}
          <span>{isAdding || editingProduct ? 'Cancel' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Add or Edit Product Form */}
      {(isAdding || editingProduct) && (
        <form 
          onSubmit={editingProduct ? handleUpdateSubmit : handleAddSubmit} 
          className="bg-white border-2 border-[#FF9900]/40 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="md:col-span-2 pb-2 border-b border-[#F0EBE1] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
              <Package size={17} className="text-[#FF9900]" />
              {editingProduct ? `Edit Product: ${editingProduct.productName}` : 'Add New Product'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
            <input 
              name="productName" 
              value={formData.productName} 
              onChange={handleInputChange} 
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
              required 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Description *</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              rows="3" 
              placeholder="Detailed description of product features..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Regular Price (₹) *</label>
            <input 
              type="number" 
              step="0.01"
              name="price" 
              value={formData.price} 
              onChange={handleInputChange} 
              placeholder="e.g. 1999"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
            <input 
              type="number" 
              name="discount" 
              value={formData.discount} 
              onChange={handleInputChange} 
              placeholder="e.g. 10"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity *</label>
            <input 
              type="number" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleInputChange} 
              placeholder="e.g. 50"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
            <select 
              name="categoryId" 
              value={formData.categoryId} 
              onChange={handleInputChange} 
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none transition-all" 
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                ⚠️ No categories exist. Please create a category first in the Categories section.
              </p>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 border border-[#E8E2D6] hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Save size={16} /> 
              <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Products Table Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-[#E8E2D6] flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FAF7F2]/60">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D6] focus:border-[#FF9900] rounded-xl text-xs text-gray-900 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#FF9900] hover:bg-[#FF8800] text-[#131921] font-bold text-xs rounded-xl shadow-xs shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="py-1.5 px-2.5 bg-white border border-[#E8E2D6] rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                ))}
              </select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500 font-bold uppercase">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(0);
                }}
                className="py-1.5 px-2 bg-white border border-[#E8E2D6] rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Top Pagination */}
        <div className="px-4 py-2.5 border-b border-[#F0EBE1] flex items-center justify-between text-xs text-gray-500 bg-white">
          <span>
            {totalElements > 0 ? (
              <>Showing <strong className="text-gray-900">{startIndex}–{endIndex}</strong> of <strong className="text-gray-900">{totalElements}</strong> products</>
            ) : (
              '0 products'
            )}
          </span>

          {totalPages > 1 && (
            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
              variant="compact"
            />
          )}
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading Page {pageNumber + 1}...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E2D6]">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Product</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Price</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600">Stock</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-500 text-xs">
                      <Package size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700">No products found on this page.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Try resetting search filters or click "Add New Product".</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imgUrl = resolveImageUrl(product.image, product.productId);
                    return (
                      <tr key={product.productId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-[#E8E2D6] overflow-hidden shrink-0 flex items-center justify-center">
                              {imgUrl ? (
                                <img 
                                  src={imgUrl} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span class="text-gray-400 text-xs font-bold">Aureza</span>';
                                  }}
                                />
                              ) : (
                                <Package size={20} className="text-gray-400" />
                              )}
                            </div>
                            <div className="max-w-xs">
                              <p className="font-bold text-[#0F1111] text-xs leading-snug line-clamp-2">
                                {product.productName || 'Untitled Product'}
                              </p>
                              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                {product.productDescription || product.description || 'No description provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-black text-[#0F1111] text-xs">
                              {formatPrice(product.specialPrice ?? product.price)}
                            </p>
                            {product.discount > 0 && (
                              <p className="text-[10px] text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            product.quantity > 5
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : product.quantity > 0
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Upload Image Button */}
                            <label 
                              className="p-1.5 text-[#007185] hover:bg-[#007185]/10 rounded-lg cursor-pointer transition-colors" 
                              title="Upload Product Image"
                            >
                              <ImageIcon size={16} />
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                onChange={(e) => handleImageUpload(product.productId, e)} 
                              />
                            </label>

                            {/* Edit Button */}
                            <button 
                              onClick={() => handleStartEdit(product)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                              title="Edit Product"
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Delete Button */}
                            <button 
                              onClick={() => handleDelete(product.productId, product.productName)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Full Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E8E2D6] bg-[#FAF7F2]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Page <strong className="text-gray-900">{pageNumber + 1}</strong> of <strong className="text-gray-900">{totalPages}</strong>
            </span>

            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
              variant="full"
            />
          </div>
        )}
      </div>
    </div>
  );
}