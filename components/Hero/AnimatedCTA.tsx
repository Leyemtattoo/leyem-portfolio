"use client";

import CTAButton from "./CTAButton";

export default function AnimatedCTA() {
  return (
    <div className="flex flex-col items-start gap-5">
      <CTAButton
        text="Book Appointment"
        variant="filled"
      />

      <CTAButton
        text="View Flashbook"
        variant="outline"
      />
    </div>
  );
}