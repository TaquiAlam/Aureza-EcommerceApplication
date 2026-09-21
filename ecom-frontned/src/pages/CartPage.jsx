import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import CartItem from '../components/organisms/CartItem';
import EmptyState from '../components/atoms/EmptyState';
import { FullPageSpinner } from '../components/atoms/Spinner';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, cartLoading, fetchCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in py-16 px-4">
        <EmptyState
          icon={ShoppingBag}
          iconClassName="text-[#FF9900]"
          title="Sign in to view your cart"
          description="Please sign in to see items you've added previously, manage quantities, and proceed to checkout."
          actionLabel="Sign In to Your Account"
          actionTo="/login"
        />
      </div>
    );
  }

  if (cartLoading) {
    return <FullPageSpinner />;
  }

  const products = cart?.products || [];

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in py-16 px-4">
        <EmptyState
          icon={ShoppingBag}
          iconClassName="text-gray-400"
          title="Your Shopping Cart is empty"
          description="Your shopping cart is waiting for you. Explore our collection and find great deals today!"
          actionLabel="Continue Shopping"
          actionTo="/products"
          actionIcon={ShoppingBag}
        />
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="mb-6 pb-3 border-b border-[#E8E2D6]">
          <h1 className="text-3xl font-extrabold text-[#0F1111] tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-[#565959]">
            {products.length} {products.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {products.map((product) => (
              <CartItem
                key={product.productId}
                product={product}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F1111] mb-4 pb-3 border-b border-[#F0EBE1]">
                Order Summary
              </h3>
              
              <div className="flex flex-col gap-3 mb-5 text-sm text-[#565959]">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({products.length} {products.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-bold text-[#0F1111]">{formatPrice(cart?.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check size={14} className="stroke-[3]" /> FREE
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-b border-[#F0EBE1] mb-5">
                <span className="text-base font-bold text-[#0F1111]">Order Total:</span>
                <span className="text-2xl font-black text-[#B12704]">
                  {formatPrice(cart?.totalPrice)}
                </span>
              </div>
              
              <button
                className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98] mb-4"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Buy ({products.length} items)
                <ArrowRight size={17} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#565959]">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>100% Safe & Secure Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
