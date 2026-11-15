"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BookingSheet from "@/components/booking/BookingSheet";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { miniFlashDesigns, miniFlashName, miniFlashPrice, miniFlashStyle, type FlashOrigin } from "./miniFlashes";
import styles from "./MiniFlashDialog.module.css";

const copy = {
  fr: { close: "Fermer", book: "Demander ce flash", size: "Taille d’une carte", note: "Placement et prix final à confirmer ensemble." },
  en: { close: "Close", book: "Request this flash", size: "Card-sized", note: "Placement and final price to be confirmed together." },
  de: { close: "Schließen", book: "Dieses Flash anfragen", size: "Kartengröße", note: "Platzierung und endgültigen Preis besprechen wir gemeinsam." },
  es: { close: "Cerrar", book: "Solicitar este flash", size: "Tamaño de una carta", note: "Ubicación y precio final a confirmar juntos." },
};

export default function MiniFlashDialog({ index, onClose, origin = null }: { index: number | null; onClose: () => void; origin?: FlashOrigin | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const openingAnimations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [viewport, setViewport] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  useEffect(() => {
    const update = () => {
      const visible = window.visualViewport;
      setViewport({ width: visible?.width ?? window.innerWidth, height: visible?.height ?? window.innerHeight, left: visible?.offsetLeft ?? 0, top: visible?.offsetTop ?? 0 });
    };
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);
  const { locale } = useTranslation();
  const text = copy[locale];
  const minimumCm = miniFlashDesigns[index ?? 0]?.minimumCm;
  const maximumCm = miniFlashDesigns[index ?? 0]?.maximumCm;
  const sizeLabel = maximumCm ? `${maximumCm} cm max` : minimumCm ? `${{ fr: "Dès", en: "From", de: "Ab", es: "Desde" }[locale]} ${minimumCm} cm` : text.size;
  function closeWithZoom() {
    if (closing.current) return;
    const [zoom, ...details] = openingAnimations.current;
    if (!zoom || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onClose(); return; }
    closing.current = true;
    dialog.current?.setAttribute("data-closing", "true");
    zoom.onfinish = onClose;
    details.forEach((animation) => animation.reverse());
    zoom.reverse();
  }
  useEffect(() => {
    const element = dialog.current;
    if (index === null || bookingOpen) { element?.close(); return; }
    element?.showModal();
    // Focus the dialog itself on opening rather than highlighting the close button.
    element?.focus({ preventScroll: true });
    closing.current = false;
    element?.removeAttribute("data-closing");
    const animations: Animation[] = [];
    if (element && origin && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const target = element.getBoundingClientRect();
      const picture = element.querySelector<HTMLElement>("[data-flash-picture]");
      const image = picture?.getBoundingClientRect() ?? target;
      const scale = origin.width / image.width;
      const scaleY = origin.height / image.height;
      const centerX = target.left + target.width / 2;
      const centerY = target.top + target.height / 2;
      const x = origin.left + origin.width / 2 - (centerX + (image.left + image.width / 2 - centerX) * scale);
      const y = origin.top + origin.height / 2 - (centerY + (image.top + image.height / 2 - centerY) * scaleY);
      const inset = `${image.top - target.top}px ${target.right - image.right}px ${target.bottom - image.bottom}px ${image.left - target.left}px`;
      animations.push(element.animate([
        { transform: `translate(${x}px, ${y}px) scale(${scale}, ${scaleY})`, clipPath: `inset(${inset} round ${9 / scale}px)` },
        { transform: "translate(0, 0) scale(1)", clipPath: "inset(0px round 24px)" },
      ], { duration: 650, fill: "both", easing: "cubic-bezier(.3,.65,.2,1)" }));
      element.querySelectorAll<HTMLElement>("[data-flash-info]").forEach((info) => {
        animations.push(info.animate([
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 300, delay: 300, fill: "both", easing: "ease-out" }));
      });
    }
    const previous = document.body.style.overflow;
    openingAnimations.current = animations;
    document.body.style.overflow = "hidden";
    return () => { animations.forEach((animation) => animation.cancel()); openingAnimations.current = []; closing.current = false; element?.removeAttribute("data-closing"); element?.close(); document.body.style.overflow = previous; };
  }, [index, bookingOpen, origin]);
  return (
    <>
      <dialog ref={dialog} tabIndex={-1} style={viewport ? {
        width: Math.min(380, viewport.width - 32),
        height: Math.min(760, viewport.height - 48),
        left: viewport.left + viewport.width / 2 - Math.min(380, viewport.width - 32) / 2,
        top: viewport.top + viewport.height / 2 - Math.min(760, viewport.height - 48) / 2,
        right: "auto", bottom: "auto", margin: 0,
      } : undefined} aria-labelledby="mini-flash-title" onCancel={(event) => { event.preventDefault(); closeWithZoom(); }} onClick={(event) => { if (event.target === event.currentTarget) closeWithZoom(); }} className={`${styles.dialog} fixed inset-0 m-auto w-[min(380px,calc(100vw-32px))] rounded-3xl border-0 bg-[#fffaf1] text-[#171717]`}>
        <div data-flash-info className="flex items-center justify-between">
          <div>
            <h2 id="mini-flash-title" className="font-mono text-sm text-[#e70101]">{miniFlashName(index ?? 0)}</h2>
            <p className="mt-1 text-xs text-black/60"><span className="font-semibold text-[#e70101]">{miniFlashPrice(index ?? 0, locale)}</span><span aria-hidden="true"> · </span>{sizeLabel}</p>
          </div>
          <button type="button" aria-label={text.close} onClick={closeWithZoom} className="grid size-11 place-items-center rounded-full text-black/35 outline-none transition-colors hover:text-black/70 focus-visible:ring-1 focus-visible:ring-[#e70101]/40">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className={styles.pictureSpace}>{index !== null && <div data-flash-picture role="img" aria-label={miniFlashName(index)} className={`${styles.picture} rounded-2xl bg-no-repeat`} style={miniFlashStyle(index)} />}</div>
        <p data-flash-info className="text-sm text-black/60">{text.note}</p>
        <div data-flash-info className="grid gap-2">
        <Link href={`/studio?mini=${index ?? 0}`} onClick={() => { try { sessionStorage.setItem("flashbook-gallery-return", JSON.stringify({ scroll: window.scrollY })); } catch {} }} className="flex h-11 items-center justify-center rounded-full border border-[#e70101]/25 text-sm text-[#e70101]">{{ fr: "Essayer sur le corps", en: "Try on your body", de: "Am Körper ausprobieren", es: "Probar en el cuerpo" }[locale]}</Link>
        <button type="button" onClick={() => setBookingOpen(true)} className="h-12 w-full rounded-full bg-[#e70101] px-4 text-sm text-white">{text.book}</button>
        </div>
      </dialog>
      <BookingSheet open={bookingOpen} onClose={() => { setBookingOpen(false); onClose(); }} flashTitle={miniFlashName(index ?? 0)} />
    </>
  );
}
