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
    <div className="mt-12">
      <h2 className="text-4xl font-bold">
        {t("step.location.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.location.description")}
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("step.location.placeholder")}
        className="
          mt-10
          w-full
          rounded-2xl
          border
          border-neutral-200
          px-6
          py-5
          text-xl
          placeholder:text-[#AAA79F]
          placeholder:opacity-100
          outline-none
          transition
          focus:border-black
        "
      />
    </div>
  );
}
