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
  Eye,
  Upload,
  CheckCircle2,
  Star,
  Check
} from 'lucide-react';
import { 
  getSellerProducts, 
  parseProductsResponse, 
  addSellerProduct, 
  updateSellerProduct, 
  deleteSellerProduct, 
  updateSellerProductImage 
} from '../../api/productApi';
import { getAllCategories, parseCategoriesResponse } from '../../api/categoryApi';
import { formatPrice, formatDiscount } from '../../utils/formatPrice';
import { getProductImageUrl } from '../../utils/imageUtils';
import Pagination from '../../components/molecules/Pagination';
import toast from 'react-hot-toast';

export default function SellerProductsPage() {
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
  
  // Slide-over Drawer (Slider) state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('view'); // 'view' | 'edit' | 'image' | 'add'
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

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
      const res = await getSellerProducts(
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
      toast.error('Failed to load seller products');
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
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'price' || name === 'discount') {
        const p = parseFloat(name === 'price' ? value : prev.price) || 0;
        const d = parseFloat(name === 'discount' ? value : prev.discount) || 0;
        if (d > 0 && p > 0) {
          updated.specialPrice = (p - (p * d) / 100).toFixed(2);
        } else {
          updated.specialPrice = p;
        }
      }
      return updated;
    });
  };

  // Open Drawer in View mode (Same Page preview)
  const handleOpenView = (product) => {
    setActiveProduct(product);
    setDrawerMode('view');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFormData({
      productName: product.productName || '',
      description: product.productDescription || product.description || '',
      price: product.price || '',
      specialPrice: product.specialPrice || '',
      discount: product.discount || 0,
      quantity: product.quantity || '',
      categoryId: product.category?.categoryId || product.category?.categoryID || categories[0]?.categoryId || ''
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer in Add mode
  const handleOpenAdd = () => {
    setActiveProduct(null);
    setDrawerMode('add');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFormData({
      productName: '',
      description: '',
      price: '',
      specialPrice: '',
      discount: 0,
      quantity: '',
      categoryId: categories[0]?.categoryId || ''
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer in Edit mode
  const handleOpenEdit = (product) => {
    setActiveProduct(product);
    setDrawerMode('edit');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFormData({
      productName: product.productName || '',
      description: product.productDescription || product.description || '',
      price: product.price || '',
      specialPrice: product.specialPrice || '',
      discount: product.discount || 0,
      quantity: product.quantity || '',
      categoryId: product.category?.categoryId || product.category?.categoryID || categories[0]?.categoryId || ''
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer focused on Image upload
  const handleOpenImage = (product) => {
    setActiveProduct(product);
    setDrawerMode('image');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFormData({
      productName: product.productName || '',
      description: product.productDescription || product.description || '',
      price: product.price || '',
      specialPrice: product.specialPrice || '',
      discount: product.discount || 0,
      quantity: product.quantity || '',
      categoryId: product.category?.categoryId || product.category?.categoryID || categories[0]?.categoryId || ''
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setActiveProduct(null);
    setSelectedFile(null);
    setImagePreviewUrl(null);
  };

  // Handle local file selection with instant live preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
    }
  };

  // Upload image to backend
  const handleImageUploadSubmit = async () => {
    if (!activeProduct || !selectedFile) {
      toast.error('Please select an image file first');
      return;
    }
    try {
      setIsUploadingImage(true);
      await updateSellerProductImage(activeProduct.productId, selectedFile);
      toast.success('Product image updated successfully!');
      setSelectedFile(null);
      setImagePreviewUrl(null);
      fetchProductList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a valid category');
      return;
    }

    try {
      setIsSubmittingForm(true);
      if (drawerMode === 'add') {
        const res = await addSellerProduct(formData.categoryId, formData);
        const newProductId = res.data?.productId || res.data?.id;
        
        if (selectedFile && newProductId) {
          try {
            await updateSellerProductImage(newProductId, selectedFile);
          } catch {
            // non-fatal
          }
        }
        toast.success('Product added to your catalog successfully');
      } else {
        await updateSellerProduct(activeProduct.productId, formData);
        
        if (selectedFile) {
          try {
            await updateSellerProductImage(activeProduct.productId, selectedFile);
          } catch {
            // non-fatal
          }
        }
        toast.success('Product updated successfully');
      }
      handleCloseDrawer();
      fetchProductList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      try {
        await deleteSellerProduct(id);
        toast.success('Product removed successfully');
        if (isDrawerOpen && activeProduct?.productId === id) {
          handleCloseDrawer();
        }
        fetchProductList();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF9900] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Seller Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight mt-1">
            Product Inventory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Total {totalElements} items listed. Manage stock, pricing, and high-res product photos.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-[#E8E2D6] flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FAF7F2]/60">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D6] focus:border-[#FF9900] rounded-xl text-xs text-gray-900 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#FF9900] hover:bg-[#FF8800] text-[#131921] font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
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
            <p className="text-xs text-gray-500 font-medium">Loading Products...</p>
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
                      <p className="font-semibold text-gray-700">No products in your catalog.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Click "Add New Product" to list your first item.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imgUrl = resolveImageUrl(product.image, product.productId);
                    return (
                      <tr key={product.productId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleOpenView(product)}
                              className="w-12 h-12 rounded-xl bg-gray-100 border border-[#E8E2D6] overflow-hidden shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer relative group"
                              title="Click to preview product details on this page"
                            >
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
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye size={14} className="text-white" />
                              </div>
                            </button>
                            <div className="max-w-xs">
                              <button
                                onClick={() => handleOpenView(product)}
                                className="font-bold text-[#0F1111] text-xs leading-snug line-clamp-2 hover:text-[#FF9900] text-left transition-colors cursor-pointer"
                              >
                                {product.productName || 'Untitled Product'}
                              </button>
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
                            {/* View Product Details in same page slider */}
                            <button
                              onClick={() => handleOpenView(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                              title="View Product Details (Same Page)"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Open Slider Image Mode */}
                            <button 
                              onClick={() => handleOpenImage(product)}
                              className="p-1.5 text-[#007185] hover:bg-[#007185]/10 rounded-lg cursor-pointer transition-colors" 
                              title="Edit Image & Media"
                            >
                              <ImageIcon size={16} />
                            </button>

                            {/* Open Slider Edit Mode */}
                            <button 
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                              title="Edit Product Details"
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Delete Button */}
                            <button 
                              onClick={() => handleDelete(product.productId, product.productName)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" 
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
              Page <strong className="text-gray-900">{pageNumber + 1}</strong> of <strong className="text-gray-900">{totalPages}</strong> (Total {totalElements} products)
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

      {/* ============================================================ */}
      {/* 🚀 SLIDE-OVER DRAWER (SLIDER) FOR VIEW / EDIT / IMAGE / DELETE */}
      {/* ============================================================ */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-[#E8E2D6] flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E8E2D6] bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF9900]">
                      {drawerMode === 'add' 
                        ? 'New Product' 
                        : drawerMode === 'view' 
                        ? 'Product Overview' 
                        : `Edit #${activeProduct?.productId}`}
                    </span>
                    {activeProduct && drawerMode !== 'view' && (
                      <button
                        type="button"
                        onClick={() => setDrawerMode('view')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007185] hover:underline cursor-pointer"
                      >
                        <Eye size={12} /> View Mode
                      </button>
                    )}
                    {activeProduct && drawerMode === 'view' && (
                      <button
                        type="button"
                        onClick={() => setDrawerMode('edit')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit Mode
                      </button>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-[#0F1111] truncate max-w-xs sm:max-w-sm mt-0.5">
                    {drawerMode === 'add' 
                      ? 'Add New Product' 
                      : (activeProduct?.productName || 'Product Details')}
                  </h2>
                </div>

                <button 
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 🌟 VIEW MODE (SAME PAGE PREVIEW) */}
                {drawerMode === 'view' && activeProduct && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Big Image Section */}
                    <div className="relative w-full aspect-4/3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] overflow-hidden flex items-center justify-center p-4 shadow-inner">
                      {activeProduct.image && activeProduct.image !== 'default.png' ? (
                        <img 
                          src={getProductImageUrl(activeProduct.image, activeProduct.productId)} 
                          alt={activeProduct.productName} 
                          className="max-h-full max-w-full object-contain" 
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/seed/${activeProduct.productId}/500/500`;
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400 space-y-1">
                          <Package size={40} className="mx-auto text-gray-300" />
                          <p className="text-xs font-medium">Default Catalog Image</p>
                        </div>
                      )}

                      {activeProduct.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-[#CC0C39] text-white text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                          {formatDiscount(activeProduct.discount)}
                        </div>
                      )}
                    </div>

                    {/* Meta tags & Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#007185] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        {activeProduct.categoryName || 'General Category'}
                      </span>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        activeProduct.quantity > 5
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : activeProduct.quantity > 0
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {activeProduct.quantity > 0 ? `${activeProduct.quantity} in Stock` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Title & Rating */}
                    <div>
                      <h3 className="text-xl font-black text-[#0F1111] leading-snug">
                        {activeProduct.productName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#FFA41C] mt-1.5">
                        <div className="flex">
                          <Star size={14} fill="#FFA41C" />
                          <Star size={14} fill="#FFA41C" />
                          <Star size={14} fill="#FFA41C" />
                          <Star size={14} fill="#FFA41C" />
                          <Star size={14} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-[#007185] ml-1">4.5 / 5.0</span>
                      </div>
                    </div>

                    {/* Price Card */}
                    <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl space-y-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-[#0F1111]">
                          {formatPrice(activeProduct.specialPrice ?? activeProduct.price)}
                        </span>
                        {activeProduct.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through font-medium">
                            {formatPrice(activeProduct.price)}
                          </span>
                        )}
                        {activeProduct.discount > 0 && (
                          <span className="text-xs font-bold text-[#CC0C39] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Save {formatDiscount(activeProduct.discount)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">Live price reflected on storefront.</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Product Description</h4>
                      <p className="text-xs text-gray-700 leading-relaxed bg-[#FAF7F2]/50 p-3.5 rounded-xl border border-[#F0EBE1] whitespace-pre-line">
                        {activeProduct.productDescription || activeProduct.description || 'No detailed description available.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 📝 EDIT / ADD / IMAGE FORM MODE */}
                {drawerMode !== 'view' && (
                  <div className="space-y-6">
                    {/* 1. IMAGE PREVIEW & UPLOAD SECTION */}
                    <div className="bg-[#FAF7F2] border border-[#E8E2D6] p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <ImageIcon size={15} className="text-[#FF9900]" /> Product Media & Live Preview
                        </span>
                        {imagePreviewUrl && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} /> Live Preview Ready
                          </span>
                        )}
                      </div>

                      {/* Image Display */}
                      <div className="relative w-full h-48 bg-white border border-[#E8E2D6] rounded-xl overflow-hidden flex items-center justify-center p-3 shadow-inner">
                        {imagePreviewUrl ? (
                          <img 
                            src={imagePreviewUrl} 
                            alt="Local Preview" 
                            className="max-h-full max-w-full object-contain" 
                          />
                        ) : activeProduct?.image && activeProduct.image !== 'default.png' ? (
                          <img 
                            src={getProductImageUrl(activeProduct.image, activeProduct.productId)} 
                            alt={activeProduct.productName} 
                            className="max-h-full max-w-full object-contain" 
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/${activeProduct.productId}/400/400`;
                            }}
                          />
                        ) : (
                          <div className="text-center text-gray-400 space-y-1">
                            <Package size={36} className="mx-auto text-gray-300" />
                            <p className="text-xs font-medium">No custom image uploaded yet</p>
                          </div>
                        )}
                      </div>

                      {/* File Selector & Action */}
                      <div className="space-y-2">
                        <label className="block">
                          <span className="sr-only">Choose Product Image</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFD814] file:text-[#0F1111] hover:file:bg-[#F7CA00] cursor-pointer"
                          />
                        </label>

                        {selectedFile && activeProduct && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={handleImageUploadSubmit}
                              disabled={isUploadingImage}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007185] hover:bg-[#005a6a] text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isUploadingImage ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Upload size={13} />
                              )}
                              <span>{isUploadingImage ? 'Uploading...' : 'Save Image Now'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. FORM DETAILS */}
                    <form id="sellerProductForm" onSubmit={handleFormSubmit} className="space-y-4">
                      {/* Product Name */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                        <input
                          type="text"
                          name="productName"
                          value={formData.productName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Wireless Noise Cancelling Headphones"
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                              {c.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price, Discount, Special Price, Quantity */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="1"
                            step="0.01"
                            placeholder="999.00"
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                          <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            min="0"
                            max="99"
                            placeholder="10"
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity *</label>
                          <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            required
                            min="0"
                            placeholder="50"
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Final Price (₹)</label>
                          <div className="px-3.5 py-2 bg-gray-100 border border-[#E8E2D6] rounded-xl text-xs font-black text-[#0F1111]">
                            {formatPrice(formData.specialPrice || formData.price || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Highlight key features, technical specifications, and warranty details..."
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-medium text-gray-900 outline-none resize-none"
                        />
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#E8E2D6] bg-[#FAF7F2] flex items-center justify-between gap-3">
                {drawerMode === 'view' && activeProduct ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDelete(activeProduct.productId, activeProduct.productName)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawerMode('edit')}
                        className="px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Edit2 size={15} /> Edit Product
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseDrawer}
                      className="px-4 py-2.5 border border-[#E8E2D6] hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      form="sellerProductForm"
                      disabled={isSubmittingForm}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingForm ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{drawerMode === 'add' ? 'Publish Product' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
