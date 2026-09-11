"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

interface StepInstagramProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StepInstagram({
  value,
  onChange,
}: StepInstagramProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-12">
      <h2 className="text-4xl font-bold">
        {t("step.instagram.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.instagram.description")}
      </p>

      <input
        type="text"
        name="instagram"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        data-1p-ignore="true"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="@username"
        className="
          mt-2
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
