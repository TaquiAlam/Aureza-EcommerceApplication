import { formatPrice, formatDiscount } from '../../utils/formatPrice';
import Badge from '../atoms/Badge';

/**
 * PriceDisplay — Molecule showing current price, strikethrough original, and discount badge.
 *
 * Extracted from ProductCard for reuse in product detail, cart items, etc.
 */
export default function PriceDisplay({
  price,
  specialPrice,
  discount,
  size = 'md',
  className = '',
}) {
  const hasDiscount = discount > 0 && specialPrice;
  const discountText = formatDiscount(discount);
  const displayPrice = hasDiscount ? specialPrice : price;

  const sizeStyles = {
    sm: { price: 'text-sm', original: 'text-[10px]' },
    md: { price: 'text-lg', original: 'text-xs' },
    lg: { price: 'text-2xl', original: 'text-sm' },
  };

  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`${s.price} font-bold text-[#0F1111]`}>
        {formatPrice(displayPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className={`${s.original} text-[#565959] line-through`}>
            {formatPrice(price)}
          </span>
          {discountText && <Badge variant="discount">{discountText}</Badge>}
        </>
      )}
    </div>
  );
}
