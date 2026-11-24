"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

interface LocationStepProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LocationStep({
  value,
  onChange,
}: LocationStepProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-12 pb-20">
      <h2 className="text-4xl font-bold">
        {t("step.location.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.location.description")}
      </p>

      <div className="mt-10">
        <button
          type="button"
          aria-pressed={value === "Berlin"}
          onClick={() => onChange("Berlin")}
          className={`w-full rounded-2xl border px-6 py-5 text-xl transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${value === "Berlin" ? "border-black bg-black text-white" : "border-neutral-200 hover:border-black"}`}
        >
          Berlin
        </button>
      </div>
    </div>
  );
}
