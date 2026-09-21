import { ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice, formatDiscount } from '../../utils/formatPrice';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const discountText = formatDiscount(product.discount);
  const hasDiscount = product.discount > 0 && product.specialPrice;
  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;
  const isLowStock = product.quantity !== undefined && product.quantity > 0 && product.quantity <= 5;
  
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `/images/${product.image}`)
    : `https://picsum.photos/seed/${product.productId}/400/300`;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product.productId, 1);
    }
  };

  return (
    <div 
      className="creamy-card flex flex-col group relative overflow-hidden bg-white border border-[#E8E2D6] rounded-xl hover:shadow-lg transition-all duration-200" 
      id={`product-card-${product.productId}`}
    >
      {/* Image Section */}
      <div className="relative w-full pt-[75%] bg-[#F9F8F6] overflow-hidden rounded-t-xl border-b border-[#F0EBE1]">
        <img
          className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          src={imageUrl}
          alt={product.productName}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${product.productId}/400/300`;
          }}
        />
        
        {/* Deal / Discount Badge */}
        {discountText && (
          <div className="absolute top-2.5 left-2.5 bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {discountText}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body Section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {product.categoryName && (
          <span className="text-[11px] font-semibold text-[#007185] uppercase tracking-wide">
            {product.categoryName}
          </span>
        )}
        
        <h3 className="text-sm font-semibold text-[#0F1111] line-clamp-2 hover:text-[#C7511F] transition-colors leading-snug">
          {product.productName}
        </h3>

        {/* Rating Stars Mock */}
        <div className="flex items-center gap-1.5 text-xs text-[#565959]">
          <div className="flex text-[#FFA41C]">
            <Star size={13} fill="#FFA41C" />
            <Star size={13} fill="#FFA41C" />
            <Star size={13} fill="#FFA41C" />
            <Star size={13} fill="#FFA41C" />
            <Star size={13} className="text-gray-300" />
          </div>
          <span className="text-[11px] font-medium text-[#007185]">
            {(4 + ((product.productId % 10) / 10)).toFixed(1)}
          </span>
          <span className="text-[11px] text-gray-400">
            ({((product.productId * 47) % 800) + 12})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-[#0F1111]">
            {formatPrice(hasDiscount ? product.specialPrice : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#565959] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Prime / Delivery info */}
        <div className="text-[11px] text-[#565959] flex items-center gap-1">
          <span className="text-xs font-bold text-[#007185]">prime</span>
          <span>FREE delivery Tomorrow</span>
        </div>

        {/* Stock Status Badge */}
        <div className="mt-1">
          {isOutOfStock ? (
            <span className="text-xs font-semibold text-red-600">Currently unavailable</span>
          ) : isLowStock ? (
            <span className="text-xs font-semibold text-[#B12704]">
              Only {product.quantity} left in stock - order soon
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <Check size={12} className="stroke-[3]" /> In Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto pt-3 border-t border-[#F0EBE1]">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] active:scale-[0.98]'
            }`}
            id={`add-to-cart-${product.productId}`}
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
