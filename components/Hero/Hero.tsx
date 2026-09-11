"use client";

import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { framaBlack } from "@/app/fonts";
import BookingSheet from "../booking/BookingSheet";
import AnimatedCTA from "./AnimatedCTA";
import FlashbookButton from "./FlashbookButton";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Hero({
  enterFromFlashbook = false,
  hideActions = false,
  hideFlashbookAction = false,
  preserveFlashbookButtonTop = false,
  onBookingOpenChange,
}: {
  enterFromFlashbook?: boolean;
  hideActions?: boolean;
  hideFlashbookAction?: boolean;
  preserveFlashbookButtonTop?: boolean;
  onBookingOpenChange?: (open: boolean) => void;
}) {
  const { locale } = useTranslation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isOpeningFlashbook, setIsOpeningFlashbook] = useState(false);
  const flashbookButtonRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  const heroTitleLines = {
    en: ["HI!", "I’M LEYEM"],
    de: ["HALLO!", "ICH BIN LEYEM"],
    fr: ["BONJOUR !", "JE SUIS LEYEM"],
    es: ["¡HOLA!", "SOY LEYEM"],
  }[locale];

  const heroSignature = {
    en: "Tattoo artist specializing in graphic realism and fine lines, I create unique pieces shaped around your story, your body and your ideas. Every project is designed as a personal image, made to live with you over time.",
    de: "Als Tätowierer für grafischen Realismus und feine Linien entwickle ich einzigartige Motive aus deiner Geschichte, deinem Körper und deinen Ideen. Jedes Projekt entsteht als persönliches Bild, das dich lange begleiten soll.",
    fr: "Tatoueur spécialisé en réalisme graphique et lignes fines, je crée des pièces uniques inspirées de votre histoire, de votre corps et de vos idées.",
    es: "Tatuador especializado en realismo gráfico y líneas finas, creo piezas únicas a partir de tu historia, tu cuerpo y tus ideas. Cada proyecto se diseña como una imagen personal, pensada para acompañarte con el paso del tiempo.",
  }[locale];

  const aboutLabel = {
    en: "About",
    de: "Über mich",
    fr: "À propos",
    es: "Sobre mí",
  }[locale];

  const aboutActionLabel = {
    en: "Meet Leyem",
    de: "Leyem kennenlernen",
    fr: "Découvrir Leyem",
    es: "Conoce a Leyem",
  }[locale];

  const closeAboutLabel = {
    en: "Close About",
    de: "Über mich schließen",
    fr: "Fermer À propos",
    es: "Cerrar Sobre mí",
  }[locale];

  useEffect(() => {
    router.prefetch("/flashbook/categories");
  }, [router]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || reduceMotion) return;

    const playVideo = () => {
      if (document.visibilityState !== "visible") return;
      void video.play().catch(() => undefined);
    };

    playVideo();
    document.addEventListener("visibilitychange", playVideo);
    window.addEventListener("pointerdown", playVideo, { passive: true });
    window.addEventListener("touchstart", playVideo, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", playVideo);
      window.removeEventListener("pointerdown", playVideo);
      window.removeEventListener("touchstart", playVideo);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (enterFromFlashbook) {
      window.history.replaceState(window.history.state, "", "/");
    }
  }, [enterFromFlashbook]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlStyles = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
    };
    const previousBodyStyles = {
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlStyles.overflow;
      html.style.overscrollBehavior = previousHtmlStyles.overscrollBehavior;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
    };
  }, []);

  const openFlashbook = () => {
    if (isOpeningFlashbook) return;
    if (reduceMotion) {
      router.push("/flashbook/categories");
      return;
    }

    const top = flashbookButtonRef.current?.getBoundingClientRect().top;
    if (top === undefined) return;

    document.documentElement.style.setProperty("--flash-home-top", `${top}px`);
    setIsOpeningFlashbook(true);
    router.push("/flashbook/categories");
  };

  return (
    <main className="fixed inset-0 overflow-hidden overscroll-none bg-[#252525]">
      <section className="relative h-full touch-none overflow-hidden bg-[#252525]">
        <video
          ref={heroVideoRef}
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-72 brightness-[0.7] grayscale contrast-[1.48] [will-change:transform]"
        >
          <source src="/italo-disco-bg.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(3,3,4,0.5)_48%,rgba(0,0,0,0.88)_100%)]"
        />
        <div aria-hidden="true" className="hero-disco-glow pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="hero-disco-vignette pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="hero-disco-shine pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="hero-disco-grain pointer-events-none absolute inset-0" />
        <motion.div
          initial={false}
          animate={{ x: 0 }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          className="relative z-10 mx-auto h-full w-full max-w-[430px] px-5"
        >
          <LanguageSwitcher
            visible={!hideActions}
            animateOnMount={!enterFromFlashbook && !preserveFlashbookButtonTop}
            activeIndicatorId={preserveFlashbookButtonTop
              ? "active-language-backdrop"
              : "active-language"}
            playIntroSequence={!preserveFlashbookButtonTop && !enterFromFlashbook}
          />
          <h1
            className={`${framaBlack.className} absolute left-5 right-5 top-[18%] text-left font-black uppercase leading-[0.82] tracking-[-0.025em] text-white`}
            style={{
              fontSize: {
                en: "clamp(58px, 16vw, 68px)",
                de: "clamp(48px, 13.5vw, 58px)",
                fr: "clamp(47px, 13.2vw, 57px)",
                es: "clamp(55px, 15.5vw, 66px)",
              }[locale],
            }}
          >
            {heroTitleLines.map((line, index) => (
              <span
                key={index}
                className={`relative block overflow-hidden [perspective:500px] ${locale === "fr" && index === 0 ? "h-[1.12em]" : "h-[0.84em]"}`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={`${locale}-${line}`}
                    initial={reduceMotion ? false : {
                      y: "115%",
                      rotateX: -72,
                      opacity: 0,
                      filter: "blur(7px)",
                    }}
                    animate={{
                      y: "0%",
                      rotateX: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={reduceMotion ? { opacity: 0 } : {
                      y: "-115%",
                      rotateX: 72,
                      opacity: 0,
                      filter: "blur(7px)",
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.48,
                      delay: reduceMotion ? 0 : index * 0.055,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-x-0 top-0 block whitespace-nowrap [backface-visibility:hidden] [transform-origin:center_center] [will-change:transform,filter]"
                    style={{
                      fontSize:
                        locale === "fr" && index === 0
                          ? "1.3em"
                          : locale === "de" && index === 1
                            ? "0.9em"
                            : "1em",
                    }}
                  >
                    {line}
                  </motion.span>
                </AnimatePresence>
              </span>
            ))}
          </h1>

          <div
            id="about"
            className="absolute left-6 right-6 top-[calc(18%_+_112px)] min-h-32 text-left"
            style={{
              fontFamily: "var(--font-geist-sans), Inter, Arial, sans-serif",
              top: locale === "fr" ? "calc(18% + 120px)" : undefined,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                key={`${locale}-${heroSignature}`}
                initial={reduceMotion ? false : { y: 12, opacity: 0, filter: "blur(3px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { y: -12, opacity: 0, filter: "blur(3px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 max-w-[382px] text-[14px] font-medium leading-[1.58] tracking-[0.012em] text-white/70"
              >
                {heroSignature}
              </motion.p>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className={`absolute left-1/2 z-20 flex h-10 -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/18 bg-black/20 px-4 text-[13px] font-medium tracking-[0.01em] text-white/88 shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-[background-color,transform] active:scale-[0.98] md:hidden ${hideActions || isAboutOpen ? "invisible" : "visible"}`}
            style={{ bottom: "calc(221px + env(safe-area-inset-bottom))" }}
          >
            <span className="grid size-5 place-items-center rounded-full border border-white/25 bg-white/10">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="ml-px size-2.5 fill-current">
                <path d="m6.5 4 8 6-8 6Z" />
              </svg>
            </span>
            <span>{aboutActionLabel}</span>
          </button>

          <div className={`absolute bottom-[calc(136px+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 md:bottom-[calc(154px+env(safe-area-inset-bottom))] ${hideActions || isAboutOpen ? "invisible" : "visible"}`}>
            <AnimatedCTA
              delay={0.15}
              animateOnMount={false}
              onClick={() => {
                setIsBookingOpen(true);
                onBookingOpenChange?.(true);
              }}
            />
          </div>

          <motion.div
            ref={flashbookButtonRef}
            className={`absolute left-1/2 z-20 -translate-x-1/2 ${preserveFlashbookButtonTop || enterFromFlashbook ? "" : "bottom-[calc(68px+env(safe-area-inset-bottom))] md:bottom-[calc(86px+env(safe-area-inset-bottom))]"} ${hideActions || hideFlashbookAction || isAboutOpen ? "invisible" : "visible"}`}
            style={preserveFlashbookButtonTop || enterFromFlashbook
              ? { top: "var(--flash-home-top, calc(100dvh - 120px - env(safe-area-inset-bottom)))" }
              : undefined}
          >
            <FlashbookButton delay={0.25} animateOnMount={false} onClick={openFlashbook} />
          </motion.div>
        </motion.div>

      </section>

      <AnimatePresence>
        {isAboutOpen && (
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={aboutLabel}
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0.18 : 0.62, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-[100] overflow-hidden bg-black text-white"
          >
            <div className="relative mx-auto h-full w-full max-w-[430px] overflow-hidden bg-[#181818]">
              <video
                aria-hidden="true"
                autoPlay={!reduceMotion}
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/about/leyem-poster.jpg"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.015] object-cover brightness-[0.9] contrast-[1.08]"
              >
                <source src="/videos/about-leyem-dark.mp4" type="video/mp4" />
              </video>
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.78)_100%)]" />
              <div aria-hidden="true" className="hero-disco-vignette pointer-events-none absolute inset-0" />
              <div aria-hidden="true" className="hero-disco-grain pointer-events-none absolute inset-0" />

              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                aria-label={closeAboutLabel}
                className="absolute right-5 z-20 grid size-12 place-items-center rounded-full border border-white/20 bg-black/25 text-[31px] font-light leading-none text-white shadow-lg backdrop-blur-xl"
                style={{ top: "max(18px, env(safe-area-inset-top))" }}
              >
                ×
              </button>

              <div className="absolute inset-x-6 bottom-[calc(34px+env(safe-area-inset-bottom))] z-10">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Leyem · Tattoo artist</p>
                <h2 className={`${framaBlack.className} text-[clamp(56px,17vw,72px)] uppercase leading-[0.82] tracking-[-0.035em]`}>
                  {aboutLabel}
                </h2>
                <p className="mt-5 max-w-[370px] text-[14px] font-medium leading-[1.55] tracking-[0.01em] text-white/72">
                  {heroSignature}
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <BookingSheet
        open={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          onBookingOpenChange?.(false);
        }}
      />
    </main>
  );
}
