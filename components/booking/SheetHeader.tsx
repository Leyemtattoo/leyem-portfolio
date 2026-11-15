import { useTranslation } from "@/components/i18n/LanguageProvider";

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
  const { locale } = useTranslation();
  const backLabel = { fr: "Retour", en: "Back", de: "Zurück", es: "Atrás" }[locale];
const displayStep = Math.min(currentStep + 1, totalSteps);
const progress = (displayStep / totalSteps) * 100;
  return (
    <header className="relative z-20 shrink-0 border-b border-neutral-100 bg-white px-6 pt-3 pb-5">
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
            onPointerDown={(event) => {
              // Keep keyboard blur from moving the sheet before the click lands.
              event.preventDefault();
            }}
            onClick={onBack}
            aria-label={backLabel}
            disabled={!canGoBack}
            className={`flex min-h-11 items-center gap-1 rounded-full border border-neutral-200 px-3 text-sm text-black transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${canGoBack ? "visible" : "invisible"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{backLabel}</span>
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
