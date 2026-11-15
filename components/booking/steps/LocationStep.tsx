"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

import { parisBookingDates } from "../availability";

interface LocationStepProps {
  value: string;
  date: string;
  onDateChange: (date: string) => void;
  onChange: (value: string) => void;
}

export default function LocationStep({
  value,
  date,
  onDateChange,
  onChange,
}: LocationStepProps) {
  const { t, locale } = useTranslation();
  return (
    <div className="mt-12 pb-20">
      <h2 className="text-4xl font-bold">
        {t("step.location.title")}
      </h2>

      <p className="mt-4 text-[#AAA79F]">
        {t("step.location.description")}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4">
        {["Paris", "Berlin"].map((city) => (
          <button
            key={city}
            type="button"
            aria-pressed={value === city}
            onClick={() => onChange(city)}
            className={`rounded-2xl border px-6 py-5 text-xl transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${value === city ? "border-black bg-black text-white" : "border-neutral-200 hover:border-black"}`}
          >
            {city}
          </button>
        ))}
      </div>
      {value === "Paris" && (
        <fieldset className="mt-6">
          <legend className="text-sm text-black">{{ fr: "Choisis ta date", en: "Choose your date", de: "Wähle deinen Termin", es: "Elige tu fecha" }[locale]}</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {parisBookingDates.map((day) => (
              <button key={day} type="button" aria-pressed={date === day} onClick={() => onDateChange(day)}
                className={`rounded-2xl border px-3 py-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${date === day ? "border-black bg-black text-white" : "border-neutral-200 text-black hover:border-black"}`}>
                {new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`))}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
