"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

interface PlacementProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Placement({
  value,
  onChange,
}: PlacementProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-12">
      <h2 className="text-4xl font-bold">
        {t("step.placement.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.placement.description")}
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("step.placement.placeholder")}
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
