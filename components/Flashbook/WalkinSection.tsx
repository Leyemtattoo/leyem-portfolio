"use client";

import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import BookingSheet from "@/components/booking/BookingSheet";
import { useTranslation, type Locale } from "@/components/i18n/LanguageProvider";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import RandomPick from "./RandomPick";
import type { FlashOrigin } from "./miniFlashes";

const copy: Record<Locale, {
  back: string; eyebrow: string; title: string; intro: string; pick: string; picking: string; result: string; again: string;
  browse: string; customRequest: string; miniTitle: string; miniSubtitle: string; close: string;
}> = {
  fr: { back: "Retour aux catégories", eyebrow: "Random pick", title: "Walk-ins", intro: "Un flash au hasard. Lance le tirage ou choisis directement dans le mini flashbook.", pick: "Choisir mon flash", picking: "Le hasard choisit…", result: "Ton random pick", again: "Relancer", browse: "Ouvrir le mini flashbook", customRequest: "Une idée en tête ? Parlons-en", miniTitle: "Mini flashbook", miniSubtitle: "Touche un flash pour le sélectionner.", close: "Fermer le mini flashbook" },
  en: { back: "Back to categories", eyebrow: "Random pick", title: "Walk-ins", intro: "One flash, chosen by chance. Start the draw or choose directly from the mini flashbook.", pick: "Pick my flash", picking: "Chance is choosing…", result: "Your random pick", again: "Pick again", browse: "Open the mini flashbook", customRequest: "Have an idea? Let’s talk", miniTitle: "Mini flashbook", miniSubtitle: "Tap a flash to select it.", close: "Close the mini flashbook" },
  de: { back: "Zurück zu den Kategorien", eyebrow: "Random Pick", title: "Walk-ins", intro: "Ein Flash, vom Zufall gewählt. Starte die Auswahl oder wähle direkt im Mini-Flashbook.", pick: "Flash auswählen", picking: "Der Zufall entscheidet…", result: "Dein Random Pick", again: "Neu ziehen", browse: "Mini-Flashbook öffnen", customRequest: "Eine eigene Idee? Lass uns reden", miniTitle: "Mini-Flashbook", miniSubtitle: "Tippe auf ein Flash, um es auszuwählen.", close: "Mini-Flashbook schließen" },
  es: { back: "Volver a las categorías", eyebrow: "Random pick", title: "Walk-ins", intro: "Un flash elegido al azar. Inicia el sorteo o elige directamente en el mini flashbook.", pick: "Elegir mi flash", picking: "El azar está eligiendo…", result: "Tu random pick", again: "Volver a elegir", browse: "Abrir el mini flashbook", customRequest: "¿Tienes una idea? Hablemos", miniTitle: "Mini flashbook", miniSubtitle: "Toca un flash para seleccionarlo.", close: "Cerrar el mini flashbook" },
};

const heroCopy: Record<Locale, { title: string; intro: string; pick: string; browse: string; view: string }> = {
  fr: { title: "Trouve ton flash", intro: "Laisse le hasard choisir ton mini flash. Ou explore tous les dessins pour trouver le tien.", pick: "Tire un flash", browse: "Voir tous les flashs", view: "Découvrir ce flash" },
  en: { title: "Find your flash", intro: "Let chance choose your mini flash. Or explore all the designs to find your own.", pick: "Draw a flash", browse: "Explore all flashes", view: "View this flash" },
  de: { title: "Finde dein Flash", intro: "Lass den Zufall dein Mini-Flash wählen. Oder entdecke alle Motive und wähle selbst.", pick: "Flash ziehen", browse: "Alle Flashs entdecken", view: "Dieses Flash ansehen" },
  es: { title: "Encuentra tu flash", intro: "Deja que el azar elija tu mini flash. O explora todos los diseños para encontrar el tuyo.", pick: "Sortea un flash", browse: "Ver todos los flashs", view: "Ver este flash" },
};

export default function WalkinSection({ onOverlayChange, onSelectMini, children }: {
  onOverlayChange?: (open: boolean) => void;
  onSelectMini: (index: number, origin?: FlashOrigin) => void;
  children: ReactNode;
}) {
  const { locale } = useTranslation();
  const reduceMotion = useReducedMotion();
  const content = copy[locale];
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);

  useEffect(() => {
    onOverlayChange?.(isCustomRequestOpen);
  }, [isCustomRequestOpen, onOverlayChange]);


  return (
    <div className={`${neueMontrealRegular.className} min-h-[100dvh] w-full max-w-full overflow-x-clip bg-[#e9ecf0] text-[#202020]`}>

      <section id="draw" className="relative overflow-hidden bg-white text-[#202020]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-140px)] w-full max-w-[1180px] flex-col px-6 pb-2 pt-[max(64px,env(safe-area-inset-top))] sm:px-9 lg:min-h-[100dvh] lg:pt-[max(76px,env(safe-area-inset-top))] lg:pb-12 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
        <motion.header initial={reduceMotion ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 pb-3 lg:pb-0">
          <h1 className={`${framaBlack.className} text-[#e70101] text-[clamp(2.65rem,10vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.055em]`}>{heroCopy[locale].title}</h1>
          <p className="mt-4 max-w-md text-[12px] leading-relaxed text-[#686b70] sm:text-sm">{heroCopy[locale].intro}</p>
        </motion.header>

        <div className="flex flex-1 flex-col items-center justify-center lg:min-h-[620px]">
          <div className="relative w-full">
            <RandomPick onSelectMini={onSelectMini} labels={{ pick: heroCopy[locale].pick, again: content.again, picking: content.picking, view: heroCopy[locale].view, result: content.result }} />
            <div className="mx-auto w-full max-w-[300px]">


            </div>
          </div>
        </div>
        </div>
      </section>

      {children}

      <BookingSheet open={isCustomRequestOpen} onClose={() => setIsCustomRequestOpen(false)} />
    </div>
  );
}
