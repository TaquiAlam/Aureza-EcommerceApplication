import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';

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
        <div className="text-center max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#E8E2D6]">
            <ShoppingBag size={36} className="text-[#FF9900]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Sign in to view your cart</h2>
          <p className="text-sm text-[#565959] mb-6">
            Please sign in to see items you've added previously, manage quantities, and proceed to checkout.
          </p>
          <Link to="/login" className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-sm">
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#FF9900]/30 border-t-[#FF9900] rounded-full animate-spin"></div>
      </div>
    );
  }

  const products = cart?.products || [];

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in py-16 px-4">
        <div className="text-center max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#E8E2D6]">
            <ShoppingBag size={36} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Your Shopping Cart is empty</h2>
          <p className="text-sm text-[#565959] mb-6">
            Your shopping cart is waiting for you. Explore our collection and find great deals today!
          </p>
          <Link to="/products" className="btn btn-primary px-8 py-2.5 text-sm font-bold shadow-sm">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
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
            {products.map((product) => {
              const isMaxStockReached =
                product.productQuantity !== undefined &&
                product.productQuantity !== null &&
                product.quantity >= product.productQuantity;

              const imageUrl = product.image
                ? (product.image.startsWith('http') ? product.image : `/images/${product.image}`)
                : `https://picsum.photos/seed/${product.productId}/200/200`;

              return (
                <div 
                  key={product.productId} 
                  className="bg-white border border-[#E8E2D6] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:border-gray-300 transition-colors"
                >
                  <div className="w-full sm:w-32 h-32 rounded-lg bg-[#FAF7F2] border border-[#F0EBE1] overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                    <img
                      className="max-w-full max-h-full object-contain"
                      src={imageUrl}
                      alt={product.productName}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.productId}/200/200`; }}
                    />
                  </div>
                  
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

                    {/* Max Stock Warning Banner if reached */}
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
                      <div className="flex items-center bg-[#F0F2F2] border border-[#D5D9D9] rounded-lg overflow-hidden shadow-xs">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-[#0F1111] hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() => updateQuantity(product.productId, 'delete')}
                          disabled={product.quantity <= 1}
                          title="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center font-bold text-xs text-[#0F1111] bg-white border-x border-[#D5D9D9]">
                          {product.quantity}
                        </span>
                        <button
                          className={`w-8 h-8 flex items-center justify-center transition-colors ${
                            isMaxStockReached
                              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                              : 'text-[#0F1111] hover:bg-gray-200 cursor-pointer'
                          }`}
                          onClick={() => updateQuantity(product.productId, 'add')}
                          disabled={isMaxStockReached}
                          title={isMaxStockReached ? `Cannot add more. Max stock (${product.productQuantity}) reached` : 'Increase quantity'}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        onClick={() => removeItem(product.productId)}
                        title="Delete from cart"
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
