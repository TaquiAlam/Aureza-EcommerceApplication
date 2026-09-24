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

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }

  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  }

  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2).replace(/\.00$/, '')}K`;
  }

  return `₹${num}`;
};

