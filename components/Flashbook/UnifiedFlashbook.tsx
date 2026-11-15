"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { neueMontrealRegular } from "@/app/fonts";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import FlashbookBook from "./FlashbookBook";
import WalkinSection from "./WalkinSection";
import MiniFlashDialog from "./MiniFlashDialog";
import type { FlashOrigin } from "./miniFlashes";
import SiteFooter from "@/components/ui/SiteFooter";

const copy = {
  fr: { home: "Retour à l’accueil" },
  en: { home: "Back home" },
  de: { home: "Zurück zur Startseite" },
  es: { home: "Volver al inicio" },
};

export default function UnifiedFlashbook() {
  const { locale } = useTranslation();
  const text = copy[locale];
  const params = useSearchParams();
  const selected = Number(params.get("selected"));
  const initialSelectedTest = ([1, 2, 3, 4] as const).find((design) => design === selected);
  const [flashOrigin, setFlashOrigin] = useState<FlashOrigin | null>(null);
  function selectMini(index: number, origin?: FlashOrigin) {
    setFlashOrigin(origin ?? null);
    setSelectedMini(index);
  }
  const [selectedMini, setSelectedMini] = useState<number | null>(null);
  const [flashExpanded, setFlashExpanded] = useState(false);
  const [walkinExpanded, setWalkinExpanded] = useState(false);

  useEffect(() => {
    const gallery = document.getElementById("designs");
    if (!gallery) return;
    let start: { x: number; y: number } | null = null;
    const onStart = (event: TouchEvent) => {
      start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const onMove = (event: TouchEvent) => {
      if (!start || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;
      if (Math.abs(dx) > Math.abs(dy) && event.cancelable) event.preventDefault();
    };
    gallery.addEventListener("touchstart", onStart, { passive: true });
    gallery.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      gallery.removeEventListener("touchstart", onStart);
      gallery.removeEventListener("touchmove", onMove);
    };
  }, []);

  return (
    <main className={`${neueMontrealRegular.className} min-h-dvh w-full max-w-full overflow-x-clip bg-[#e9ecf0] text-[#202020]`}>
      <div>
          <Link href="/" aria-label={text.home} title={text.home} style={{ top: "max(12px, env(safe-area-inset-top))" }} className={`fixed left-2 z-[60] inline-flex size-11 items-center justify-center rounded-full bg-[#fffaf1]/70 text-[#686b70] backdrop-blur transition-colors hover:text-[#e70101] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#e70101] ${flashExpanded || walkinExpanded || selectedMini !== null ? "invisible pointer-events-none" : ""}`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m6-6-6 6 6 6" />
            </svg>
          </Link>
      </div>
      <WalkinSection onOverlayChange={setWalkinExpanded} onSelectMini={selectMini}>
        <div id="designs" className="w-full min-w-0 max-w-full overflow-x-clip [touch-action:pan-y_pinch-zoom] [overscroll-behavior-x:none]" style={{ scrollMarginTop: 84 }}>
          <FlashbookBook embedded onSelectMini={selectMini} onFullscreenChange={setFlashExpanded} initialSelectedTest={initialSelectedTest} />
        </div>
      </WalkinSection>
      <SiteFooter />
      <MiniFlashDialog origin={flashOrigin} index={selectedMini} onClose={() => setSelectedMini(null)} />
    </main>
  );
}
