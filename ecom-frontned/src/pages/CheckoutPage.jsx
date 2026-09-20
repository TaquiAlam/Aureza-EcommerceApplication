import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Plus, CheckCircle, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getUserAddresses, createAddress } from '../api/addressApi';
import { placeOrder } from '../api/orderApi';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [addressForm, setAddressForm] = useState({
    streetAddress: '',
    buildingName: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await getUserAddresses();
      const list = res.data || [];
      setAddresses(list);
      if (list.length > 0) {
        const saved = localStorage.getItem('selectedAddressId');
        const active = list.find(a => String(a.addressId) === String(saved)) || list[0];
        setSelectedAddressId(active.addressId);
        localStorage.setItem('selectedAddressId', active.addressId);
        window.dispatchEvent(new Event('addressUpdated'));
      }
    } catch {
      // Handle silently
    }
  };

  const handleAddressFormChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    localStorage.setItem('selectedAddressId', addressId);
    window.dispatchEvent(new Event('addressUpdated'));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await createAddress(addressForm);
      const newAddresses = [...addresses, res.data];
      setAddresses(newAddresses);
      setSelectedAddressId(res.data.addressId);
      localStorage.setItem('selectedAddressId', res.data.addressId);
      window.dispatchEvent(new Event('addressUpdated'));
      setShowAddressForm(false);
      setAddressForm({ streetAddress: '', buildingName: '', city: '', state: '', country: 'India', pincode: '' });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        pgName: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment',
        pgPaymentId: `PG_${Date.now()}`,
        pgStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
        pgResponseMessage: 'Order placed successfully',
      };

      await placeOrder(paymentMethod, orderData);
      toast.success('🎉 Order placed successfully!');
      await fetchCart();
      navigate('/order-confirm');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const products = cart?.products || [];

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in py-16 px-4">
        <div className="text-center max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#E8E2D6]">
            <CheckCircle size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">No items to checkout</h2>
          <p className="text-sm text-[#565959] mb-6">
            Your cart is empty. Add some products before proceeding to checkout.
          </p>
          <button className="btn btn-primary px-8 py-2.5 text-sm font-bold shadow-sm" onClick={() => navigate('/products')}>
            <ShoppingBag size={16} /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="mb-6 pb-3 border-b border-[#E8E2D6]">
          <h1 className="text-3xl font-extrabold text-[#0F1111] tracking-tight">Secure Checkout</h1>
          <p className="text-sm text-[#565959]">Review your delivery address and payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Step 1: Address */}
            <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF9900]"></div>
              
              <h2 className="text-lg font-bold text-[#0F1111] flex items-center gap-2.5 mb-5 pb-3 border-b border-[#F0EBE1]">
                <div className="w-7 h-7 rounded-full bg-[#FF9900]/15 text-[#B12704] font-bold flex items-center justify-center text-xs">1</div>
                <MapPin size={20} className="text-[#FF9900]" />
                Delivery Address
              </h2>

              {addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.addressId}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${selectedAddressId === addr.addressId ? 'border-[#FF9900] bg-[#FFFBF2] shadow-xs' : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'}`}
                      onClick={() => handleSelectAddress(addr.addressId)}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-sm text-[#0F1111]">{addr.buildingName || 'Home'}</span>
                        {selectedAddressId === addr.addressId && (
                          <CheckCircle size={18} className="text-[#FF9900] fill-[#FF9900]/20" />
                        )}
                      </div>
                      <p className="text-[#565959] text-xs leading-relaxed">
                        {addr.streetAddress}<br />
                        {addr.city}, {addr.state}<br />
                        {addr.country} - <span className="font-bold text-[#0F1111]">{addr.pincode}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-secondary text-xs"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                <Plus size={16} className={showAddressForm ? "rotate-45 transition-transform" : "transition-transform"} />
                {showAddressForm ? 'Cancel New Address' : 'Add New Address'}
              </button>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mt-5 pt-5 border-t border-[#F0EBE1] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">Building Name / Flat No.</label>
                    <input
                      className="input-field text-xs py-2"
                      name="buildingName"
                      value={addressForm.buildingName}
                      onChange={handleAddressFormChange}
                      placeholder="e.g. 101, Sunrise Apartments"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">Street Address</label>
                    <input
                      className="input-field text-xs py-2"
                      name="streetAddress"
                      value={addressForm.streetAddress}
                      onChange={handleAddressFormChange}
                      placeholder="e.g. Main Street, Area"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">City</label>
                    <input
                      className="input-field text-xs py-2"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressFormChange}
                      placeholder="e.g. Chandauli"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">State</label>
                    <input
                      className="input-field text-xs py-2"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressFormChange}
                      placeholder="e.g. Uttar Pradesh"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">Country</label>
                    <input
                      className="input-field text-xs py-2"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressFormChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1111] mb-1">PIN Code</label>
                    <input
                      className="input-field text-xs py-2"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressFormChange}
                      placeholder="e.g. 221008"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary text-xs"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary text-xs font-bold">
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007185]"></div>
              
              <h2 className="text-lg font-bold text-[#0F1111] flex items-center gap-2.5 mb-5 pb-3 border-b border-[#F0EBE1]">
                <div className="w-7 h-7 rounded-full bg-[#007185]/15 text-[#007185] font-bold flex items-center justify-center text-xs">2</div>
                <CreditCard size={20} className="text-[#007185]" />
                Payment Method
              </h2>
              
              <div className="flex flex-col gap-3">
                <div
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'COD' ? 'border-[#007185] bg-[#F4F9FA]' : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#007185]' : 'border-gray-400'}`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 bg-[#007185] rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F1111]">Cash on Delivery</div>
                    <div className="text-xs text-[#565959]">Pay with cash or UPI upon delivery</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'UPI' ? 'border-[#007185] bg-[#F4F9FA]' : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-[#007185]' : 'border-gray-400'}`}>
                    {paymentMethod === 'UPI' && <div className="w-2 h-2 bg-[#007185] rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F1111]">UPI Payment</div>
                    <div className="text-xs text-[#565959]">Google Pay, PhonePe, Paytm, Amazon Pay</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'CARD' ? 'border-[#007185] bg-[#F4F9FA]' : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'}`}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-[#007185]' : 'border-gray-400'}`}>
                    {paymentMethod === 'CARD' && <div className="w-2 h-2 bg-[#007185] rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F1111]">Credit / Debit Card</div>
                    <div className="text-xs text-[#565959]">Visa, Mastercard, RuPay, Corporate Cards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F1111] mb-4 pb-3 border-b border-[#F0EBE1]">Order Summary</h3>
              
              <div className="flex flex-col gap-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div className="flex justify-between items-start gap-3 text-xs" key={p.productId}>
                    <span className="text-[#0F1111] leading-snug line-clamp-2">
                      <span className="font-bold text-[#007185]">{p.quantity}x</span> {p.productName}
                    </span>
                    <span className="font-bold text-[#0F1111] whitespace-nowrap">
                      {formatPrice((p.specialPrice || p.price) * p.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2.5 mb-5 text-xs text-[#565959] pt-3 border-t border-[#F0EBE1]">
                <div className="flex justify-between items-center">
                  <span>Shipping & Handling:</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total before tax:</span>
                  <span className="font-semibold text-[#0F1111]">{formatPrice(cart?.totalPrice)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-b border-[#F0EBE1] mb-5">
                <span className="text-base font-bold text-[#0F1111]">Order Total:</span>
                <span className="text-2xl font-black text-[#B12704]">
                  {formatPrice(cart?.totalPrice)}
                </span>
              </div>
              
              <button
                className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98] mb-4 disabled:opacity-50"
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId}
              >
                {placing ? (
                  <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirm & Pay <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#565959]">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
