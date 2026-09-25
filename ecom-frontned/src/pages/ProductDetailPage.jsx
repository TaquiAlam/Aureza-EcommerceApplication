import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Zap, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronLeft, 
  Check, 
  AlertCircle,
  Loader2,
  Share2,
  PackageCheck
} from 'lucide-react';
import { getAllProducts, getProductById, normalizeProduct, parseProductsResponse } from '../api/productApi';
import { useCart } from '../hooks/useCart';
import { formatPrice, formatDiscount } from '../utils/formatPrice';
import { getProductImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      // 1. Try direct single-product fetch from backend
      try {
        const directRes = await getProductById(productId);
        if (directRes.data && (directRes.data.productId || directRes.data.id || directRes.data.productName)) {
          setProduct(normalizeProduct(directRes.data));
          return;
        }
      } catch (err) {
        // Fall back to listing search if direct endpoint not matched
        console.debug('Direct fetch failed, falling back to product list', err);
      }

      // 2. Fallback: Search in product list
      const res = await getAllProducts(0, 100);
      const parsed = parseProductsResponse(res.data);
      const found = parsed.content.find((p) => String(p.productId) === String(productId));

      if (found) {
        setProduct(found);
      } else {
        // 3. Fallback: Search across larger list
        const fullRes = await getAllProducts(0, 500);
        const fullParsed = parseProductsResponse(fullRes.data);
        const fullFound = fullParsed.content.find((p) => String(p.productId) === String(productId));
        setProduct(fullFound || null);
      }
    } catch {
      toast.error('Failed to load product details');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    try {
      setAddingToCart(true);
      await addToCart(product.productId, quantity);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;
    try {
      setBuyingNow(true);
      await addToCart(product.productId, quantity);
      navigate('/checkout');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#FF9900] animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={48} className="text-amber-500" />
        <h2 className="text-2xl font-black text-[#0F1111]">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md">
          The product you are looking for may have been removed or is temporarily unavailable in our inventory.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] font-bold text-xs rounded-xl text-[#0F1111] shadow-sm transition-all"
        >
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const discountText = formatDiscount(product.discount);
  const hasDiscount = product.discount > 0 && product.specialPrice;
  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;
  const isLowStock = product.quantity !== undefined && product.quantity > 0 && product.quantity <= 5;
  const imageUrl = getProductImageUrl(product.image, product.productId);
  const savings = hasDiscount ? (product.price - product.specialPrice) : 0;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#007185] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#007185] transition-colors">Products</Link>
          {product.categoryName && (
            <>
              <span>/</span>
              <span className="text-gray-700 font-medium">{product.categoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[#0F1111] font-bold truncate max-w-xs">{product.productName}</span>
        </div>

        <button 
          onClick={handleShare}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
          title="Share Product"
        >
          <Share2 size={15} />
          <span className="hidden sm:inline text-xs font-semibold">Share</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative w-full aspect-square bg-[#FAF7F2] rounded-2xl border border-[#F0EBE1] overflow-hidden flex items-center justify-center p-6 shadow-inner group">
            <img
              src={imageUrl}
              alt={product.productName}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = `https://picsum.photos/seed/${product.productId}/600/600`;
              }}
            />

            {discountText && (
              <div className="absolute top-4 left-4 bg-[#CC0C39] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                {discountText}
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-gray-900 text-white text-sm font-bold px-4 py-1.5 rounded-xl shadow-md">
                  Currently Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600 pt-2">
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EBE1] flex flex-col items-center gap-1">
              <Truck size={18} className="text-[#007185]" />
              <span className="font-semibold">Free Delivery</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EBE1] flex flex-col items-center gap-1">
              <RotateCcw size={18} className="text-[#007185]" />
              <span className="font-semibold">7-Day Return</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EBE1] flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-[#007185]" />
              <span className="font-semibold">Secure Pay</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Pricing & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Status */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {product.categoryName && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#007185] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {product.categoryName}
                </span>
              )}
              
              <div className="flex items-center gap-1 text-xs">
                {isOutOfStock ? (
                  <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="font-bold text-[#B12704] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Only {product.quantity} units left!
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={12} className="stroke-[3]" /> In Stock ({product.quantity} available)
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight leading-snug">
              {product.productName}
            </h1>

            {/* Rating Stars Mock */}
            <div className="flex items-center gap-2 text-xs text-[#565959] pb-2 border-b border-[#F0EBE1]">
              <div className="flex text-[#FFA41C]">
                <Star size={16} fill="#FFA41C" />
                <Star size={16} fill="#FFA41C" />
                <Star size={16} fill="#FFA41C" />
                <Star size={16} fill="#FFA41C" />
                <Star size={16} className="text-gray-300" />
              </div>
              <span className="font-bold text-[#007185]">
                {(4 + ((product.productId % 10) / 10)).toFixed(1)} / 5.0
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">
                {((product.productId * 47) % 800) + 12} Verified Customer Ratings
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#0F1111]">
                  {formatPrice(hasDiscount ? product.specialPrice : product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-[#565959] line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
                {discountText && (
                  <span className="text-xs font-bold text-[#CC0C39] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    Save {discountText}
                  </span>
                )}
              </div>

              {savings > 0 && (
                <p className="text-xs text-emerald-700 font-bold">
                  You save {formatPrice(savings)} ({Math.round(product.discount)}% off regular price)
                </p>
              )}
              <p className="text-[11px] text-gray-500">Inclusive of all applicable GST & taxes.</p>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">About this item</h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-[#FAF7F2]/40 p-4 rounded-xl border border-[#F0EBE1]">
                {product.productDescription || product.description || 'No detailed description provided for this catalog item.'}
              </p>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="pt-4 border-t border-[#F0EBE1] space-y-4">
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-gray-700">Quantity:</span>
                <div className="inline-flex items-center border border-[#E8E2D6] rounded-xl bg-white shadow-xs overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-gray-900 text-xs min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.quantity || 10, q + 1))}
                    disabled={quantity >= (product.quantity || 10)}
                    className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-gray-500">
                  (Max {Math.min(product.quantity || 10, 10)} per order)
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] active:scale-[0.99]'
                }`}
              >
                {addingToCart ? (
                  <Loader2 size={16} className="animate-spin text-[#0F1111]" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyingNow}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FFA41C] hover:bg-[#FA8900] border border-[#FF8F00] text-[#0F1111] active:scale-[0.99]'
                }`}
              >
                {buyingNow ? (
                  <Loader2 size={16} className="animate-spin text-[#0F1111]" />
                ) : (
                  <Zap size={16} fill="#0F1111" />
                )}
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
