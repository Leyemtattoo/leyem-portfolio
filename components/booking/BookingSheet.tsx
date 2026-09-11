"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SheetHeader from "./SheetHeader";
import StepName from "./steps/NameStep";
import StepInstagram from "./steps/InstagramStep";
import EmailStep from "./steps/EmailStep";
import Placement from "./steps/Placement";
import SizeStep from "./steps/SizeStep";
import BudgetStep from "./steps/BudgetStep";
import ReferencesStep from "./steps/ReferencesStep";
import NotesStep from "./steps/NotesStep";
import SuccessStep from "./steps/SuccessStep";
import LocationStep from "./steps/LocationStep";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface BookingSheetProps {
  open: boolean;
  onClose: () => void;
  flashTitle?: string;
  capturedReference?: string;
  capturedPreview?: string;
}

type BookingForm = {
  name: string;
  instagram: string;
  email: string;
  location: string;
  placement: string;
  size: string;
  budget: string;
references: string;
  notes: string;
};

const steps: {
  field: keyof BookingForm;
  title: string;
  description: string;
  placeholder: string;
}[] = [
  {
    field: "name",
    title: "What's your name?",
    description: "Let's start with the basics.",
    placeholder: "Your name",
  },
  {
    field: "instagram",
    title: "What's your Instagram? (optional)",
    description: "Share it if you'd like me to see your work or references.",
    placeholder: "@username",
  },
  {
    field: "email",
    title: "What's your email?",
    description: "So I can get back to you about your request.",
    placeholder: "you@example.com",
  },
  {
  field: "location",
  title: "Where do you live?",
  description: "City and country.",
  placeholder: "Berlin, Germany",
},
  {
    field: "placement",
    title: "Where would you like your tattoo?",
    description: "Choose the area you'd like tattooed.",
    placeholder: "Arm, Back, Leg...",
  },
  {
    field: "size",
    title: "What size are you thinking about?",
    description: "A rough estimate is enough.",
    placeholder: "Small, Medium, Large...",
  },
  {
    field: "budget",
    title: "What's your budget?",
    description: "This helps me guide you.",
    placeholder: "€300",
  },
  {
    field: "references",
    title: "Upload your references",
    description: "You'll be able to add them soon.",
    placeholder: "Coming soon...",
  },
  {
    field: "notes",
    title: "Anything else?",
    description: "Tell me more about your idea.",
    placeholder: "Describe your project...",
  },
];

export default function BookingSheet({
  open,
  onClose,
  flashTitle,
  capturedReference,
  capturedPreview,
}: BookingSheetProps) {
 const { locale, t } = useTranslation();
 const [currentStep, setCurrentStep] = useState(0);
 const [previewOpen, setPreviewOpen] = useState(false);
 const [keyboardViewport, setKeyboardViewport] = useState<{ top: number; height: number } | null>(null);
 const activeSteps = flashTitle
   ? steps.filter(({ field }) => !["placement", "budget", "references"].includes(field))
   : steps;

const [formData, setFormData] = useState<BookingForm>({
  name: "",
  instagram: "",
  email: "",
  location: "",
  placement: "",
  size: "",
  budget: "",
  references: "",
  notes: "",
});
const placementPreview = capturedPreview ?? capturedReference;

useEffect(() => {
  if (!flashTitle) return;
  setFormData((current) => ({ ...current, references: capturedReference ?? "" }));
}, [capturedReference, flashTitle]);

useEffect(() => {
  if (!open) setPreviewOpen(false);
}, [open]);

useEffect(() => {
  if (!open) return;

  const scrollY = window.scrollY;
  const previousStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  };

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  return () => {
    document.body.style.overflow = previousStyles.overflow;
    document.body.style.position = previousStyles.position;
    document.body.style.top = previousStyles.top;
    document.body.style.width = previousStyles.width;
    window.scrollTo({ top: scrollY, behavior: "auto" });
  };
}, [open]);

useEffect(() => {
  if (!open || !window.visualViewport) return;

  const visualViewport = window.visualViewport;
  let fieldIsFocused = false;
  let blurTimer: number | undefined;

  const updateViewport = () => {
    if (!fieldIsFocused || window.innerWidth >= 768) return;
    setKeyboardViewport({
      top: visualViewport.offsetTop,
      height: visualViewport.height,
    });
  };

  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target instanceof HTMLInputElement && target.type === "file") return;
    window.clearTimeout(blurTimer);
    fieldIsFocused = true;
    updateViewport();
    window.requestAnimationFrame(updateViewport);
  };

  const handleFocusOut = () => {
    blurTimer = window.setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) return;
      fieldIsFocused = false;
      setKeyboardViewport(null);
    }, 120);
  };

  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  visualViewport.addEventListener("resize", updateViewport);
  visualViewport.addEventListener("scroll", updateViewport);

  return () => {
    window.clearTimeout(blurTimer);
    document.removeEventListener("focusin", handleFocusIn);
    document.removeEventListener("focusout", handleFocusOut);
    visualViewport.removeEventListener("resize", updateViewport);
    visualViewport.removeEventListener("scroll", updateViewport);
    setKeyboardViewport(null);
  };
}, [open]);

const isCurrentStepFilled =
  currentStep >= activeSteps.length ||
  (activeSteps[currentStep].field === "email"
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    : formData[activeSteps[currentStep].field].trim().length > 0);

const canAdvance =
  isCurrentStepFilled ||
  (currentStep < activeSteps.length && ["instagram", "notes"].includes(activeSteps[currentStep].field));

const isNotesStep =
  currentStep < activeSteps.length && activeSteps[currentStep].field === "notes";

const isArrowReady = isCurrentStepFilled || isNotesStep;

const handleSubmit = async () => {
  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, locale, flashTitle }),
    });

    const result = await response.text();

    if (!response.ok) {
      console.error(result);
      alert(result);
      return;
    }

    setCurrentStep(activeSteps.length);
  } catch (err) {
    console.error(err);
    alert(t("booking.error"));
  }
};

const advanceBooking = async () => {
  if (!canAdvance) return;

  if (currentStep === activeSteps.length) {
    onClose();
    return;
  }

  if (currentStep === activeSteps.length - 1) {
    await handleSubmit();
    return;
  }

  setCurrentStep((previousStep) =>
    Math.min(previousStep + 1, activeSteps.length)
  );
};

return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            layoutId="booking-panel"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{
              layout: {
                duration: 0.68,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            style={keyboardViewport
              ? {
                  top: keyboardViewport.top,
                  bottom: "auto",
                  height: keyboardViewport.height,
                }
              : undefined}
            className={`
              booking-sheet
              ${keyboardViewport ? "booking-sheet--keyboard" : ""}
              fixed
              bottom-0
              left-0
              right-0
              z-[210]
              flex
              h-[78vh]
              flex-col
              touch-none
              overflow-hidden
              overscroll-none
              rounded-t-[32px]
              bg-white
              text-[#AAA79F]
              shadow-2xl
              [will-change:transform,width,height,border-radius]

              md:left-1/2
              md:bottom-8
              md:h-[720px]
              md:max-h-[90vh]
              md:w-[520px]
              md:-translate-x-1/2
              md:rounded-[32px]
            `}
          >
            <SheetHeader
              onClose={onClose}
              onBack={() => setCurrentStep((previousStep) => Math.max(0, previousStep - 1))}
              canGoBack={currentStep > 0}
              currentStep={currentStep}
              totalSteps={activeSteps.length}
            />

            {/* Content */}
            <div className="booking-scroll-area flex-1 touch-none overflow-hidden overscroll-none px-6 py-8">
              <div className="mx-auto max-w-sm">
                {flashTitle && !keyboardViewport && (
                  <div className="mb-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.03] px-3 py-3 text-sm text-[#4a4844]">
                    {placementPreview && <button type="button" onClick={() => setPreviewOpen(true)} aria-label="Agrandir l’aperçu du placement" className="shrink-0 rounded-lg outline-none ring-black/20 focus-visible:ring-2"><img src={placementPreview} alt="Aperçu du placement" className="h-16 w-12 rounded-lg border border-black/10 bg-white object-cover" /></button>}
                    <div className="min-w-0">
                    <span className="text-xs uppercase tracking-[0.14em] text-[#77736b]">{t("booking.selectedFlash")}</span>
                    <p className="mt-1 font-medium text-black">{flashTitle}</p>
                    </div>
                  </div>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -32 }}
                    transition={{
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.shiftKey || event.currentTarget.querySelector("textarea") === event.target) return;
                      event.preventDefault();
                      void advanceBooking();
                    }}
                    className="booking-step-content relative will-change-transform"
                  >
{currentStep === activeSteps.length ? (
  <SuccessStep />
) : activeSteps[currentStep].field === "name" ? (
  <StepName
    value={formData.name}
    onChange={(value) =>
      setFormData({
        ...formData,
        name: value,
      })
    }
  />
) : activeSteps[currentStep].field === "instagram" ? (
  <StepInstagram
    value={formData.instagram}
    onChange={(value) =>
      setFormData({
        ...formData,
        instagram: value,
      })
    }
  />
 ) : activeSteps[currentStep].field === "email" ? (
  <EmailStep
    value={formData.email}
    onChange={(value) =>
      setFormData({
        ...formData,
        email: value,
      })
    }
  />
  ) : activeSteps[currentStep].field === "location" ? (
  <LocationStep
    value={formData.location}
    onChange={(value) =>
      setFormData({
        ...formData,
        location: value,
      })
    }
  />
) : activeSteps[currentStep].field === "placement" ? (
  <Placement
    value={formData.placement}
    onChange={(value) =>
      setFormData({
        ...formData,
        placement: value,
      })
    }
  />
) : activeSteps[currentStep].field === "size" ? (
  <SizeStep
    value={formData.size}
    onChange={(value) =>
      setFormData({
        ...formData,
        size: value,
      })
    }
  />
) : activeSteps[currentStep].field === "budget" ? (
  <BudgetStep
    value={formData.budget}
    onChange={(value) =>
      setFormData({
        ...formData,
        budget: value,
      })
    }
  />
) : activeSteps[currentStep].field === "references" ? (
  <ReferencesStep
  value={formData.references}
  onChange={(references) =>
    setFormData({
      ...formData,
      references,
    })
  }
/>
) : activeSteps[currentStep].field === "notes" ? (
  <NotesStep
    value={formData.notes}
    onSkip={() => void advanceBooking()}
    onChange={(value) =>
      setFormData({
        ...formData,
        notes: value,
      })
    }
  />
) : (
  <input
    type="text"
    value={formData[activeSteps[currentStep].field]}
    onChange={(e) =>
      setFormData({
        ...formData,
        [activeSteps[currentStep].field]: e.target.value,
      })
    }
    placeholder={activeSteps[currentStep].placeholder}
    className="
      h-14
      w-full
      rounded-2xl
      border
      border-neutral-200
      bg-white
      px-5
      text-lg
      outline-none
      transition-all
      placeholder:text-[#AAA79F]
      focus:border-black
      focus:ring-4
      focus:ring-black/5
    "
  />
)}
                    {(!isNotesStep || isCurrentStepFilled) && (
                    <motion.button
                      type="button"
                      onClick={() => void advanceBooking()}
                      disabled={!canAdvance}
                      initial={false}
                      animate={{
                        left: isArrowReady
                          ? "calc(100% - 56px)"
                          : "calc(100% - 112px)",
                      }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      aria-label={currentStep === activeSteps.length
                        ? t("booking.close")
                        : currentStep === activeSteps.length - 1
                          ? t("booking.submit")
                          : t("booking.continue")}
                      className={`booking-next-arrow absolute z-10 grid h-14 w-14 place-items-center transition-colors duration-300 active:scale-95 ${
                        currentStep < activeSteps.length && activeSteps[currentStep].field === "references"
                          ? "top-[310px]"
                          : "bottom-0"
                      } ${
                        isArrowReady
                          ? "text-[#252525]"
                          : "text-[#aaa7a0]"
                      }`}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-14 w-14"
                      >
                        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </motion.div>

          <AnimatePresence>
            {previewOpen && placementPreview && (
              <motion.div
                className="fixed inset-0 z-[240] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewOpen(false)}
              >
                <motion.img
                  src={placementPreview}
                  alt="Capture agrandie du placement"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="max-h-[88dvh] max-w-full rounded-2xl bg-white object-contain shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                />
                <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Fermer l’aperçu" className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-white text-2xl text-black shadow-lg">×</button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
