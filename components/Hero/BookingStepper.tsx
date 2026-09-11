"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepName from "../booking/steps/NameStep";
import Progress from "@/components/ui/Progress";

export default function BookingStepper() {
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    placement: "",
    size: "",
    budget: "",
    notes: "",
  });

  return (
    <div className="mt-16 flex h-full flex-col">

      {/* Progress */}
     {/* Progress */}
<div className="mb-10">
  <Progress
  currentStep={step}
  totalSteps={7}
/>
</div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
        >
          {step === 0 && (
            <StepName
              value={formData.name}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto flex justify-between">

        <button
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          className="rounded-full border border-neutral-300 px-6 py-3 disabled:opacity-30"
        >
          Back
        </button>

        <button
          disabled={step === 0 && formData.name.trim() === ""}
          onClick={() => setStep((s) => Math.min(s + 1, 5))}
          className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-40"
        >
          Continue
        </button>

      </div>
    </div>
  );
}
