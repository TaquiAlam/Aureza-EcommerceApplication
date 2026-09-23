import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const PaymentForm = ({ clientSecret, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Trigger validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Payment form validation failed');
      setIsProcessing(false);
      return;
    }

    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

    try {
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${frontendUrl}/order-confirm`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        if (onSuccess) {
          await onSuccess(result.paymentIntent);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during payment');
      setIsProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
  };

  const isLoading = !clientSecret || !stripe || !elements;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-5 sm:p-6 bg-white border border-[#E8E2D6] rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#007185]/10 text-[#007185] flex items-center justify-center font-bold">
            <Lock size={16} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F1111]">Payment Information</h2>
            <p className="text-[11px] text-gray-500">256-bit SSL encrypted Stripe payment</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <ShieldCheck size={14} />
          <span>PCI Compliant</span>
        </div>
      </div>

      {isLoading ? (
        /* Modern Tailwind Skeleton Loader without external MUI dependency */
        <div className="space-y-4 py-2 animate-pulse">
          <div className="flex gap-2">
            <div className="h-10 bg-gray-100 rounded-lg flex-1"></div>
            <div className="h-10 bg-gray-100 rounded-lg flex-1"></div>
          </div>
          <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 bg-gray-100 rounded-lg"></div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-11 bg-gray-200 rounded-lg w-full mt-4"></div>
        </div>
      ) : (
        <>
          {clientSecret && (
            <div className="mb-4">
              <PaymentElement id="payment-element" options={paymentElementOptions} />
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 my-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isLoading || isProcessing}
            className="w-full mt-4 px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] active:scale-[0.99] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin text-gray-800" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>
                  Pay {totalPrice != null ? formatPrice(totalPrice) : 'Now'}
                </span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-500 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            Guaranteed safe & secure checkout powered by Stripe
          </p>
        </>
      )}
    </form>
  );
};

export default PaymentForm;
