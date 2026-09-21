import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Plus,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Smartphone,
  Building2,
  Lock,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getUserAddresses, createAddress } from '../api/addressApi';
import { placeOrder } from '../api/orderApi';
import { formatPrice } from '../utils/formatPrice';
import CheckoutStepper from '../components/checkout/CheckoutStepper';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  // Wizard Step State: 1 = Address, 2 = Payment, 3 = Summary
  const [currentStep, setCurrentStep] = useState(1);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCartItems, setShowCartItems] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Mock payment fields for UPI and Card
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

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
      toast.success('Address added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address to continue.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToSummary = () => {
    if (paymentMethod === 'UPI' && upiId && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      setCurrentStep(1);
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        pgName:
          paymentMethod === 'COD'
            ? 'Cash on Delivery'
            : paymentMethod === 'UPI'
            ? 'UPI Gateway'
            : 'Credit/Debit Card Gateway',
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
  const selectedAddress = addresses.find(a => a.addressId === selectedAddressId);

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
        
        {/* Modern Interactive Checkout Stepper */}
        <CheckoutStepper
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step === 1) setCurrentStep(1);
            else if (step === 2 && selectedAddressId) setCurrentStep(2);
            else if (step === 3 && selectedAddressId) setCurrentStep(3);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Step Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* ================= STEP 1: DELIVERY ADDRESS ================= */}
            {currentStep === 1 && (
              <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 sm:p-7 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF9900]"></div>
                
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F0EBE1]">
                  <h2 className="text-xl font-bold text-[#0F1111] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#FF9900]/15 text-[#B12704] font-bold flex items-center justify-center text-xs">1</div>
                    <MapPin size={20} className="text-[#FF9900]" />
                    Select Delivery Address
                  </h2>
                  <span className="text-xs font-semibold text-[#565959] hidden sm:inline">
                    Step 1 of 3
                  </span>
                </div>

                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      return (
                        <div
                          key={addr.addressId}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 relative ${
                            isSelected
                              ? 'border-[#FF9900] bg-[#FFFBF2] shadow-sm'
                              : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'
                          }`}
                          onClick={() => handleSelectAddress(addr.addressId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0F1111]">
                                {addr.buildingName || 'Home Address'}
                              </span>
                              {isSelected && (
                                <span className="bg-[#FF9900] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-[#FF9900] bg-[#FF9900]' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[#565959] text-xs leading-relaxed">
                            {addr.streetAddress}<br />
                            {addr.city}, {addr.state}<br />
                            {addr.country} - <span className="font-bold text-[#0F1111]">{addr.pincode}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-center">
                    <p className="text-sm font-semibold text-amber-900 mb-1">No saved addresses found</p>
                    <p className="text-xs text-amber-700">Please add your shipping address below to proceed with the order.</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <button
                    className="btn btn-secondary text-xs flex items-center gap-1.5"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    <Plus size={16} className={showAddressForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
                    {showAddressForm ? 'Cancel New Address' : 'Add New Address'}
                  </button>

                  {/* Toggle Cart Review inside Step 1 */}
                  <button
                    type="button"
                    onClick={() => setShowCartItems(!showCartItems)}
                    className="text-xs font-semibold text-[#007185] hover:underline flex items-center gap-1"
                  >
                    {showCartItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showCartItems ? 'Hide Cart Items' : `Review Cart Items (${products.length})`}
                  </button>
                </div>

                {/* Collapsible Cart Preview in Step 1 */}
                {showCartItems && (
                  <div className="mb-6 p-4 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-[#0F1111] uppercase tracking-wider mb-3">Items in this shipment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                      {products.map((p) => (
                        <div key={p.productId} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200">
                          <img
                            src={p.image?.startsWith('http') ? p.image : `/images/${p.image}`}
                            alt={p.productName}
                            className="w-12 h-12 object-contain bg-[#FAF7F2] rounded border border-gray-200 p-1 shrink-0"
                            onError={(e) => { e.target.src = 'https://picsum.photos/seed/fallback/100/100'; }}
                          />
                          <div className="overflow-hidden text-xs">
                            <p className="font-semibold text-[#0F1111] truncate">{p.productName}</p>
                            <p className="text-gray-500">Qty: {p.quantity} × {formatPrice(p.specialPrice || p.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="mb-6 pt-5 border-t border-[#F0EBE1] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200 bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E8E2D6]">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#0F1111] mb-1">Building Name / Flat No.</label>
                      <input
                        className="input-field text-xs py-2 bg-white"
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
                        className="input-field text-xs py-2 bg-white"
                        name="streetAddress"
                        value={addressForm.streetAddress}
                        onChange={handleAddressFormChange}
                        placeholder="e.g. Main Market Road, Near City Mall"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1111] mb-1">City</label>
                      <input
                        className="input-field text-xs py-2 bg-white"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressFormChange}
                        placeholder="e.g. Varanasi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1111] mb-1">State</label>
                      <input
                        className="input-field text-xs py-2 bg-white"
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
                        className="input-field text-xs py-2 bg-white"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1111] mb-1">PIN Code</label>
                      <input
                        className="input-field text-xs py-2 bg-white"
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

                {/* Continue Action */}
                <div className="pt-4 border-t border-[#F0EBE1] flex justify-end">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full sm:w-auto px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    Deliver to this Address & Continue
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: PAYMENT GATEWAY SELECTION ================= */}
            {currentStep === 2 && (
              <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 sm:p-7 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007185]"></div>
                
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F0EBE1]">
                  <h2 className="text-xl font-bold text-[#0F1111] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#007185]/15 text-[#007185] font-bold flex items-center justify-center text-xs">2</div>
                    <CreditCard size={20} className="text-[#007185]" />
                    Select Payment Gateway
                  </h2>
                  <span className="text-xs font-semibold text-[#565959] hidden sm:inline">
                    Step 2 of 3
                  </span>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                  
                  {/* Option 1: Cash on Delivery */}
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'COD'
                        ? 'border-[#007185] bg-[#F4F9FA] shadow-xs'
                        : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'COD' ? 'border-[#007185] bg-[#007185]' : 'border-gray-400'}`}>
                        {paymentMethod === 'COD' && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-sm text-[#0F1111] flex items-center gap-2">
                            <Truck size={17} className="text-[#007185]" />
                            Cash on Delivery (COD)
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Zero Advance Required
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">
                          Pay with cash or scan QR upon delivery at your doorstep.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: UPI */}
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'UPI'
                        ? 'border-[#007185] bg-[#F4F9FA] shadow-xs'
                        : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'UPI' ? 'border-[#007185] bg-[#007185]' : 'border-gray-400'}`}>
                        {paymentMethod === 'UPI' && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-sm text-[#0F1111] flex items-center gap-2">
                            <Smartphone size={17} className="text-[#007185]" />
                            UPI Payment (Fast & Secure)
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Google Pay / PhonePe / Paytm / BHIM
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">
                          Instant payment using any UPI app with zero transaction charges.
                        </p>

                        {paymentMethod === 'UPI' && (
                          <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Enter Virtual Payment Address (UPI ID)
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. mobileNumber@upi or username@okaxis"
                              className="input-field text-xs py-2 bg-white max-w-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Credit / Debit Card */}
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'CARD'
                        ? 'border-[#007185] bg-[#F4F9FA] shadow-xs'
                        : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'CARD' ? 'border-[#007185] bg-[#007185]' : 'border-gray-400'}`}>
                        {paymentMethod === 'CARD' && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-sm text-[#0F1111] flex items-center gap-2">
                            <CreditCard size={17} className="text-[#007185]" />
                            Credit / Debit Cards
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500">
                            Visa, MasterCard, RuPay, Maestro
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">
                          All Indian and International cards accepted with 256-bit SSL encryption.
                        </p>

                        {paymentMethod === 'CARD' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Card Number</label>
                              <input
                                type="text"
                                maxLength="19"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={cardDetails.cardNumber}
                                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                                className="input-field text-xs py-2 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Expiry Date</label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                maxLength="5"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                className="input-field text-xs py-2 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">CVV / CVC</label>
                              <input
                                type="password"
                                maxLength="4"
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                className="input-field text-xs py-2 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 4: Net Banking */}
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-[#007185] bg-[#F4F9FA] shadow-xs'
                        : 'border-gray-200 bg-[#FAF7F2] hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('NETBANKING')}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'NETBANKING' ? 'border-[#007185] bg-[#007185]' : 'border-gray-400'}`}>
                        {paymentMethod === 'NETBANKING' && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm text-[#0F1111] flex items-center gap-2">
                          <Building2 size={17} className="text-[#007185]" />
                          Net Banking
                        </span>
                        <p className="text-xs text-[#565959] mt-1">
                          Direct bank transfer from SBI, HDFC, ICICI, Axis and 50+ other banks.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Step 2 Actions */}
                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Back to Address
                  </button>

                  <button
                    onClick={handleProceedToSummary}
                    className="px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    Proceed to Order Summary
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ORDER SUMMARY & REVIEW ================= */}
            {currentStep === 3 && (
              <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 sm:p-7 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
                
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F0EBE1]">
                  <h2 className="text-xl font-bold text-[#0F1111] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">3</div>
                    <CheckCircle size={20} className="text-emerald-600" />
                    Review Your Order Summary
                  </h2>
                  <span className="text-xs font-semibold text-[#565959] hidden sm:inline">
                    Final Step
                  </span>
                </div>

                {/* Review Cards: Address & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  
                  {/* Delivery Address Review */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#0F1111] flex items-center gap-1.5">
                        <MapPin size={15} className="text-[#FF9900]" /> Delivering To
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-[11px] font-bold text-[#007185] hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={11} /> Change
                      </button>
                    </div>
                    {selectedAddress ? (
                      <p className="text-xs text-[#565959] leading-relaxed">
                        <strong className="text-[#0F1111]">{selectedAddress.buildingName || 'Home'}</strong><br />
                        {selectedAddress.streetAddress}, {selectedAddress.city}<br />
                        {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.pincode}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">No address selected</p>
                    )}
                  </div>

                  {/* Payment Mode Review */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#0F1111] flex items-center gap-1.5">
                        <CreditCard size={15} className="text-[#007185]" /> Payment Mode
                      </span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-[11px] font-bold text-[#007185] hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={11} /> Change
                      </button>
                    </div>
                    <p className="text-xs text-[#0F1111] font-bold">
                      {paymentMethod === 'COD' && 'Cash on Delivery (COD)'}
                      {paymentMethod === 'UPI' && (upiId ? `UPI Payment (${upiId})` : 'UPI Payment')}
                      {paymentMethod === 'CARD' && 'Credit / Debit Card'}
                      {paymentMethod === 'NETBANKING' && 'Net Banking'}
                    </p>
                    <p className="text-[11px] text-[#565959] mt-1">
                      {paymentMethod === 'COD' ? 'Pay cash/UPI at doorstep' : 'Payment processed securely upon order'}
                    </p>
                  </div>
                </div>

                {/* Items in this shipment */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wider mb-3">
                    Items in your order ({products.length})
                  </h3>
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                    {products.map((p) => {
                      const img = p.image?.startsWith('http') ? p.image : `/images/${p.image}`;
                      return (
                        <div key={p.productId} className="flex items-center justify-between gap-4 p-3 bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt={p.productName}
                              className="w-14 h-14 object-contain bg-white rounded-lg border border-gray-200 p-1 shrink-0"
                              onError={(e) => { e.target.src = 'https://picsum.photos/seed/fallback/100/100'; }}
                            />
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-[#0F1111] line-clamp-1">{p.productName}</p>
                              <p className="text-xs text-gray-500">
                                Quantity: <span className="font-semibold text-gray-800">{p.quantity}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-sm text-[#0F1111]">
                              {formatPrice((p.specialPrice || p.price) * p.quantity)}
                            </span>
                            {p.specialPrice && p.price > p.specialPrice && (
                              <p className="text-[10px] text-gray-400 line-through">
                                {formatPrice(p.price * p.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Back to Payment
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || !selectedAddressId}
                    className="px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {placing ? (
                      <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Lock size={16} />
                        Confirm & Place Order ({formatPrice(cart?.totalPrice)})
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Sticky Price Details Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0F1111] mb-4 pb-3 border-b border-[#F0EBE1] flex items-center justify-between">
                <span>Price Details</span>
                <span className="text-xs text-gray-500 font-normal">({products.length} items)</span>
              </h3>
              
              <div className="flex flex-col gap-3 mb-5 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div className="flex justify-between items-start gap-3 text-xs" key={p.productId}>
                    <span className="text-[#0F1111] leading-snug line-clamp-1">
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
                  <span>Shipping & Delivery:</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#0F1111]">{formatPrice(cart?.totalPrice)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-b border-[#F0EBE1] mb-5">
                <span className="text-base font-bold text-[#0F1111]">Total Payable:</span>
                <span className="text-2xl font-black text-[#B12704]">
                  {formatPrice(cart?.totalPrice)}
                </span>
              </div>
              
              {/* Primary Action Button Based on Current Step */}
              {currentStep === 1 && (
                <button
                  className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98] mb-4"
                  onClick={handleProceedToPayment}
                >
                  Continue to Payment <ArrowRight size={17} />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98] mb-4"
                  onClick={handleProceedToSummary}
                >
                  Proceed to Summary <ArrowRight size={17} />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98] mb-4 disabled:opacity-50"
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddressId}
                >
                  {placing ? (
                    <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={16} /> Place Order & Pay
                    </>
                  )}
                </button>
              )}

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
