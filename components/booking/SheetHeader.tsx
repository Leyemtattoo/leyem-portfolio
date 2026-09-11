interface SheetHeaderProps {
  onClose: () => void;
  onBack: () => void;
  canGoBack: boolean;
  currentStep: number;
  totalSteps: number;
}

export default function SheetHeader({
  onClose,
  onBack,
  canGoBack,
  currentStep,
  totalSteps,
}: SheetHeaderProps) {
const displayStep = Math.min(currentStep + 1, totalSteps);
const progress = (displayStep / totalSteps) * 100;
  return (
    <header className="border-b border-neutral-100 bg-white px-6 pt-3 pb-5">
      {/* Top bar */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-2xl text-[#AAA79F] transition hover:text-black"
        >
          ×
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Question précédente"
            className={`grid h-8 w-8 place-items-center text-[#AAA79F] transition hover:text-black ${canGoBack ? "visible" : "invisible"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-sm text-[#AAA79F]">
            {displayStep} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
