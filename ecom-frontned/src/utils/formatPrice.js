export function formatPrice(price) {
  if (price == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatDiscount(discount) {
  if (!discount || discount <= 0) return null;
  return `${Math.round(discount)}% OFF`;
}
