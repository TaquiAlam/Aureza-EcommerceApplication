import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { getAllProducts, parseProductsResponse } from '../api/productApi';
import { getAllCategories, parseCategoriesResponse } from '../api/categoryApi';
import ProductGrid from '../components/organisms/ProductGrid';
import SearchBar from '../components/molecules/SearchBar';
import Pagination from '../components/molecules/Pagination';
import { useApiError } from '../hooks/useApiError';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const { handleError } = useApiError();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories(0, 100);
        const parsed = parseCategoriesResponse(res.data);
        setCategories(parsed.content.filter(c => c.categoryName));
      } catch {
        // Fallback default categories if server is not active
        setCategories([
          { categoryID: 1, categoryName: 'Electronics' },
          { categoryID: 2, categoryName: 'Mobiles' },
          { categoryID: 3, categoryName: 'Fashion' },
          { categoryID: 4, categoryName: 'Home & Kitchen' },
          { categoryID: 5, categoryName: 'Books' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Sync local inputs when searchParams change in URL
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const deals = searchParams.get('deals');

        const res = await getAllProducts(pageNumber, pageSize, sortBy, sortOrder, search, category);
        const parsed = parseProductsResponse(res.data);

        let list = parsed.content;
        if (deals === 'true') {
          list = list.filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount);
        }
        setProducts(list);
        setTotalPages(parsed.totalPages);
        setTotalElements(parsed.totalElements);
      } catch (err) {
        handleError(err, 'Failed to load products', { silent: true });
        const categoryParam = searchParams.get('category')?.toLowerCase();
        const searchParam = searchParams.get('search')?.toLowerCase();
        const dealsParam = searchParams.get('deals');

        const fallbackList = [
          { productId: 101, productName: 'Apple iPhone 15 (128 GB) - Black', categoryName: 'Mobiles', price: 79900, specialPrice: 69999, discount: 12, quantity: 8, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=60' },
          { productId: 102, productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', categoryName: 'Electronics', price: 34990, specialPrice: 26990, discount: 23, quantity: 4, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
          { productId: 103, productName: 'Echo Dot (5th Gen) Smart speaker with Alexa', categoryName: 'Electronics', price: 5499, specialPrice: 4449, discount: 19, quantity: 15, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=60' },
          { productId: 104, productName: 'Java: The Complete Reference, Twelfth Edition', categoryName: 'Books', price: 1250, specialPrice: 999, discount: 20, quantity: 12, image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60' },
          { productId: 105, productName: 'Men Slim Fit Cotton Casual Shirt', categoryName: 'Fashion', price: 1999, specialPrice: 799, discount: 60, quantity: 20, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60' },
          { productId: 106, productName: 'Stainless Steel Insulated Water Bottle (1000 ml)', categoryName: 'Home & Kitchen', price: 999, specialPrice: 499, discount: 50, quantity: 3, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60' },
          { productId: 107, productName: 'Logitech MX Master 3S Wireless Performance Mouse', categoryName: 'Electronics', price: 10995, specialPrice: 8995, discount: 18, quantity: 0, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60' },
          { productId: 108, productName: 'Atomic Habits by James Clear - Bestseller', categoryName: 'Books', price: 799, specialPrice: 499, discount: 37, quantity: 25, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60' }
        ];

        let filtered = fallbackList;
        if (categoryParam && categoryParam !== 'all') {
          filtered = filtered.filter(p =>
            p.categoryName?.toLowerCase().includes(categoryParam) ||
            p.productName?.toLowerCase().includes(categoryParam) ||
            String(p.productId) === categoryParam
          );
        }
        if (searchParam) {
          filtered = filtered.filter(p =>
            p.productName?.toLowerCase().includes(searchParam) ||
            p.categoryName?.toLowerCase().includes(searchParam)
          );
        }
        if (dealsParam === 'true') {
          filtered = filtered.filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount);
        }

        setProducts(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, pageNumber, pageSize, sortBy, sortOrder]);

  const handleSearch = (query) => {
    setPageNumber(0);
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (categoryId) => {
    setPageNumber(0);
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== 'All') {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const toggleSort = () => {
    setPageNumber(0);
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('price');
    setSortOrder('asc');
    setPageNumber(0);
    setSearchParams({});
  };

  return (
    <div className="py-6 px-4 sm:px-6 max-w-[1480px] mx-auto animate-in fade-in duration-300">
      
      {/* Controls Bar */}
      <div className="bg-white border border-[#E8E2D6] rounded-xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Search Products */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          placeholder="Search Products"
        />

        {/* Right: Category Dropdown, SORT BY, Clear Filter */}
        <div className="flex items-end gap-3 w-full md:w-auto justify-end flex-wrap">
          
          {/* Stacked Category */}
          <div className="flex flex-col">
            <label className="text-[11px] text-gray-500 font-medium mb-1">Category</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-[#0F1111] font-medium outline-none cursor-pointer hover:border-gray-400 focus:border-[#E77600]"
              >
                <option value="">All</option>
                {categories.map((cat) => {
                  const id = cat.categoryID || cat.categoryId || cat.id;
                  return (
                    <option key={id} value={id}>
                      {cat.categoryName}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Blue SORT BY Button */}
          <button
            onClick={toggleSort}
            className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Toggle ascending / descending order"
          >
            SORT BY {sortOrder === 'asc' ? <ArrowUp size={14} className="stroke-[2.5]" /> : <ArrowDown size={14} className="stroke-[2.5]" />}
          </button>

          {/* Crimson Clear Filter Button */}
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 bg-[#881337] hover:bg-[#70102D] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            Clear Filter
          </button>
        </div>
      </div>

      {/* Top Compact Pagination */}
      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={setPageNumber}
        variant="compact"
        className="mb-6"
      />

      {/* Product Results Status */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs text-[#565959]">
        <span>
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          {searchParams.get('search') ? ` for "${searchParams.get('search')}"` : ''}
        </span>
        <span>Price: {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Bottom Full Pagination */}
      {totalPages > 1 && (
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          variant="full"
          className="mt-12 mb-6"
        />
      )}
    </div>
  );
}
