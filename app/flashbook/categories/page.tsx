"use client";

import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import WalkinsPage from "@/app/flashbook/walkins/page";
import FlashbookBook from "@/components/Flashbook/FlashbookBook";
import ArrowIcon from "@/components/Hero/ArrowIcon";
import Hero from "@/components/Hero/Hero";
import { useTranslation, type Locale } from "@/components/i18n/LanguageProvider";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Offer = {
  id: "mini" | "flash" | "concept";
  number: string;
  title: string;
  price: string;
  description: string;
};

const copy: Record<Locale, { eyebrow: string; title: string; subtitle: string; back: string; offers: Offer[] }> = {
  fr: {
    eyebrow: "Flashbook",
    title: "Choisis ton format",
    subtitle: "Trois façons de trouver la pièce qui te correspond.",
    back: "Retour à l’accueil",
    offers: [
      { id: "mini", number: "01", title: "Walk-ins", price: "150 – 200 €", description: "Une petite pièce, directe et spontanée." },
      { id: "flash", number: "02", title: "Flashs", price: "200 – 600 €", description: "Des créations disponibles à adapter à ton corps." },
      { id: "concept", number: "03", title: "Concepts", price: "600 € +", description: "Des compositions fortes pensées en grand format." },
    ],
  },
  en: {
    eyebrow: "Flashbook",
    title: "Choose your format",
    subtitle: "Three ways to find the piece that fits you.",
    back: "Back home",
    offers: [
      { id: "mini", number: "01", title: "Walk-ins", price: "150 – 200 €", description: "A small, direct and spontaneous piece." },
      { id: "flash", number: "02", title: "Flashs", price: "200 – 600 €", description: "Available designs adapted to your body." },
      { id: "concept", number: "03", title: "Concepts", price: "600 € +", description: "Bold compositions designed on a larger scale." },
    ],
  },
  de: {
    eyebrow: "Flashbook",
    title: "Wähle dein Format",
    subtitle: "Drei Wege zu dem Motiv, das zu dir passt.",
    back: "Zurück zur Startseite",
    offers: [
      { id: "mini", number: "01", title: "Walk-ins", price: "150 – 200 €", description: "Ein kleines, direktes und spontanes Motiv." },
      { id: "flash", number: "02", title: "Flashs", price: "200 – 600 €", description: "Verfügbare Designs, angepasst an deinen Körper." },
      { id: "concept", number: "03", title: "Concepts", price: "600 € +", description: "Ausdrucksstarke Kompositionen im Großformat." },
    ],
  },
  es: {
    eyebrow: "Flashbook",
    title: "Elige tu formato",
    subtitle: "Tres formas de encontrar la pieza ideal para ti.",
    back: "Volver al inicio",
    offers: [
      { id: "mini", number: "01", title: "Walk-ins", price: "150 – 200 €", description: "Una pieza pequeña, directa y espontánea." },
      { id: "flash", number: "02", title: "Flashs", price: "200 – 600 €", description: "Diseños disponibles adaptados a tu cuerpo." },
      { id: "concept", number: "03", title: "Concepts", price: "600 € +", description: "Composiciones potentes pensadas a gran escala." },
    ],
  },
};

export default function FlashbookCategoriesPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#201e21]" />}>
      <FlashbookCategoriesContent />
    </Suspense>
  );
}

function FlashbookCategoriesContent() {
  const { locale, t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReturningHome, setIsReturningHome] = useState(false);
  const [isOnHero, setIsOnHero] = useState(false);
  const [isEnteringFromHero, setIsEnteringFromHero] = useState(true);
  const [flashLayerPhase, setFlashLayerPhase] = useState<"opening" | "open" | "closing" | null>(null);
  const [walkinLayerPhase, setWalkinLayerPhase] = useState<"opening" | "open" | "closing" | null>(null);
  const [isFlashExpanded, setIsFlashExpanded] = useState(false);
  const [isWalkinExpanded, setIsWalkinExpanded] = useState(false);
  const isReturningFromCategory = searchParams.has("from");
  const [enteredFromCategory] = useState(() => searchParams.has("from"));
  const isHomeTransitionActive = !isReturningFromCategory && (isReturningHome || isOnHero);
  const isFlashLayerActive = flashLayerPhase !== null;
  const isWalkinLayerActive = walkinLayerPhase !== null;
  const isOfferLayerActive = isFlashLayerActive || isWalkinLayerActive;
  const isOfferButtonMorphing = flashLayerPhase === "opening" || flashLayerPhase === "closing" || walkinLayerPhase === "opening" || walkinLayerPhase === "closing";
  const showsArrowIcon = isHomeTransitionActive || flashLayerPhase === "opening" || flashLayerPhase === "open" || walkinLayerPhase === "opening" || walkinLayerPhase === "open";
  const content = copy[locale];

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (!isReturningFromCategory) return;
    const resetTimer = window.setTimeout(() => {
      setIsOnHero(false);
      setIsReturningHome(false);
      setIsEnteringFromHero(true);
      router.replace("/flashbook/categories");
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [isReturningFromCategory, router]);

  const returnHome = () => {
    if (!isReturningFromCategory && isOnHero) {
      setIsEnteringFromHero(true);
      setIsOnHero(false);
      setIsReturningHome(false);
      window.history.replaceState(window.history.state, "", "/flashbook/categories");
      return;
    }
    if (isReturningHome) return;
    if (reduceMotion) {
      router.push("/?from=flashbook");
      return;
    }

    setIsReturningHome(true);
  };

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-[#201e21]" />
      {!isReturningFromCategory && (
        <div
          aria-hidden={!isOnHero}
          className={`fixed inset-0 z-[1] overflow-hidden ${isOnHero ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <Hero hideFlashbookAction preserveFlashbookButtonTop />
        </div>
      )}
      <motion.button
        type="button"
        onClick={() => {
          if (flashLayerPhase) {
            if (flashLayerPhase !== "closing") setFlashLayerPhase("closing");
            return;
          }
          if (walkinLayerPhase) {
            if (walkinLayerPhase !== "closing") setWalkinLayerPhase("closing");
            return;
          }
          returnHome();
        }}
        aria-label={isOfferLayerActive ? "Retour aux catégories" : content.back}
        initial={enteredFromCategory
          ? { left: 16, width: 52 }
          : { left: "calc(50% - 165px)", width: 330 }}
        animate={{
          left: isHomeTransitionActive && !isOfferLayerActive ? "calc(50% - 165px)" : 16,
          width: isHomeTransitionActive && !isOfferLayerActive ? 330 : isOfferButtonMorphing ? 64 : 52,
          opacity: isFlashExpanded || isWalkinExpanded ? 0 : 1,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (!isReturningFromCategory && isReturningHome) {
            setIsOnHero(true);
            window.history.replaceState(window.history.state, "", "/");
            return;
          }
          if (isEnteringFromHero) setIsEnteringFromHero(false);
        }}
        className={`fixed z-[90] flex h-[52px] items-center overflow-hidden rounded-full border border-white/15 bg-[#252525]/55 text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] backdrop-blur-xl ${isFlashExpanded || isWalkinExpanded ? "pointer-events-none" : ""}`}
        style={{ top: "var(--flash-home-top, calc(100dvh - 120px - env(safe-area-inset-bottom)))" }}
      >
        <AnimatePresence initial={false} mode="sync">
          {showsArrowIcon ? (
            <motion.span
              key={isOfferLayerActive ? "back-arrow" : "forward-arrow"}
              initial={{ opacity: 0, scale: 0.72, rotate: isOfferLayerActive ? 155 : -20 }}
              animate={{ opacity: 1, scale: 1, rotate: isOfferLayerActive ? 180 : 0 }}
              exit={{ opacity: 0, scale: 0.72, rotate: isOfferLayerActive ? 205 : 20 }}
              transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={isHomeTransitionActive
                ? "absolute left-0 top-0 grid h-[52px] w-[52px] place-items-center"
                : "absolute inset-0 grid place-items-center"}
            >
              <ArrowIcon size={22} color="white" />
            </motion.span>
          ) : (
            <motion.span
              key="home-icon"
              initial={{ opacity: 0, scale: 0.72, rotate: -22 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.72, rotate: 22 }}
              transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[19px] w-[19px] fill-none stroke-current stroke-[1.7]">
                <path d="M3.75 10.5 12 3.75l8.25 6.75v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-4.5v6h-4.5a1.5 1.5 0 0 1-1.5-1.5Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span
          initial={enteredFromCategory ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: isHomeTransitionActive && !isOfferLayerActive ? 1 : 0 }}
          transition={{ delay: isHomeTransitionActive ? 0.22 : 0.1, duration: 0.18 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap text-[20px]"
        >
          {t("cta.flashbook")}
        </motion.span>
      </motion.button>

      <motion.main
        initial={reduceMotion || isReturningFromCategory ? false : { x: "100vw", opacity: 0.9 }}
        animate={{ x: isHomeTransitionActive ? "100vw" : 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.65, 0, 0.35, 1] }}
        className={`${neueMontrealRegular.className} fixed inset-0 z-10 h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#201e21] text-white [will-change:transform]`}
      >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: "7vw" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] }}
        className="mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-7 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))] lg:px-10"
      >
        <header className="px-1 pb-8 sm:pb-10">
          <div className="max-w-[760px]">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 sm:text-xs">{content.eyebrow}</p>
            <h1 className={`${framaBlack.className} max-w-[700px] text-[clamp(2.65rem,10vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.055em]`}>
              {content.title}
            </h1>
            <p className="mt-5 max-w-[540px] text-[15px] leading-snug text-white/57 sm:text-lg">{content.subtitle}</p>
          </div>
        </header>

        <section className="grid gap-3 md:flex-1 md:grid-cols-3 md:gap-4">
          {content.offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={reduceMotion ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.12 + index * 0.09, duration: reduceMotion ? 0 : 0.56, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={offer.id === "flash" ? "/flashbook/gallery?offer=flash" : offer.id === "mini" ? "/flashbook/walkins" : "/flashbook/categories"}
                prefetch={offer.id !== "concept"}
                aria-disabled={offer.id === "concept"}
                onClick={(event) => {
                  if (offer.id === "flash") {
                    event.preventDefault();
                    if (!flashLayerPhase) setFlashLayerPhase("opening");
                  } else if (offer.id === "mini") {
                    event.preventDefault();
                    if (!walkinLayerPhase) setWalkinLayerPhase("opening");
                  } else if (offer.id === "concept") {
                    event.preventDefault();
                  }
                }}
                className={`relative flex min-h-[132px] h-full flex-col justify-between overflow-hidden rounded-[30px] border border-black/10 bg-[#f2efe9] p-4 text-[#171717] shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition-transform duration-500 sm:min-h-[150px] sm:p-5 md:min-h-[390px] md:p-7 lg:min-h-[470px] ${offer.id !== "concept" ? "group hover:-translate-y-1" : "cursor-default"}`}
              >
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.92),transparent_36%),linear-gradient(145deg,transparent_40%,rgba(0,0,0,0.04))]" />
                <div className="relative flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-black/44 sm:text-[10px] md:text-xs">
                  <span>{offer.number}</span>
                  <span>{offer.price}</span>
                </div>
                <div className="relative mt-4 flex items-end justify-between gap-3 md:mt-8 md:gap-5">
                  <div className="min-w-0">
                    <h2 className={`${framaBlack.className} text-[clamp(1.8rem,8vw,2.2rem)] uppercase leading-[0.86] tracking-[-0.04em] md:text-[clamp(2.1rem,4vw,4rem)]`}>{offer.title}</h2>
                    <p className="mt-2 max-w-[260px] text-[11px] leading-[1.18] text-black/52 sm:text-[12px] md:mt-3 md:text-[15px] md:leading-snug">{offer.description}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-white transition-transform duration-500 group-hover:translate-x-1 md:size-14">
                    <ArrowIcon size={20} color="white" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>
      </motion.div>
      </motion.main>

      {flashLayerPhase && (
        <motion.main
          initial={reduceMotion ? false : { x: "100vw" }}
          animate={{ x: flashLayerPhase === "closing" ? "100vw" : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={() => {
            if (flashLayerPhase === "opening") {
              setFlashLayerPhase("open");
              window.history.replaceState(window.history.state, "", "/flashbook/gallery?offer=flash");
            } else if (flashLayerPhase === "closing") {
              setFlashLayerPhase(null);
              setIsFlashExpanded(false);
              window.history.replaceState(window.history.state, "", "/flashbook/categories");
            }
          }}
          className="fixed inset-0 z-20 h-[100dvh] overflow-hidden bg-[#201e21] [will-change:transform]"
        >
          <FlashbookBook onFullscreenChange={setIsFlashExpanded} />
        </motion.main>
      )}

      {walkinLayerPhase && (
        <motion.main
          initial={reduceMotion ? false : { x: "100vw" }}
          animate={{ x: walkinLayerPhase === "closing" ? "100vw" : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={() => {
            if (walkinLayerPhase === "opening") {
              setWalkinLayerPhase("open");
              window.history.replaceState(window.history.state, "", "/flashbook/walkins");
            } else if (walkinLayerPhase === "closing") {
              setWalkinLayerPhase(null);
              setIsWalkinExpanded(false);
              window.history.replaceState(window.history.state, "", "/flashbook/categories");
            }
          }}
          className="fixed inset-0 z-20 h-[100dvh] overflow-y-auto bg-[#201e21] [will-change:transform]"
        >
          <WalkinsPage embedded onOverlayChange={setIsWalkinExpanded} />
        </motion.main>
      )}
    </>
  );
}
