import { Check } from 'lucide-react';

const STEP_LABELS = ['Travel Details', 'Flights', 'Hotel', 'Activities', 'Confirm'];

/**
 * Horizontal step progress bar.
 * @param {{ currentStep: number, totalSteps?: number, labels?: string[] }} props
 */
export default function StepProgress({ currentStep, totalSteps = 5, labels = STEP_LABELS }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-10 pt-8" role="navigation" aria-label="Booking progress">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isComplete
                      ? 'bg-[#0052ff] text-white'
                      : isActive
                      ? 'bg-[#0052ff] text-white ring-4 ring-[#0052ff]/20'
                      : 'bg-[#eceef0] text-[#434656]'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : step}
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wide whitespace-nowrap ${
                    isActive ? 'text-[#003ec7] font-semibold' : 'text-[#434656]'
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div className={`flex-1 h-[1.5px] mx-2 -mt-4 ${isComplete ? 'bg-[#0052ff]' : 'bg-[#c3c5d9]/60'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
