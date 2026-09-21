import ProductCard from './ProductCard';
import { Package } from 'lucide-react';

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="creamy-card flex flex-col overflow-hidden animate-pulse bg-white border border-[#E8E2D6] rounded-xl">
            <div className="w-full pt-[75%] bg-[#F0EBE1]" />
            <div className="p-4 flex flex-col gap-2.5 flex-1">
              <div className="h-3 bg-[#E8E2D6] rounded w-1/3" />
              <div className="h-4 bg-[#E8E2D6] rounded w-3/4" />
              <div className="h-3 bg-[#E8E2D6] rounded w-1/2" />
              <div className="h-5 bg-[#E8E2D6] rounded w-1/3 mt-2" />
              <div className="h-8 bg-[#E8E2D6] rounded w-full mt-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E8E2D6] rounded-2xl p-10 shadow-sm">
        <Package size={64} className="text-gray-400 mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-bold text-[#0F1111] mb-2">No products found</h3>
        <p className="text-sm text-[#565959]">Try adjusting your search query, selecting another category, or clearing filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}
