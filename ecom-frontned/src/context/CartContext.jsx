import { createContext, useState, useCallback, useContext } from 'react';
import { getUserCart, addToCart as addToCartApi, updateCartItemQuantity, removeFromCart as removeFromCartApi } from '../api/cartApi';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    try {
      const res = await getUserCart();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      const res = await addToCartApi(productId, quantity);
      setCart(res.data);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (productId, operation) => {
    const item = cart?.products?.find((p) => p.productId === productId);
    if (operation === 'add' && item && item.productQuantity !== undefined && item.quantity >= item.productQuantity) {
      toast.error(`Cannot add more. Only ${item.productQuantity} in stock.`);
      return;
    }
    try {
      const res = await updateCartItemQuantity(productId, operation);
      setCart(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    if (!cart) return;
    try {
      await removeFromCartApi(cart.cartId, productId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const cartItemCount = cart?.products?.length || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, fetchCart, addToCart, updateQuantity, removeItem, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
}
