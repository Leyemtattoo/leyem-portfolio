"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import BookingSheet from "@/components/booking/BookingSheet";
import styles from "./HomeMenu.module.css";
import SiteFooter from "@/components/ui/SiteFooter";

const copy = {
  fr: { explore: "Explorer mon univers", scroll: "Fais défiler pour explorer", open: "Découvrir", about: "À PROPOS", book: "RENDEZ-VOUS", close: "Fermer", previous: "Rubrique précédente", next: "Rubrique suivante", descriptions: ["L’artiste derrière les images.", "Des dessins à faire vivre sur ta peau.", "De la peau au papier. Collection à venir.", "Ton idée. Un projet à créer ensemble."], bio: "Tatoueur spécialisé en réalisme graphique et lignes fines, je crée des pièces uniques inspirées de votre histoire, de votre corps et de vos idées." },
  en: { explore: "Explore my world", scroll: "Scroll to explore", open: "Explore", about: "ABOUT", book: "BOOKING", close: "Close", previous: "Previous section", next: "Next section", descriptions: ["The artist behind the images.", "Drawings to bring to life on your skin.", "From skin to paper. Collection coming soon.", "Your idea. A project we create together."], bio: "Specializing in graphic realism and fine lines, I create unique tattoos inspired by your story, your body and your ideas." },
  de: { explore: "Entdecke meine Welt", scroll: "Scrollen und entdecken", open: "Entdecken", about: "ÜBER MICH", book: "TERMIN", close: "Schließen", previous: "Vorheriger Bereich", next: "Nächster Bereich", descriptions: ["Der Künstler hinter den Bildern.", "Zeichnungen, die auf deiner Haut leben.", "Von der Haut aufs Papier. Kollektion folgt.", "Deine Idee. Unser gemeinsames Projekt."], bio: "Ich bin auf grafischen Realismus und feine Linien spezialisiert und gestalte einzigartige Tattoos, inspiriert von deiner Geschichte, deinem Körper und deinen Ideen." },
  es: { explore: "Explora mi universo", scroll: "Desliza para explorar", open: "Descubrir", about: "SOBRE MÍ", book: "RESERVAR", close: "Cerrar", previous: "Sección anterior", next: "Sección siguiente", descriptions: ["El artista detrás de las imágenes.", "Dibujos para dar vida en tu piel.", "De la piel al papel. Colección próximamente.", "Tu idea. Un proyecto para crear juntos."], bio: "Especializado en realismo gráfico y líneas finas, creo tatuajes únicos inspirados en tu historia, tu cuerpo y tus ideas." },
};

export default function HomeMenu() {
  const { locale } = useTranslation();
  const text = copy[locale];
  const labels = [text.about, "FLASH", text.book, "SHOP"];
  const descriptions = [text.descriptions[0], text.descriptions[1], text.descriptions[3], text.descriptions[2]];
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const configureBackground = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
  }, []);
  const [videoBlocked, setVideoBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLButtonElement>(null);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const positionRef = useRef(1);
  const [position, setPosition] = useState(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [introPosition, setIntroPosition] = useState<number | null>(null);
  const introFrame = useRef(0);
  const introCancelled = useRef(false);
  const active = Math.max(0, Math.min(labels.length - 1, Math.round(position)));

  function stopIntro() {
    introCancelled.current = true;
    cancelAnimationFrame(introFrame.current);
    setIntroPosition(null);
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    introCancelled.current = false;
    void document.fonts.ready.then(() => {
      if (disposed || introCancelled.current) return;
      let started: number | undefined;
      const tick = (now: number) => {
        if (disposed || introCancelled.current) return;
        started ??= now;
        const progress = Math.min(1, (now - started) / 900);
        // Ease velocity and acceleration to zero at both ends and at the turn.
        const leg = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        const eased = leg * leg * leg * (leg * (leg * 6 - 15) + 10);
        const next = 1 + 0.72 * eased;
        setIntroPosition(progress < 1 ? next : null);
        if (progress < 1) introFrame.current = requestAnimationFrame(tick);
      };
      introFrame.current = requestAnimationFrame(tick);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(introFrame.current);
    };
  }, []);

  useEffect(() => {
    const viewport = scrollRef.current;
    const row = rowRef.current;
    if (!viewport || !row) return;
    const navigation = viewport.parentElement;
    const update = () => {
      viewport.style.setProperty("--scroll-padding", `${Math.max(0, (viewport.clientHeight - row.offsetHeight) / 2)}px`);
      viewport.scrollTop = Math.round(positionRef.current) * row.offsetHeight;
    };
    const resize = new ResizeObserver(update);
    resize.observe(viewport);
    resize.observe(row);
    if (navigation) resize.observe(navigation);
    update();
    return () => resize.disconnect();
  }, []);

  function playBackground() {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    void video.play().then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true));
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const resume = () => {
      if (!document.hidden) playBackground();
    };
    playBackground();
    video.addEventListener("canplay", resume);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", resume);
    document.addEventListener("touchstart", resume, { passive: true });
    document.addEventListener("pointerdown", resume, { passive: true });
    return () => {
      video.removeEventListener("canplay", resume);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", resume);
      document.removeEventListener("touchstart", resume);
      document.removeEventListener("pointerdown", resume);
    };
  }, []);

  function select(index: number) {
    if (!scrollRef.current || !rowRef.current) return;
    scrollRef.current.scrollTo({ top: Math.max(0, Math.min(labels.length - 1, index)) * rowRef.current.offsetHeight, behavior: reducedMotion ? "instant" : "smooth" });
  }

  function open(index: number) {
    if (index === 0) aboutRef.current?.showModal();
    if (index === 1) router.push("/flashbook");
  }

  return (
    <main className={`${styles.home} ${neueMontrealRegular.className}`} onPointerDownCapture={stopIntro} onTouchStartCapture={stopIntro} onWheelCapture={stopIntro} onKeyDownCapture={stopIntro}>
      <video
        ref={configureBackground}
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={playBackground}
        poster="/images/home-cat-v3.jpg"
        aria-hidden="true"
      >
        <source src="/videos/home-cat-v3.mp4" type="video/mp4" />
      </video>
      {videoBlocked && <button type="button" className={styles.playVideo} onClick={playBackground} aria-label={{ fr: "Lire la vidéo", en: "Play video", de: "Video abspielen", es: "Reproducir vídeo" }[locale]}>▶</button>}
      <header className={styles.header}>
        <h1 className={`${styles.brand} ${framaBlack.className}`}>clempope</h1>
        <LanguageSwitcher appearance="light" animateOnMount={false} />
      </header>

      <nav className={styles.navigation} aria-label={text.explore}>
        {introPosition !== null && (
          <div className={styles.introReel} aria-hidden="true">
            {Array.from({ length: 7 }, (_, offset) => {
              const index = Math.floor(introPosition) + offset - 3;
              const label = labels[((index % labels.length) + labels.length) % labels.length];
              const distance = index - introPosition;
              return (
                <div key={index} className={`${styles.item} ${styles.introRow}`} style={{
                  top: `calc(50% + ${distance} * var(--row))`,
                  fontSize: `clamp(30px, ${Math.min(15, 90 / label.length)}vw, 112px)`,
                  opacity: Math.max(0, 1 - Math.abs(distance) * .62),
                }}>
                  <span style={{ transform: `perspective(650px) rotateX(${Math.max(-72, Math.min(72, distance * -26))}deg) scale(${1 - Math.min(Math.abs(distance), 3) * .075})` }}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
        <div ref={scrollRef} className={styles.scroller} style={{ opacity: introPosition === null ? 1 : 0 }}
          onScroll={(event) => {
            const value = event.currentTarget.scrollTop / (rowRef.current?.offsetHeight || 1);
            positionRef.current = value;
            setPosition(value);
          }}
          onKeyDown={(event) => {
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              const next = Math.max(0, Math.min(labels.length - 1, event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : active + (event.key === "ArrowDown" ? 1 : -1)));
              (scrollRef.current?.children[next] as HTMLButtonElement | undefined)?.focus({ preventScroll: true });
              select(next);
            }
          }}>
          {labels.map((label, index) => {
            const distance = index - position;
            const magnitude = Math.min(Math.abs(distance), 3);
            return (
              <button ref={index === 0 ? rowRef : undefined} key={index} type="button"
                className={styles.item} aria-disabled={index >= 2 ? true : undefined} aria-current={index === active && index < 2 ? "true" : undefined}
                style={{ fontSize: `clamp(30px, ${Math.min(15, 90 / label.length)}vw, 112px)` }}
                onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) select(index); }} onClick={() => open(index)}>
                <span style={{
                  opacity: index >= 2 ? .24 : Math.max(.12, 1 - magnitude * .62),
                  transform: reducedMotion ? undefined : `perspective(650px) rotateX(${Math.max(-72, Math.min(72, distance * -26))}deg) scale(${1 - magnitude * .075})`,
                }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className={styles.details}>
        <p key={`${locale}-${active}`}>{descriptions[active]}</p>
      </div>
      <SiteFooter compact />


      <dialog ref={aboutRef} className={styles.about} aria-labelledby="about-title" onClick={(event) => { if (event.target === event.currentTarget) aboutRef.current?.close(); }}>
        <button type="button" className={styles.close} aria-label={text.close} onClick={() => aboutRef.current?.close()}>×</button>
        <video autoPlay={!reducedMotion} muted loop playsInline poster="/images/about/leyem-poster.jpg" className={styles.portrait}><source src="/videos/about-leyem-dark.mp4" type="video/mp4" /></video>
        <div className={styles.bio}><h2 id="about-title" className={framaBlack.className}>clempope</h2><p>{text.bio}</p></div>
      </dialog>
      <BookingSheet open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}
