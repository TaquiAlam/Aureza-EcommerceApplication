import { Trash2, AlertCircle } from 'lucide-react';
import QuantityControl from '../molecules/QuantityControl';
import { formatPrice } from '../../utils/formatPrice';
import { getProductImageUrl } from '../../utils/imageUtils';

/**
 * CartItem — Organism rendering a single cart product row.
 *
 * Extracted from CartPage inline map callback for reusability.
 */
export default function CartItem({ product, onUpdateQuantity, onRemove }) {
  const isMaxStockReached =
    product.productQuantity !== undefined &&
    product.productQuantity !== null &&
    product.quantity >= product.productQuantity;

  const imageUrl = getProductImageUrl(product.image, product.productId);

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:border-gray-300 transition-colors">
      {/* Product Image */}
      <div className="w-full sm:w-32 h-32 rounded-lg bg-[#FAF7F2] border border-[#F0EBE1] overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
        <img
          className="max-w-full max-h-full object-contain"
          src={imageUrl}
          alt={product.productName}
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${product.productId}/200/200`;
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-base font-bold text-[#0F1111] leading-snug line-clamp-2">
            {product.productName}
          </h3>
          <p className="text-lg font-black text-[#B12704] whitespace-nowrap">
            {formatPrice((product.specialPrice || product.price) * product.quantity)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#565959] mb-3">
          <span>Each: {formatPrice(product.specialPrice || product.price)}</span>
          {product.productQuantity !== undefined && (
            <span className="text-[11px] text-gray-400">
              • Available stock: {product.productQuantity}
            </span>
          )}
        </div>

        {/* Max Stock Warning Banner */}
        {isMaxStockReached && (
          <div className="flex items-center gap-1.5 text-xs text-[#B12704] bg-[#FFF8F7] border border-[#FADCD9] px-2.5 py-1.5 rounded-md mb-3">
            <AlertCircle size={14} className="shrink-0" />
            <span className="font-semibold">
              Maximum available stock limit ({product.productQuantity}) reached.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F0EBE1]">
          {/* Quantity Controls */}
          <QuantityControl
            quantity={product.quantity}
            maxQuantity={product.productQuantity}
            onIncrease={() => onUpdateQuantity(product.productId, 'add')}
            onDecrease={() => onUpdateQuantity(product.productId, 'delete')}
          />

          {/* Remove Button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => onRemove(product.productId)}
            title="Delete from cart"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
