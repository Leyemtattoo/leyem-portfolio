"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

interface NotesStepProps {
  value: string;
  onChange: (value: string) => void;
  onSkip: () => void;
}

export default function NotesStep({
  value,
  onChange,
  onSkip,
}: NotesStepProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 sm:mt-12">
      <h2 className="text-3xl font-bold sm:text-4xl">
        {t("step.notes.title")}
      </h2>

      <p className="mt-2 text-[#AAA79F] sm:mt-4">
        {t("step.notes.description")}
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={(event) => {
          event.currentTarget.style.height = "auto";
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
        }}
        placeholder={t("step.notes.placeholder")}
        rows={2}
        className="
          mt-4
          min-h-[88px]
          max-h-48
          w-full
          rounded-2xl
          border
          border-neutral-200
          px-6
          py-5
          text-lg
          placeholder:text-[#AAA79F]
          placeholder:opacity-100
          outline-none
          transition
          resize-none
          focus:border-black
        "
      />

      {!value.trim() && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-4 flex w-full items-center justify-end gap-2 text-right text-base font-medium text-[#252525] transition-opacity active:opacity-60"
        >
          <span>{t("step.notes.skip")}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8 shrink-0">
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
