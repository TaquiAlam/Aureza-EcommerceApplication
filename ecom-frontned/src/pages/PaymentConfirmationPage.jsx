import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag, ShoppingCart } from 'lucide-react';
import CheckoutStepper from '../components/checkout/CheckoutStepper';

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="py-8 animate-in fade-in duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Step 4: Complete Stepper Header */}
        <CheckoutStepper currentStep={4} />

        <div className="max-w-xl mx-auto bg-white border border-[#E8E2D6] rounded-2xl shadow-md p-6 sm:p-10 text-center relative overflow-hidden">
          
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-[60px] -z-10 rounded-full pointer-events-none"></div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50 border border-emerald-200">
            <CheckCircle size={52} className="text-emerald-600" />
          </div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
            Payment & Order Successful
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1111] mb-2 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-8 text-xs sm:text-sm leading-relaxed">
            Thank you for shopping with Aureza.in! Your order has been placed successfully and is now being prepared for shipping.
          </p>

          <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl p-5 sm:p-6 mb-8 text-left">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-[#E8E2D6] pb-2">
              What Happens Next?
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <Package size={18} className="text-[#FF9900] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  You will receive an order confirmation email and SMS with shipment tracking details.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Our delivery executive will contact you when your order is out for delivery.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="w-full sm:w-auto px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm rounded-lg border border-[#FCD200] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full sm:w-auto px-6 py-3 btn btn-secondary text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <ShoppingCart size={17} />
              View Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}