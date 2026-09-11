"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

interface StepNameProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StepName({
  value,
  onChange,
}: StepNameProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-12">

      <h2 className="text-4xl font-bold">
        {t("step.name.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.name.description")}
      </p>

      <input
        type="text"
        name="name"
        autoComplete="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("step.name.placeholder")}
        className="
          mt-5
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
