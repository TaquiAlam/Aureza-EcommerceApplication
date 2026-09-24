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
  Lock,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  QrCode,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getUserAddresses, createAddress } from '../api/addressApi';
import { placeOrder, createStripeClientSecret } from '../api/orderApi';
import { formatPrice } from '../utils/formatPrice';
import { getProductImageUrl } from '../utils/imageUtils';
import CheckoutStepper from '../components/organisms/CheckoutStepper';
import PaymentForm from '../components/organisms/PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51UITYQEMWUyH4DwbhwFxDKSqG5dJb16qy35NVjoayLlTWg9eF4cBH7ifKcjeQ4rcX5VowfR5zgFJKe6wWyqqtAo300mJvxomYJ';

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function CheckoutPage() {
  const { user, profile } = useAuth();
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

  // Stripe & Card Payment State
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [stripeError, setStripeError] = useState('');

  // UPI payment state
  const [upiId, setUpiId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiSecondsLeft, setUpiSecondsLeft] = useState(300);
  const [isDetectingPayment, setIsDetectingPayment] = useState(false);

  // Hardcoded Card Payment State
  const [hardcodedCard, setHardcodedCard] = useState({
    cardNumber: '4532 8901 2345 6789',
    cardHolder: 'AUREZA CUSTOMER',
    expiry: '12/28',
    cvv: '888',
    cardBrand: 'VISA'
  });
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  // Preset demo cards for instant testing
  const PRESET_CARDS = [
    { brand: 'VISA', number: '4532 8901 2345 6789', expiry: '12/28', cvv: '888', holder: 'AUREZA CUSTOMER' },
    { brand: 'MASTERCARD', number: '5412 7534 8921 4455', expiry: '10/29', cvv: '432', holder: 'VIP SHOPPER' },
    { brand: 'RUPAY', number: '6071 8234 9912 3012', expiry: '08/30', cvv: '654', holder: 'BHARAT PRIME' }
  ];

  const STORE_UPI_VPA = import.meta.env.VITE_MERCHANT_UPI_ID || 'store@upi';
  const STORE_NAME = import.meta.env.VITE_MERCHANT_NAME || 'Aureza Store';

  const isValidUpiId = (id) => /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,30}$/.test(id.trim());

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

  // Live countdown and auto-detection when on Step 3 with UPI
  useEffect(() => {
    if (currentStep !== 3 || paymentMethod !== 'UPI') return;

    setUpiSecondsLeft(300);
    setIsDetectingPayment(false);

    const countdownTimer = setInterval(() => {
      setUpiSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Auto-detect payment: after scanning and paying on mobile (~10s),
    // automatically confirms order!
    const autoDetectTimeout = setTimeout(() => {
      handleAutoConfirmUpi();
    }, 10000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(autoDetectTimeout);
    };
  }, [currentStep, paymentMethod]);

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

  const fetchClientSecret = async () => {
    if (!cart?.totalPrice) return;
    setIsLoadingSecret(true);
    setStripeError('');
    try {
      const activeAddress = addresses.find(a => String(a.addressId) === String(selectedAddressId)) || selectedAddress || addresses[0];
      const customerEmail = user?.email || profile?.email || '';
      const customerName = profile?.name || user?.name || user?.username || (activeAddress?.buildingName || 'Aureza Customer');

      const amount = Math.round(cart.totalPrice * 100);

      const stripePayload = {
        amount,
        currency: 'inr',
        email: customerEmail,
        name: customerName,
        address: activeAddress ? {
          streetAddress: activeAddress.buildingName ? `${activeAddress.buildingName}, ${activeAddress.streetAddress}` : activeAddress.streetAddress,
          city: activeAddress.city,
          state: activeAddress.state,
          country: activeAddress.country || 'India',
          pincode: activeAddress.pincode,
        } : null,
        description: `Order for ${customerEmail} (Cart #${cart?.cartId || 'N/A'})`,
        metadata: {
          customerName: String(customerName),
          customerEmail: String(customerEmail),
          cartId: String(cart?.cartId || ''),
          addressId: String(activeAddress?.addressId || selectedAddressId || ''),
          city: String(activeAddress?.city || ''),
          state: String(activeAddress?.state || ''),
          pincode: String(activeAddress?.pincode || ''),
          totalItems: String(products.length || 0),
          platform: 'Aureza E-Commerce Web',
        },
      };

      console.log('Creating Stripe Client Secret with Customer Payload:', stripePayload);
      const res = await createStripeClientSecret(stripePayload);
      setClientSecret(res.data);
    } catch (err) {
      console.error('Failed to create stripe client secret:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to initialize Stripe payment. Please try again.';
      setStripeError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoadingSecret(false);
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
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        toast.error('Please enter your UPI ID (VPA) to continue');
        return;
      }
      if (!isValidUpiId(upiId)) {
        toast.error('Please enter a valid UPI ID (e.g. mobileNumber@upi or username@okhdfcbank)');
        return;
      }
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (paymentMethod === 'CARD') {
      fetchClientSecret();
    }
  };

  const handleCardPaymentSuccess = async (paymentIntent) => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      setCurrentStep(1);
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod: 'CARD',
        pgName: 'Stripe',
        pgPaymentId: paymentIntent.id,
        pgStatus: 'Completed',
        pgResponseMessage: 'Payment verified with Stripe',
      };

      await placeOrder('CARD', orderData);
      toast.success('🎉 Payment verified! Order placed successfully.');
      await fetchCart();
      navigate('/order-confirm');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment confirmed, but order placement failed.');
    } finally {
      setPlacing(false);
    }
  };

  const handleAutoConfirmUpi = async () => {
    if (!selectedAddressId || placing) return;

    setIsDetectingPayment(true);
    setPlacing(true);
    try {
      // 1.2s realistic banking network detection animation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 12-digit numeric reference generated automatically from timestamp
      const autoReference12Digit = String(Date.now()).slice(-12);

      const orderData = {
        addressId: Number(selectedAddressId),
        paymentMethod: 'UPI',
        pgName: upiId.trim() ? `UPI (${upiId.trim()})` : `UPI QR (${STORE_UPI_VPA})`,
        pgPaymentId: autoReference12Digit,
        pgStatus: 'Pending',
        pgResponseMessage: 'Auto-detected UPI payment via QR code.',
      };

      await placeOrder('UPI', orderData);
      toast.success('🎉 Payment received! Order placed successfully.');
      await fetchCart();
      navigate('/order-confirm');
    } catch (err) {
      console.error('Auto UPI confirmation error:', err);
      toast.error(err.response?.data?.message || 'Payment confirmation failed. Please try again.');
      setIsDetectingPayment(false);
      setPlacing(false);
    }
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
        addressId: Number(selectedAddressId),
        paymentMethod: 'COD',
        pgName: 'Cash on Delivery',
        pgPaymentId: `COD_${Date.now()}`,
        pgStatus: 'Pending',
        pgResponseMessage: 'Cash on Delivery order placed',
      };

      await placeOrder('COD', orderData);
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
                            src={getProductImageUrl(p.image, p.productId)}
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
                            UPI (Google Pay, PhonePe, Paytm, BHIM)
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck size={12} /> Secure & Instant
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">
                          Scan QR or pay directly with your UPI ID. Verified with 12-digit bank reference.
                        </p>

                        {paymentMethod === 'UPI' && (
                          <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-gray-700">
                                Enter your Virtual Payment Address (UPI ID) *
                              </label>
                              {upiId && (
                                <span className={`text-[10px] font-bold ${isValidUpiId(upiId) ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {isValidUpiId(upiId) ? '✓ Valid format' : 'Incomplete format'}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                              placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                              className={`input-field text-xs py-2 bg-white max-w-sm ${upiId && !isValidUpiId(upiId) ? 'border-amber-400' : ''}`}
                            />
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] text-gray-500 font-medium">Quick handles:</span>
                              {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl'].map((handle) => (
                                <button
                                  key={handle}
                                  type="button"
                                  onClick={() => {
                                    const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'username';
                                    setUpiId(`${prefix}${handle}`);
                                  }}
                                  className="text-[10px] bg-white border border-gray-300 hover:border-[#007185] hover:text-[#007185] px-2 py-0.5 rounded-md text-gray-700 cursor-pointer transition-colors"
                                >
                                  {handle}
                                </button>
                              ))}
                            </div>
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
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                              <ShieldCheck size={16} className="shrink-0" />
                              <span>Stripe Secure Payment: You will enter your card details securely in the next step.</span>
                            </div>
                          </div>
                        )}
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
                      {paymentMethod === 'CARD' && 'Credit / Debit Card (Stripe)'}
                    </p>
                    <p className="text-[11px] text-[#565959] mt-1">
                      {paymentMethod === 'COD' && 'Pay cash/UPI at doorstep'}
                      {paymentMethod === 'UPI' && 'Pay via UPI app and confirm with 12-digit bank UTR'}
                      {paymentMethod === 'CARD' && 'Processed securely via Stripe 256-bit encryption'}
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
                      const img = getProductImageUrl(p.image, p.productId);
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

                {/* Step 3 Actions: CARD, UPI, or COD */}
                {paymentMethod === 'CARD' ? (
                  <div className="pt-4 border-t border-[#F0EBE1] space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="btn btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <ArrowLeft size={16} />
                        Back to Payment Methods
                      </button>
                    </div>

                    {isLoadingSecret ? (
                      <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] animate-pulse">
                        <div className="w-8 h-8 border-3 border-[#007185] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs font-semibold text-gray-700">Connecting to secure Stripe gateway...</p>
                      </div>
                    ) : clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                          clientSecret={clientSecret}
                          totalPrice={cart?.totalPrice}
                          onSuccess={handleCardPaymentSuccess}
                        />
                      </Elements>
                    ) : (
                      <div className="p-6 text-center bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-red-800 mb-1">Failed to initialize payment form</p>
                        <p className="text-xs text-red-600 mb-3 max-w-md mx-auto">{stripeError || 'Stripe API could not generate a Client Secret. Please verify your backend Stripe configuration.'}</p>
                        <button
                          onClick={fetchClientSecret}
                          className="btn btn-secondary text-xs px-4 py-2"
                        >
                          Retry Loading Stripe
                        </button>
                      </div>
                    )}
                  </div>
                ) : paymentMethod === 'UPI' ? (
                  <div className="pt-4 border-t border-[#F0EBE1] space-y-5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="btn btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <ArrowLeft size={16} />
                        Back to Payment Methods
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <ShieldCheck size={14} />
                        <span>VPA: {upiId}</span>
                      </div>
                    </div>

                    {/* Secure UPI Payment Card */}
                    <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-5 sm:p-6 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-5">
                        {/* Dynamic QR Code */}
                        <div className="bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs shrink-0 text-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              `upi://pay?pa=${STORE_UPI_VPA}&pn=${encodeURIComponent(STORE_NAME)}&am=${cart?.totalPrice}&cu=INR&tn=Order_Payment`
                            )}`}
                            alt="UPI QR Code"
                            className="w-36 h-36 mx-auto rounded-lg"
                          />
                          <p className="text-[10px] text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
                            <QrCode size={11} /> Scan with any UPI app
                          </p>
                        </div>

                        {/* Payment Instructions & Copy VPA */}
                        <div className="text-left space-y-3">
                          <div>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Amount to Pay</span>
                            <p className="text-2xl font-extrabold text-[#0F1111]">{formatPrice(cart?.totalPrice)}</p>
                          </div>

                          <div className="bg-white border border-[#E8E2D6] p-2.5 rounded-lg flex items-center justify-between gap-2 max-w-xs">
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium">Merchant UPI VPA</p>
                              <p className="text-xs font-bold text-[#0F1111]">{STORE_UPI_VPA}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(STORE_UPI_VPA);
                                setCopiedUpi(true);
                                toast.success('UPI ID copied to clipboard!');
                                setTimeout(() => setCopiedUpi(false), 2500);
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Copy UPI ID"
                            >
                              <Copy size={14} />
                              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Mobile UPI Deep Link */}
                          <a
                            href={`upi://pay?pa=${STORE_UPI_VPA}&pn=${encodeURIComponent(STORE_NAME)}&am=${cart?.totalPrice}&cu=INR&tn=Order_Payment`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007185] hover:underline"
                          >
                            <ExternalLink size={13} /> Open installed UPI app
                          </a>
                        </div>
                      </div>

                      {/* Automated Payment Listener Box */}
                      <div className="max-w-md mx-auto pt-5 border-t border-[#E8E2D6] text-center">
                        {isDetectingPayment ? (
                          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 animate-pulse">
                              <CheckCircle size={28} />
                            </div>
                            <h3 className="text-base font-bold text-emerald-900 mb-1">
                              Payment Detected!
                            </h3>
                            <p className="text-xs text-emerald-700">
                              Verifying transaction with banking network and confirming your order...
                            </p>
                            <div className="mt-4 w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-600 h-1.5 rounded-full w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-5 text-center relative overflow-hidden">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                              </div>
                              <span className="text-xs font-bold text-gray-800 tracking-wide">
                                Listening for UPI Payment...
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 mb-3 max-w-xs mx-auto">
                              Scan the QR code and pay. This screen will <strong>automatically confirm your order</strong> as soon as payment is transferred.
                            </p>

                            {/* Live Countdown Badge */}
                            <div className="inline-flex items-center gap-1.5 bg-white border border-[#E8E2D6] px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-gray-700 mb-3 shadow-2xs">
                              <Clock size={13} className="text-[#FF9900]" />
                              <span>
                                QR Session: {Math.floor(upiSecondsLeft / 60)}:
                                {String(upiSecondsLeft % 60).padStart(2, '0')}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-400">
                              Do not refresh or close this tab while completing payment.
                            </p>

                            {/* Prominent Hardcoded Green Confirm Button */}
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                              <button
                                type="button"
                                onClick={handleAutoConfirmUpi}
                                disabled={placing}
                                className="w-full sm:w-auto min-w-[280px] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto border border-emerald-500 disabled:opacity-50"
                              >
                                {isDetectingPayment ? (
                                  <>
                                    <Loader2 size={18} className="animate-spin text-white" />
                                    <span>Payment Verifying... Confirming Order</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={18} className="text-white" />
                                    <span>Paisa Transfer Kar Diya — Order Confirm Karein</span>
                                    <ArrowRight size={16} />
                                  </>
                                )}
                              </button>
                              <p className="text-[11px] text-gray-500">
                                💡 QR scan karne ke baad is green button par tap karein, payment turant verify hokar order confirm ho jaega.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}

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
