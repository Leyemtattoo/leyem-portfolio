"use client";

import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import BookingSheet from "@/components/booking/BookingSheet";
import ArrowIcon from "@/components/Hero/ArrowIcon";
import { useTranslation, type Locale } from "@/components/i18n/LanguageProvider";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const walkinDesigns = Array.from({ length: 50 }, (_, index) => ({
  row: Math.floor(index / 10),
  column: index % 10,
}));

const copy: Record<Locale, {
  back: string; eyebrow: string; title: string; intro: string; pick: string; picking: string; result: string; again: string;
  browse: string; customRequest: string; miniTitle: string; miniSubtitle: string; close: string;
  studioEyebrow: string; studioTitle: string; studioText: string; address: string; transit: string; directions: string; mapTitle: string;
}> = {
  fr: { back: "Retour aux catégories", eyebrow: "Random pick", title: "Walk-ins", intro: "Un flash au hasard. Lance le tirage ou choisis directement dans le mini flashbook.", pick: "Choisir mon flash", picking: "Le hasard choisit…", result: "Ton random pick", again: "Relancer", browse: "Ouvrir le mini flashbook", customRequest: "Envoie-moi ta propre demande", miniTitle: "Mini flashbook", miniSubtitle: "Touche un flash pour le sélectionner.", close: "Fermer le mini flashbook", studioEyebrow: "Où me trouver", studioTitle: "OEK Factory Tattoo", studioText: "Je tatoue chez OEK Factory Tattoo, au cœur de Berlin-Mitte. Le studio se trouve à l’arrière du bâtiment.", address: "OEK Factory Tattoo · Leipziger Straße 58 · 10117 Berlin", transit: "U2 Hausvogteiplatz · 3 min à pied", directions: "Ouvrir l’itinéraire", mapTitle: "Plan d’accès à OEK Factory Tattoo" },
  en: { back: "Back to categories", eyebrow: "Random pick", title: "Walk-ins", intro: "One flash, chosen by chance. Start the draw or choose directly from the mini flashbook.", pick: "Pick my flash", picking: "Chance is choosing…", result: "Your random pick", again: "Pick again", browse: "Open the mini flashbook", customRequest: "Text me your own request", miniTitle: "Mini flashbook", miniSubtitle: "Tap a flash to select it.", close: "Close the mini flashbook", studioEyebrow: "Find me here", studioTitle: "OEK Factory Tattoo", studioText: "I tattoo at OEK Factory Tattoo in the heart of Berlin-Mitte. The studio is located at the rear of the building.", address: "OEK Factory Tattoo · Leipziger Straße 58 · 10117 Berlin", transit: "U2 Hausvogteiplatz · 3 min walk", directions: "Open directions", mapTitle: "Directions to OEK Factory Tattoo" },
  de: { back: "Zurück zu den Kategorien", eyebrow: "Random Pick", title: "Walk-ins", intro: "Ein Flash, vom Zufall gewählt. Starte die Auswahl oder wähle direkt im Mini-Flashbook.", pick: "Flash auswählen", picking: "Der Zufall entscheidet…", result: "Dein Random Pick", again: "Neu ziehen", browse: "Mini-Flashbook öffnen", customRequest: "Schick mir deine eigene Anfrage", miniTitle: "Mini-Flashbook", miniSubtitle: "Tippe auf ein Flash, um es auszuwählen.", close: "Mini-Flashbook schließen", studioEyebrow: "Hier findest du mich", studioTitle: "OEK Factory Tattoo", studioText: "Ich tätowiere bei OEK Factory Tattoo im Herzen von Berlin-Mitte. Das Studio befindet sich auf der Rückseite des Gebäudes.", address: "OEK Factory Tattoo · Leipziger Straße 58 · 10117 Berlin", transit: "U2 Hausvogteiplatz · 3 Min. zu Fuß", directions: "Route öffnen", mapTitle: "Anfahrt zur OEK Factory Tattoo" },
  es: { back: "Volver a las categorías", eyebrow: "Random pick", title: "Walk-ins", intro: "Un flash elegido al azar. Inicia el sorteo o elige directamente en el mini flashbook.", pick: "Elegir mi flash", picking: "El azar está eligiendo…", result: "Tu random pick", again: "Volver a elegir", browse: "Abrir el mini flashbook", customRequest: "Envíame tu propia propuesta", miniTitle: "Mini flashbook", miniSubtitle: "Toca un flash para seleccionarlo.", close: "Cerrar el mini flashbook", studioEyebrow: "Dónde encontrarme", studioTitle: "OEK Factory Tattoo", studioText: "Tatúo en OEK Factory Tattoo, en pleno Berlin-Mitte. El estudio está situado en la parte trasera del edificio.", address: "OEK Factory Tattoo · Leipziger Straße 58 · 10117 Berlin", transit: "U2 Hausvogteiplatz · 3 min a pie", directions: "Abrir itinerario", mapTitle: "Cómo llegar a OEK Factory Tattoo" },
};

const compactIntro: Record<Locale, string> = {
  fr: "Un flash au hasard — ou choisis le tien.",
  en: "A random flash — or choose your own.",
  de: "Ein Flash per Zufall — oder wähle selbst.",
  es: "Un flash al azar — o elige el tuyo.",
};

export default function WalkinsPage({ embedded = false, onOverlayChange }: { embedded?: boolean; onOverlayChange?: (open: boolean) => void }) {
  const { locale } = useTranslation();
  const reduceMotion = useReducedMotion();
  const content = copy[locale];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPicked, setHasPicked] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isMiniFlashbookOpen, setIsMiniFlashbookOpen] = useState(false);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDesign = walkinDesigns[currentIndex];
  const Root = embedded ? "div" : "main";

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    onOverlayChange?.(isMiniFlashbookOpen || isCustomRequestOpen);
  }, [isMiniFlashbookOpen, isCustomRequestOpen, onOverlayChange]);

  const pickRandomFlash = () => {
    if (isPicking) return;
    setIsPicking(true);
    setHasPicked(false);
    if (reduceMotion) {
      setCurrentIndex((current) => (current + 1 + Math.floor(Math.random() * (walkinDesigns.length - 1))) % walkinDesigns.length);
      setHasPicked(true);
      setIsPicking(false);
      return;
    }
    intervalRef.current = setInterval(() => setCurrentIndex((current) => (current + 1) % walkinDesigns.length), 82);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setCurrentIndex((current) => (current + 1 + Math.floor(Math.random() * (walkinDesigns.length - 1))) % walkinDesigns.length);
      setHasPicked(true);
      setIsPicking(false);
    }, 1050);
  };

  return (
    <Root className={`${neueMontrealRegular.className} min-h-[100dvh] overflow-x-hidden bg-[#201e21] text-white`}>
      {!embedded && (
        <Link href="/flashbook/categories?from=walkins" aria-label={content.back} className={`fixed left-4 z-[90] grid size-[52px] place-items-center rounded-full border border-white/15 bg-[#252525]/55 text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-opacity ${isMiniFlashbookOpen || isCustomRequestOpen ? "pointer-events-none opacity-0" : "opacity-100"}`} style={{ top: "var(--flash-home-top, calc(100dvh - 120px - env(safe-area-inset-bottom)))" }}>
          <span className="rotate-180"><ArrowIcon size={22} color="white" /></span>
        </Link>
      )}

      <section className="relative min-h-[100dvh] overflow-hidden bg-[#201e21]">
        <video aria-hidden="true" autoPlay muted loop playsInline preload="auto" tabIndex={-1} className="pointer-events-none absolute inset-0 h-full w-full scale-[1.03] object-cover grayscale brightness-[0.42] contrast-[1.2]">
          <source src="/videos/walkins-loop.mp4" type="video/mp4" />
        </video>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(10,9,11,0.48)_48%,rgba(0,0,0,0.76)_100%)]" />
        <div aria-hidden="true" className="hero-disco-grain pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1180px] flex-col px-6 pb-[calc(108px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] sm:px-9 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
        <motion.header initial={reduceMotion ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 pb-6 lg:pb-0">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 sm:text-xs">{content.eyebrow}</p>
          <h1 className={`${framaBlack.className} whitespace-nowrap text-[clamp(2.65rem,10vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.055em]`}>{content.title}</h1>
          <p className="mt-4 max-w-md whitespace-nowrap text-[12px] leading-relaxed text-white/58 sm:text-sm">{compactIntro[locale]}</p>
        </motion.header>

        <div className="flex flex-1 flex-col items-center justify-center lg:min-h-[760px]">
          <motion.div initial={reduceMotion ? false : { opacity: 0, x: 35, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-[270px] sm:max-w-[360px] lg:max-w-[390px]">
            <button type="button" onClick={pickRandomFlash} disabled={isPicking} aria-label={hasPicked ? content.again : content.pick} className="relative mx-auto block aspect-[0.76] w-full overflow-hidden rounded-[30px] bg-[#f2efe9] text-left shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform active:scale-[0.975] disabled:cursor-wait sm:rounded-[34px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={currentIndex} initial={{ opacity: 0, y: isPicking ? 22 : 38, scale: 0.96, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: -24, scale: 0.97, filter: "blur(5px)" }} transition={{ duration: isPicking ? 0.1 : 0.38, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                      backgroundImage: "url('/images/walkins/random-flash-sheet.png')",
                      backgroundSize: "1000% 500%",
                      backgroundPosition: `${(currentDesign.column / 9) * 100}% ${(currentDesign.row / 4) * 100}%`,
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 rounded-[34px] border border-black/10" />
              <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-black px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/85">{isPicking ? content.picking : hasPicked ? content.result : `${String(currentIndex + 1).padStart(2, "0")} / ${String(walkinDesigns.length).padStart(2, "0")}`}</div>
              <span className="pointer-events-none absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-black text-2xl text-white shadow-lg">
                {!hasPicked && !isPicking ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5 animate-pulse">
                    <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v3.2c0 4.1-2.5 6.3-6.2 6.3h-1.4c-2.1 0-3.4-.8-4.6-2.4l-3.1-4.2a1.55 1.55 0 0 1 2.4-1.95L9 14.1Z" />
                  </svg>
                ) : (
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={isPicking && !reduceMotion ? { rotate: 360, scale: [1, 0.91, 1] } : { rotate: 0, scale: 1 }}
                    transition={isPicking ? { rotate: { duration: 0.82, repeat: Infinity, ease: "linear" }, scale: { duration: 0.82, repeat: Infinity, ease: "easeInOut" } } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformBox: "view-box", transformOrigin: "12px 12px" }}
                    className="block size-[22px] shrink-0"
                  >
                    <motion.path
                      d="M20 6v5h-5"
                      animate={isPicking && !reduceMotion ? { opacity: [0.65, 1, 0.65] } : { opacity: 1 }}
                      transition={{ duration: 0.82, repeat: isPicking ? Infinity : 0, ease: "easeInOut" }}
                    />
                    <path d="M18.5 15a7.5 7.5 0 1 1 .4-7.2L20 11" />
                  </motion.svg>
                )}
              </span>
            </button>
            <button type="button" onClick={() => setIsMiniFlashbookOpen(true)} className="mt-4 flex h-14 w-full items-center justify-between rounded-full border border-white/18 bg-white/[0.04] px-6 text-[15px] font-medium text-white backdrop-blur transition-colors active:bg-white/10">
              <span>{content.browse}</span><ArrowIcon size={18} color="white" />
            </button>
            <button type="button" onClick={() => setIsCustomRequestOpen(true)} className="mt-3 flex h-14 w-full items-center justify-between rounded-full border border-white/18 bg-white/[0.04] px-6 text-[15px] font-medium text-white backdrop-blur transition-colors active:bg-white/10">
              <span>{content.customRequest}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7 7 0 0 1 3 12V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
              </svg>
            </button>
          </motion.div>
        </div>
        </div>
      </section>

      <section className="bg-[#f2efe9] text-[#171717]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-6 py-16 sm:px-9 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-black/42">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{content.studioEyebrow}</span>
            </p>
            <h2 className={`${framaBlack.className} max-w-[520px] text-[clamp(3.2rem,14vw,7rem)] uppercase leading-[0.82] tracking-[-0.05em]`}>{content.studioTitle}</h2>
            <p className="mt-6 max-w-[470px] text-[15px] leading-[1.5] text-black/58 sm:text-lg">{content.studioText}</p>
            <div className="mt-7 space-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-black/58 sm:text-xs"><p>{content.address}</p><p>{content.transit}</p></div>
            <a href="https://maps.apple.com/?q=OEK%20Factory%20Tattoo&address=Leipziger%20Stra%C3%9Fe%2058%2C%2010117%20Berlin" target="_blank" rel="noreferrer" className="mt-8 inline-flex h-14 items-center gap-5 rounded-full bg-black px-6 text-sm font-medium text-white transition-transform active:scale-[0.985]"><span>{content.directions}</span><ArrowIcon size={18} color="white" /></a>
          </div>
          <div className="relative aspect-[0.82] w-full min-w-0 max-w-full overflow-hidden rounded-[34px] border border-black/10 bg-[#dedbd5] shadow-[0_24px_60px_rgba(0,0,0,0.14)] sm:aspect-[1.2] sm:min-h-[430px]">
            <iframe title={content.mapTitle} src="https://maps.google.com/maps?q=OEK%20Factory%20Tattoo%2C%20Leipziger%20Stra%C3%9Fe%2058%2C%2010117%20Berlin&z=17&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.08]" />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isMiniFlashbookOpen && (
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={content.miniTitle}
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0.15 : 0.58, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#201e21] text-white"
          >
            <div className="mx-auto min-h-full w-full max-w-[980px] px-5 pb-[calc(36px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))] sm:px-8">
              <header className="sticky top-0 z-20 mb-7 flex items-start justify-between gap-5 bg-[#201e21]/92 pb-5 pt-1 backdrop-blur-xl">
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/42">Walk-ins · 50 flashs</p>
                  <h2 className={`${framaBlack.className} text-[clamp(3rem,13vw,6.5rem)] uppercase leading-[0.8] tracking-[-0.05em]`}>{content.miniTitle}</h2>
                  <p className="mt-3 text-[13px] text-white/52 sm:text-base">{content.miniSubtitle}</p>
                </div>
                <button type="button" onClick={() => setIsMiniFlashbookOpen(false)} aria-label={content.close} className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/8 text-[29px] font-light leading-none backdrop-blur">×</button>
              </header>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {walkinDesigns.map((design, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setHasPicked(true);
                      setIsMiniFlashbookOpen(false);
                    }}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "80px" }}
                    transition={{ duration: 0.38, delay: (index % 8) * 0.025, ease: [0.22, 1, 0.36, 1] }}
                    aria-label={`Walk-in flash ${index + 1}`}
                    className={`relative aspect-[0.75] overflow-hidden rounded-[22px] border bg-[#777] transition-transform active:scale-[0.97] ${currentIndex === index && hasPicked ? "border-white" : "border-white/10"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-no-repeat"
                      style={{
                        backgroundImage: "url('/images/walkins/random-flash-sheet.png')",
                        backgroundSize: "1000% 500%",
                        backgroundPosition: `${(design.column / 9) * 100}% ${(design.row / 4) * 100}%`,
                      }}
                    />
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/70 px-2 py-1 font-mono text-[8px] tracking-[0.14em] text-white backdrop-blur">{String(index + 1).padStart(2, "0")}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <BookingSheet open={isCustomRequestOpen} onClose={() => setIsCustomRequestOpen(false)} />
    </Root>
  );
}
