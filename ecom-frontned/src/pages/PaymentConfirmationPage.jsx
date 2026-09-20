import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white border border-[#E8E2D6] rounded-2xl shadow-lg p-10 text-center relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-green-500/10 blur-[60px] -z-10 rounded-full pointer-events-none"></div>

        <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow border border-green-200">
          <CheckCircle size={56} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#0F1111] mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          Thank you for your purchase. Your payment was successful, and we are now processing your order.
        </p>

        <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl p-6 mb-8 text-left">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-[#E8E2D6] pb-2">What's Next?</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Package size={20} className="text-[#E47911] shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">You will receive an order confirmation email with details of your order.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold rounded-lg border border-[#FCD200] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            Continue Shopping
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}