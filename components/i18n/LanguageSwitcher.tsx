"use client";

import { useTranslation, type Locale } from "./LanguageProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LanguageSwitcherProps {
  visible?: boolean;
  animateOnMount?: boolean;
  activeIndicatorId?: string;
  playIntroSequence?: boolean;
}

export default function LanguageSwitcher({
  visible = true,
  animateOnMount = true,
  activeIndicatorId = "active-language",
  playIntroSequence = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();
  const [introLocale, setIntroLocale] = useState<Locale | null>(
    playIntroSequence ? "es" : null,
  );
  const displayedLocale = introLocale ?? locale;

  useEffect(() => {
    if (!playIntroSequence || !visible) return;

    const showSpanish = window.setTimeout(() => setLocale("es"), 0);
    const showFrench = window.setTimeout(() => {
      setIntroLocale("fr");
      setLocale("fr");
    }, 500);
    const showGerman = window.setTimeout(() => {
      setIntroLocale("de");
      setLocale("de");
    }, 1000);
    const showEnglish = window.setTimeout(() => {
      setIntroLocale("en");
      setLocale("en");
    }, 1500);
    const finish = window.setTimeout(() => {
      setLocale("en");
      setIntroLocale(null);
    }, 2000);

    return () => {
      window.clearTimeout(showSpanish);
      window.clearTimeout(showFrench);
      window.clearTimeout(showGerman);
      window.clearTimeout(showEnglish);
      window.clearTimeout(finish);
    };
  }, [playIntroSequence, setLocale, visible]);

  return (
    <motion.div
      role="group"
      aria-label="Choisir la langue"
      initial={animateOnMount ? { opacity: 0, x: 14 } : false}
      animate={visible
        ? { opacity: 1, x: 0 }
        : { opacity: 0, x: 14 }}
      transition={{ duration: visible ? 0.36 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute right-5 top-[calc(18%_-_48px)] z-[110] flex gap-0.5 rounded-full border border-white/10 bg-black/25 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl ${visible ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {(["en", "de", "fr", "es"] as Locale[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => {
            setIntroLocale(null);
            setLocale(option);
          }}
          className={`relative isolate h-8 min-w-10 rounded-full px-2 text-[11px] font-semibold tracking-[0.08em] transition-colors ${
            displayedLocale === option ? "text-[#252525]" : "text-white/55 hover:text-white"
          }`}
          aria-pressed={displayedLocale === option}
        >
          {displayedLocale === option && (
            <motion.span
              layoutId={activeIndicatorId}
              className="absolute inset-0 -z-10 rounded-full bg-[#D8C1AE] shadow-[0_2px_10px_rgba(216,193,174,0.22)]"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          <span className="relative">{option.toUpperCase()}</span>
        </button>
      ))}
    </motion.div>
  );
}
