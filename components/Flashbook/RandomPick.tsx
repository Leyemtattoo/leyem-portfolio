"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { miniFlashDesigns, miniFlashName, miniFlashStyle, type FlashOrigin } from "./miniFlashes";
import styles from "./RandomPick.module.css";

const count = 10;
const modulo = (value: number, size: number) => ((value % size) + size) % size;
const copy = {
  fr: { hint: "Glisse pour explorer · touche pour découvrir", previous: "Flash précédent", next: "Flash suivant", flip: "Avancer le flash" },
  en: { hint: "Swipe to explore · tap to explore", previous: "Previous flash", next: "Next flash", flip: "Bring flash forward" },
  de: { hint: "Wischen zum Entdecken · Tippen zum Entdecken", previous: "Vorheriges Flash", next: "Nächstes Flash", flip: "Flash hervorholen" },
  es: { hint: "Desliza para explorar · toca para descubrir", previous: "Flash anterior", next: "Flash siguiente", flip: "Acercar el flash" },
};

export default function RandomPick({ onSelectMini, labels }: {
  onSelectMini: (index: number, origin?: FlashOrigin) => void;
  labels: { pick: string; again: string; picking: string; view: string; result: string };
}) {
  const reducedMotion = useReducedMotion();
  const { locale } = useTranslation();
  const text = copy[locale];
  const [deck, setDeck] = useState(() => Array.from({ length: count }, (_, i) => modulo(i - 1, miniFlashDesigns.length)));
  const [step, setStep] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [coastDuration, setCoastDuration] = useState(850);

  const [picking, setPicking] = useState(false);
  const [intro, setIntro] = useState(false);
  const [hasPicked, setHasPicked] = useState(false);
  const busy = useRef(false);
  const gesture = useRef({ x: 0, y: 0, moved: false, pointerId: -1, lastX: 0, lastTime: 0, velocity: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSlot = modulo(step, count);
  const selected = deck[selectedSlot];
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let secondFrame = 0;
    let finish: ReturnType<typeof setTimeout> | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        busy.current = true;
        setIntro(true);
        setPicking(true);
        setStep(count * 2);
        finish = setTimeout(() => {
          setIntro(false);
          setPicking(false);
          busy.current = false;
        }, 1100);
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(finish);
      busy.current = false;
    };
  }, []);

  function turn(delta: number) {
    if (busy.current) return;
    setStep((value) => value + delta);
  }

  function pick() {
    if (busy.current) return;
    const values = new Uint32Array(2);
    crypto.getRandomValues(values);
    const winner = (selected + 1 + values[0] % (miniFlashDesigns.length - 1)) % miniFlashDesigns.length;
    const target = step + count * 2 + 1 + values[1] % (count - 1);
    const slot = modulo(target, count);
    setDeck(Array.from({ length: count }, (_, i) => modulo(winner + (i - slot), miniFlashDesigns.length)));
    setHasPicked(true);
    setStep(target);
    if (reducedMotion) return;
    busy.current = true;
    setPicking(true);
    timer.current = setTimeout(() => { setPicking(false); busy.current = false; }, 1800);
  }

  return (
    <div className={styles.pick}>
      <div className={styles.stage} role="group" aria-label={labels.view}
        onPointerDown={(event) => {
          if (busy.current || gesture.current.pointerId !== -1) return;
          gesture.current = { x: event.clientX, y: event.clientY, moved: false, pointerId: event.pointerId, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 };
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (gesture.current.pointerId !== event.pointerId) return;
          const elapsed = event.timeStamp - gesture.current.lastTime;
          if (elapsed > 0) {
            gesture.current.velocity = (event.clientX - gesture.current.lastX) / elapsed;
            gesture.current.lastX = event.clientX;
            gesture.current.lastTime = event.timeStamp;
          }
          const dx = event.clientX - gesture.current.x;
          const dy = event.clientY - gesture.current.y;
          if (!gesture.current.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            gesture.current.moved = true;
            setDragging(true);
          }
          if (gesture.current.moved) setDragOffset(dx / 100);
        }}
        onPointerUp={(event) => {
          if (gesture.current.pointerId !== event.pointerId) return;
          if (gesture.current.moved) {
            const dx = event.clientX - gesture.current.x;
            const velocity = event.timeStamp - gesture.current.lastTime < 100 ? gesture.current.velocity : 0;
            const momentum = reducedMotion ? 0 : Math.max(-1200, Math.min(1200, velocity * 320));
            const projected = dx + momentum;
            const cards = -Math.sign(projected || dx) * Math.max(1, Math.round(Math.abs(projected) / 100));
            setCoastDuration(reducedMotion ? 0 : Math.min(2200, 650 + Math.abs(momentum) * 1.2));
            turn(cards);
          }
          gesture.current.pointerId = -1;
          setDragOffset(0);
          setDragging(false);
        }}
        onPointerCancel={() => {
          gesture.current.pointerId = -1;
          gesture.current.moved = true;
          setDragOffset(0);
          setDragging(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            turn(event.key === "ArrowRight" ? 1 : -1);
          }
        }}>
        <div className={styles.scene}>
        <div className={`${styles.ring} ${intro ? styles.intro : picking ? styles.drawing : ""}`} style={{ transform: `translateZ(calc(-1 * var(--radius))) rotateY(${(-step + dragOffset) * 36}deg)`, transition: dragging ? "none" : intro || picking ? undefined : `transform ${coastDuration}ms cubic-bezier(.12,.72,.18,1)` }}>
          {deck.map((design, slot) => {
            const active = selectedSlot === slot;
            return <div key={slot} className={styles.slot} style={{ transform: `rotateY(${slot * 36}deg) translateZ(var(--radius))` }}>
              <div className={styles.card}>
                <span aria-hidden="true" className={`${styles.title} ${active ? styles.activeTitle : ""}`}>{miniFlashName(design)}</span>
                <button type="button" className={styles.front} style={miniFlashStyle(design)}
                  tabIndex={active && !picking ? 0 : -1} disabled={picking}
                  aria-hidden={!active} aria-label={`${labels.view} · ${miniFlashName(design)}`}
                  aria-current={active ? "true" : undefined}
                  onClick={(event) => {
                    if (gesture.current.moved) return;
                    if (!active) { const distance = modulo(slot - selectedSlot + 5, count) - 5; turn(distance); }
                    else {
                      if (busy.current) return;
                      if (reducedMotion) { onSelectMini(design); return; }
                      const rect = event.currentTarget.getBoundingClientRect();
                      onSelectMini(design, { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
                    }
                  }}>
                </button>
                <div className={styles.back} aria-hidden="true" />
              </div>
            </div>;
          })}
        </div>
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => turn(-1)} disabled={picking} aria-label={text.previous}>←</button>
        <button type="button" onClick={pick} disabled={picking} className={styles.hand}
          aria-label={picking ? labels.picking : hasPicked ? labels.again : labels.pick}>
          <svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v3.2c0 4.1-2.5 6.3-6.2 6.3h-1.4c-2.1 0-3.4-.8-4.6-2.4l-3.1-4.2a1.55 1.55 0 0 1 2.4-1.95L9 14.1Z" />
          </svg>
        </button>
        <button type="button" className={styles.arrow} onClick={() => turn(1)} disabled={picking} aria-label={text.next}>→</button>
      </div>
      <p className={styles.status} role="status">{picking ? labels.picking : hasPicked ? `${labels.result} · ${miniFlashName(selected)}` : labels.pick}</p>
    </div>
  );
}
