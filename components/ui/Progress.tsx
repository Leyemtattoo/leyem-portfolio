"use client";

import { motion } from "framer-motion";

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function Progress({
  currentStep,
  totalSteps,
}: ProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const active = index <= currentStep;

        return (
          <motion.div
            key={index}
            animate={{
              flex: active ? 1.8 : 1,
              backgroundColor: active ? "#111111" : "#E5E5E5",
            }}
            transition={{
              duration: 0.3,
            }}
            className="h-1 rounded-full"
          />
        );
      })}
    </div>
  );
}
