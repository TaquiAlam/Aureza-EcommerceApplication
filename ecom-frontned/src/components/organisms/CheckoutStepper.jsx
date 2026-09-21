import { MapPin, CreditCard, ClipboardCheck, CheckCircle2, Check } from 'lucide-react';

export default function CheckoutStepper({ currentStep = 1, onStepClick }) {
  const steps = [
    {
      id: 1,
      title: 'Address',
      subtitle: 'Delivery details',
      icon: MapPin,
    },
    {
      id: 2,
      title: 'Payment',
      subtitle: 'Payment gateway',
      icon: CreditCard,
    },
    {
      id: 3,
      title: 'Order Summary',
      subtitle: 'Review & verify',
      icon: ClipboardCheck,
    },
    {
      id: 4,
      title: 'Confirmation',
      subtitle: 'Order confirmed',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full bg-white border border-[#E8E2D6] rounded-2xl p-4 sm:p-6 mb-8 shadow-xs">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center justify-between">
          
          {/* Progress Connecting Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0 hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-[#FF9900] via-[#007185] to-emerald-600 transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${((Math.min(currentStep, 4) - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isPending = currentStep < step.id;
            const Icon = step.icon;

            const canClick = isCompleted && onStepClick;

            return (
              <div
                key={step.id}
                onClick={() => canClick && onStepClick(step.id)}
                className={`relative z-10 flex flex-col items-center flex-1 transition-all ${
                  canClick ? 'cursor-pointer group' : ''
                }`}
              >
                {/* Circle Badge */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 group-hover:scale-105'
                      : isCurrent
                      ? 'bg-[#FF9900] text-white ring-4 ring-[#FF9900]/25 shadow-md scale-110'
                      : 'bg-[#FAF7F2] text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} className="stroke-[3]" />
                  ) : (
                    <Icon size={18} className={isCurrent ? 'animate-pulse' : ''} />
                  )}
                </div>

                {/* Step Labels */}
                <div className="text-center mt-2.5">
                  <p
                    className={`text-xs sm:text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                        ? 'text-[#0F1111]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-[10px] sm:text-[11px] hidden md:block transition-colors ${
                      isCurrent ? 'text-[#FF9900] font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
