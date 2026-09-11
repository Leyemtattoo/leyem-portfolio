"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

export default function SuccessStep() {
  const { t } = useTranslation();
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-black text-4xl text-white">
        ✓
      </div>

      <h2 className="text-4xl font-bold">
        {t("step.success.title")}
      </h2>

      <p className="mt-4 max-w-md text-[#AAA79F]">
        {t("step.success.description")}
      </p>
    </div>
  );
}
