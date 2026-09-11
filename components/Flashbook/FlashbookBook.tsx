"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import BookingSheet from "@/components/booking/BookingSheet";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { framaBlack } from "@/app/fonts";

const mannequinTransition = "/videos/mannequin-transition.mp4";
const mannequinTransition2 = "/videos/mannequin-transition-2.mp4";
const mannequinTransitionReverse = "/videos/mannequin-transition-reverse.mp4";
const mannequinTransition2Reverse = "/videos/mannequin-transition-2-reverse.mp4";
const maleMannequin = "/videos/mannequin-male.mp4";
const maleMannequinReverse = "/videos/mannequin-male-reverse.mp4";
const maleMannequinTransition2 = "/videos/mannequin-male-transition-2.mp4";
const maleMannequinTransition2Reverse = "/videos/mannequin-male-transition-2-reverse.mp4";

type BodyArea = "torso" | "arm" | "forearm" | "thigh" | "leg";
type TorsoVariant = "center" | "high" | "middle" | "low";
type TestNumber = 1 | 2 | 3 | 4;
type FlashTheme = "realism" | "blackwork" | "ornamental" | "erotic";

const BODY_AREAS: BodyArea[] = ["torso", "arm", "forearm", "thigh", "leg"];
const TORSO_VARIANTS: TorsoVariant[] = ["center", "high", "middle", "low"];
const BACK_TORSO_VARIANTS: TorsoVariant[] = ["center", "high", "low"];
const TORSO_VARIANT_POSITION: Record<TorsoVariant, number> = {
  center: -2,
  high: 5,
  middle: -3,
  low: -15,
};

const testOneMaleTorsoVariant = (variant: TorsoVariant) => {
  const variantName = variant === "center" ? "centre" : variant === "high" ? "haut" : variant === "middle" ? "milieu" : "bas";
  return `/images/flashbook/placements/test-01/male/test-01-homme-face-torse-${variantName}-v2.webp`;
};

const testOneMaleBackTorsoVariant = (variant: TorsoVariant) => {
  const variantName = variant === "center" ? "centre" : variant === "high" ? "haut" : "bas";
  return `/images/flashbook/placements/test-01/male/test-01-homme-dos-torse-${variantName}-v2.webp`;
};

const flashImages: Record<TestNumber, string> = {
  1: "/images/flashbook/TEST-01-transparent.png",
  2: "/images/flashbook/TEST-02.webp",
  3: "/images/flashbook/TEST-03.webp",
  4: "/images/flashbook/TEST-04.webp",
};

const testPlacement = (testNumber: TestNumber, gender: "female" | "male", view: "face" | "side" | "back", area: BodyArea) => {
  const testName = String(testNumber).padStart(2, "0");
  const viewName = view === "side" ? "cote" : view === "back" ? "dos" : "face";
  const areaName = area === "forearm" ? "avant-bras" : area === "thigh" ? "cuisse" : area === "leg" ? "jambe" : area === "arm" ? "bras" : "torse";
  const genderName = gender === "female" ? "femme" : "homme";
  const assetVersion = testNumber === 1 ? "-v2" : "";
  return `/images/flashbook/placements/test-${testName}/${gender}/test-${testName}-${genderName}-${viewName}-${areaName}${assetVersion}.webp`;
};

const placementDetails: Record<BodyArea, { size: string; price: number; duration: string }> = {
  torso: { size: "20 – 24 cm", price: 480, duration: "3 h 30 – 4 h 30" },
  arm: { size: "16 – 20 cm", price: 360, duration: "2 h 30 – 3 h 30" },
  forearm: { size: "15 – 19 cm", price: 320, duration: "2 h – 3 h" },
  thigh: { size: "20 – 25 cm", price: 450, duration: "3 h – 4 h" },
  leg: { size: "18 – 22 cm", price: 390, duration: "2 h 30 – 3 h 30" },
};

const flashCatalog: Record<TestNumber, { theme: FlashTheme; price: number; placement: BodyArea }> = {
  1: { theme: "realism", price: 480, placement: "torso" },
  2: { theme: "blackwork", price: 320, placement: "forearm" },
  3: { theme: "ornamental", price: 390, placement: "leg" },
  4: { theme: "erotic", price: 450, placement: "thigh" },
};

const themeLabelKeys: Record<FlashTheme, "flashbook.themeRealism" | "flashbook.themeBlackwork" | "flashbook.themeOrnamental" | "flashbook.themeErotic"> = {
  realism: "flashbook.themeRealism",
  blackwork: "flashbook.themeBlackwork",
  ornamental: "flashbook.themeOrnamental",
  erotic: "flashbook.themeErotic",
};

export default function FlashbookBook({
  onFullscreenChange,
  initialSelectedTest,
}: {
  onFullscreenChange?: (fullscreen: boolean) => void;
  initialSelectedTest?: TestNumber;
}) {
  const mannequinTransitionRef = useRef<HTMLVideoElement>(null);
  const mannequinTransition2Ref = useRef<HTMLVideoElement>(null);
  const maleMannequinRef = useRef<HTMLVideoElement>(null);
  const maleMannequinTransition2Ref = useRef<HTMLVideoElement>(null);
  const maleReverseVideoRef = useRef<HTMLVideoElement>(null);
  const reverseTransitionRef = useRef<HTMLVideoElement>(null);
  const reversePreloadRefs = useRef<HTMLVideoElement[]>([]);
  const reverseSwapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const designPlayFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardsScrollerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(initialSelectedTest));
  const [activeMannequinVideo, setActiveMannequinVideo] = useState<0 | 1 | 2>(0);
  const [isDesignToFaceTransitioning, setIsDesignToFaceTransitioning] = useState(false);
  const [isDesignTransitionVisible, setIsDesignTransitionVisible] = useState(false);
  const [reverseTransition, setReverseTransition] = useState<"to-face" | "to-side" | null>(null);
  const [maleReverseTransition, setMaleReverseTransition] = useState<"to-face" | "to-side" | null>(null);
  const [isReverseVideoVisible, setIsReverseVideoVisible] = useState(false);
  const [isFemaleTransitionPlaying, setIsFemaleTransitionPlaying] = useState(false);
  const [isMaleTransitionPlaying, setIsMaleTransitionPlaying] = useState(false);
  const [selectedMannequinView, setSelectedMannequinView] = useState<"design" | "face" | "side" | "back" | null>(initialSelectedTest ? "design" : null);
  const [mannequinGender, setMannequinGender] = useState<"female" | "male">("female");
  const [selectedBodyArea, setSelectedBodyArea] = useState<BodyArea>("torso");
  const [selectedTorsoVariant, setSelectedTorsoVariant] = useState<TorsoVariant>("center");
  const [selectedTest, setSelectedTest] = useState<TestNumber>(initialSelectedTest ?? 1);
  const [themeFilter, setThemeFilter] = useState<"all" | FlashTheme>("all");
  const [isFlashBookingOpen, setIsFlashBookingOpen] = useState(false);
  const [, setIsInfoPanelOpen] = useState(false);
  const [isFullscreenInfoOpen, setIsFullscreenInfoOpen] = useState(false);
  const [hasOpenedFullscreenInfo, setHasOpenedFullscreenInfo] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();
  useLayoutEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    if (!isFullscreen || activeMannequinVideo === 0 || hasOpenedFullscreenInfo) return;

    const timeout = setTimeout(() => {
      setHasOpenedFullscreenInfo(true);
    }, reduceMotion ? 1200 : 2800);

    return () => clearTimeout(timeout);
  }, [activeMannequinVideo, hasOpenedFullscreenInfo, isFullscreen, reduceMotion]);

  const warmVideoCache = useCallback((sources: string[]) => {
    sources.forEach((src) => {
      if (reversePreloadRefs.current.some((video) => video.src.endsWith(src))) return;
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      video.load();
      reversePreloadRefs.current.push(video);
    });
  }, []);

  const warmImageCache = useCallback((sources: string[]) => {
    sources.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      void image.decode().catch(() => undefined);
    });
  }, []);

  const openFromFullscreenIcon = (targetTest: TestNumber = selectedTest) => {
    setSelectedTest(targetTest);
    setActiveMannequinVideo(0);
    setIsDesignToFaceTransitioning(false);
    setIsDesignTransitionVisible(false);
    setReverseTransition(null);
    setIsReverseVideoVisible(false);
    setIsFemaleTransitionPlaying(false);
    setIsMaleTransitionPlaying(false);
    setSelectedMannequinView("design");
    setIsFullscreenInfoOpen(false);
    setHasOpenedFullscreenInfo(false);
    setIsFullscreen(true);
    warmVideoCache([mannequinGender === "female" ? mannequinTransition : maleMannequin]);
    warmImageCache([
      testPlacement(targetTest, mannequinGender, "face", "torso"),
    ]);
  };

  const closeFullscreen = useCallback(() => {
    maleMannequinRef.current?.pause();
    maleMannequinTransition2Ref.current?.pause();
    maleReverseVideoRef.current?.pause();
    setIsFullscreen(false);
    setActiveMannequinVideo(0);
    setIsDesignToFaceTransitioning(false);
    setIsDesignTransitionVisible(false);
    setReverseTransition(null);
    setMaleReverseTransition(null);
    setIsMaleTransitionPlaying(false);
    setIsReverseVideoVisible(false);
    setSelectedMannequinView(null);
    setIsFullscreenInfoOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      reversePreloadRefs.current.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      reversePreloadRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen || activeMannequinVideo === 0) return;

    if (mannequinGender === "female") {
      if (selectedMannequinView === "face") {
        warmVideoCache([mannequinTransitionReverse, mannequinTransition2]);
      } else if (selectedMannequinView === "side") {
        warmVideoCache([mannequinTransition2Reverse]);
      }
      return;
    }

    if (selectedMannequinView === "face") {
      warmVideoCache([maleMannequinReverse, maleMannequinTransition2]);
    } else if (selectedMannequinView === "side") {
      warmVideoCache([maleMannequinTransition2Reverse]);
    }
  }, [activeMannequinVideo, isFullscreen, mannequinGender, selectedMannequinView, warmVideoCache]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFullscreen();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeFullscreen]);

  const selectMannequinView = (view: "design" | "face" | "side" | "back") => {
    if (reverseTransition || maleReverseTransition || isFemaleTransitionPlaying || isMaleTransitionPlaying) return;

    if (view === "back" && selectedTorsoVariant === "middle") {
      setSelectedTorsoVariant("center");
    }

    if (view === "design") {
      maleMannequinRef.current?.pause();
      maleMannequinTransition2Ref.current?.pause();
      maleReverseVideoRef.current?.pause();
      mannequinTransitionRef.current?.pause();
      mannequinTransition2Ref.current?.pause();
      setIsDesignToFaceTransitioning(false);
      setIsDesignTransitionVisible(false);
      setReverseTransition(null);
      setMaleReverseTransition(null);
      setIsReverseVideoVisible(false);
      setIsFemaleTransitionPlaying(false);
      setIsMaleTransitionPlaying(false);
      setSelectedMannequinView("design");
      setActiveMannequinVideo(0);
      return;
    }

    if (mannequinGender === "male") {
      const video = maleMannequinRef.current;
      const secondVideo = maleMannequinTransition2Ref.current;

      if (selectedMannequinView === "side" && view === "face") {
        video?.pause();
        setSelectedMannequinView("face");
        setActiveMannequinVideo(1);
        setMaleReverseTransition("to-face");
        setIsMaleTransitionPlaying(true);
        return;
      }

      if (view === "face") {
        setMaleReverseTransition(null);
        video?.pause();
        if (video) video.currentTime = 0;
        setSelectedMannequinView("face");
        setActiveMannequinVideo(1);
        setIsMaleTransitionPlaying(false);
        return;
      }

      if (selectedMannequinView === "face" && view === "side") {
        setMaleReverseTransition(null);
        video?.pause();
        if (video) {
          video.currentTime = 0;
          void video.play().catch(() => undefined);
        }
        setSelectedMannequinView("side");
        setActiveMannequinVideo(1);
        setIsMaleTransitionPlaying(true);
        return;
      }

      if (selectedMannequinView === "side" && view === "back" && secondVideo) {
        setMaleReverseTransition(null);
        video?.pause();
        secondVideo.pause();
        secondVideo.currentTime = 0;
        setSelectedMannequinView("back");
        setActiveMannequinVideo(2);
        setIsMaleTransitionPlaying(true);
        void secondVideo.play().catch(() => undefined);
        return;
      }

      if (selectedMannequinView === "back" && view === "side" && secondVideo) {
        secondVideo.pause();
        setSelectedMannequinView("side");
        setActiveMannequinVideo(2);
        setMaleReverseTransition("to-side");
        setIsMaleTransitionPlaying(true);
        return;
      }

      if (view === "back" && secondVideo) {
        setMaleReverseTransition(null);
        video?.pause();
        secondVideo.pause();
        secondVideo.currentTime = secondVideo.duration || 0;
        setSelectedMannequinView("back");
        setActiveMannequinVideo(2);
        setIsMaleTransitionPlaying(false);
        return;
      }
    }

    if (selectedMannequinView === "design" && view === "face") {
      mannequinTransitionRef.current?.pause();
      mannequinTransition2Ref.current?.pause();
      setActiveMannequinVideo(1);
      setSelectedMannequinView("face");
      setIsDesignToFaceTransitioning(true);
      setIsDesignTransitionVisible(false);
      setIsFemaleTransitionPlaying(true);
      return;
    }

    if (selectedMannequinView === "back" && view === "side") {
      setIsReverseVideoVisible(false);
      setSelectedMannequinView("side");
      setReverseTransition("to-side");
      setIsFemaleTransitionPlaying(true);
      return;
    }

    if (selectedMannequinView === "side" && view === "face") {
      const video = mannequinTransitionRef.current;
      mannequinTransition2Ref.current?.pause();
      video?.pause();
      if (video) video.currentTime = 0;
      setIsReverseVideoVisible(false);
      setSelectedMannequinView("face");
      setReverseTransition("to-face");
      setIsFemaleTransitionPlaying(true);
      return;
    }

    mannequinTransitionRef.current?.pause();
    mannequinTransition2Ref.current?.pause();
    setSelectedMannequinView(view);
    setActiveMannequinVideo(view === "back" ? 2 : 1);
    setIsFemaleTransitionPlaying(true);
  };

  useEffect(() => {
    if (!reverseTransition) return;

    const video = reverseTransitionRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.playbackRate = 1;
    void video.play().catch(() => setReverseTransition(null));
  }, [reverseTransition]);

  useEffect(() => {
    if (!maleReverseTransition) return;
    const video = maleReverseVideoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.playbackRate = 1;

    const playReverseVideo = () => {
      void video.play().catch(() => {
        setIsMaleTransitionPlaying(false);
        setMaleReverseTransition(null);
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playReverseVideo();
    } else {
      video.addEventListener("canplay", playReverseVideo, { once: true });
      video.load();
    }

    return () => video.removeEventListener("canplay", playReverseVideo);
  }, [maleReverseTransition]);

  const finishMaleReverseTransition = () => {
    if (maleReverseTransition === "to-face") {
      const video = maleMannequinRef.current;
      if (video) video.currentTime = 0;
      setActiveMannequinVideo(1);
    } else if (maleReverseTransition === "to-side") {
      const video = maleMannequinRef.current;
      if (video && Number.isFinite(video.duration)) video.currentTime = video.duration;
      setActiveMannequinVideo(1);
    }
    setIsMaleTransitionPlaying(false);
    setMaleReverseTransition(null);
  };

  const showReverseTransition = () => {
    setIsReverseVideoVisible(true);
  };

  const finishReverseTransition = () => {
    let targetVideo: HTMLVideoElement | null = null;

    if (reverseTransition === "to-side") {
      targetVideo = mannequinTransition2Ref.current;
      setSelectedMannequinView("side");
      setActiveMannequinVideo(2);
    } else if (reverseTransition === "to-face") {
      targetVideo = mannequinTransitionRef.current;
      setSelectedMannequinView("face");
      setActiveMannequinVideo(1);
    }

    let didRevealTarget = false;
    const revealTarget = () => {
      if (didRevealTarget) return;
      didRevealTarget = true;
      if (reverseSwapTimeoutRef.current) {
        clearTimeout(reverseSwapTimeoutRef.current);
        reverseSwapTimeoutRef.current = null;
      }
      setIsReverseVideoVisible(false);
      reverseSwapTimeoutRef.current = setTimeout(() => {
      setReverseTransition(null);
      setIsFemaleTransitionPlaying(false);
        reverseSwapTimeoutRef.current = null;
      }, reduceMotion ? 0 : 180);
    };

    if (!targetVideo) {
      revealTarget();
      return;
    }

    targetVideo.pause();
    targetVideo.requestVideoFrameCallback(() => revealTarget());
    targetVideo.currentTime = 0.001;
    reverseSwapTimeoutRef.current = setTimeout(revealTarget, 300);
  };

  useEffect(() => {
    const firstVideo = mannequinTransitionRef.current;
    const secondVideo = mannequinTransition2Ref.current;
    if (!selectedMannequinView || reverseTransition || mannequinGender === "male") return;

    firstVideo?.pause();
    secondVideo?.pause();

    if (selectedMannequinView === "face" && firstVideo) {
      firstVideo.currentTime = 0;
      if (isDesignToFaceTransitioning) {
        if (designPlayFallbackRef.current) clearTimeout(designPlayFallbackRef.current);
        designPlayFallbackRef.current = setTimeout(() => {
          setIsDesignToFaceTransitioning(false);
          setIsDesignTransitionVisible(false);
          setIsFemaleTransitionPlaying(false);
          designPlayFallbackRef.current = null;
        }, 900);
        void firstVideo.play().catch(() => {
          if (designPlayFallbackRef.current) clearTimeout(designPlayFallbackRef.current);
          designPlayFallbackRef.current = null;
          setIsDesignToFaceTransitioning(false);
          setIsDesignTransitionVisible(false);
          setIsFemaleTransitionPlaying(false);
        });
      }
      return;
    }

    if (selectedMannequinView === "side") {
      if (activeMannequinVideo === 1 && firstVideo) {
        firstVideo.currentTime = 0;
        void firstVideo.play().catch(() => undefined);
      } else if (secondVideo) {
        secondVideo.currentTime = 0;
      }
      return;
    }

    if (selectedMannequinView === "back" && secondVideo) {
      secondVideo.currentTime = 0;
      void secondVideo.play().catch(() => undefined);
    }
  }, [activeMannequinVideo, isDesignToFaceTransitioning, mannequinGender, reverseTransition, selectedMannequinView]);

  useEffect(() => () => {
    if (designPlayFallbackRef.current) {
      clearTimeout(designPlayFallbackRef.current);
      designPlayFallbackRef.current = null;
    }
    if (reverseSwapTimeoutRef.current) {
      clearTimeout(reverseSwapTimeoutRef.current);
    }
  }, []);

  const placementView = selectedMannequinView === "face" || selectedMannequinView === "side" || selectedMannequinView === "back"
    ? selectedMannequinView
    : null;
  const selectedPlacementDetails = placementDetails[selectedBodyArea];
  const hasMaleTorsoVariants = selectedTest === 1
    && mannequinGender === "male"
    && (placementView === "face" || placementView === "back")
    && selectedBodyArea === "torso";
  const activeTorsoVariants = placementView === "back" ? BACK_TORSO_VARIANTS : TORSO_VARIANTS;
  const selectedTorsoVariantLabel = t(selectedTorsoVariant === "center"
    ? "flashbook.positionCenter"
    : selectedTorsoVariant === "high"
      ? "flashbook.positionHigh"
      : selectedTorsoVariant === "middle"
        ? "flashbook.positionMiddle"
        : "flashbook.positionLow");
  const selectedTestName = String(selectedTest).padStart(2, "0");
  const featuredFlash = flashImages[selectedTest];
  const filteredTests = ([1, 2, 3, 4] as const).filter((testNumber) => {
    const flash = flashCatalog[testNumber];
    return themeFilter === "all" || flash.theme === themeFilter;
  });
  const hasActiveFilters = themeFilter !== "all";
  const showFeaturedCarousel: boolean = false;
  const fullscreenTransition = { duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] as const };
  const fullscreenRevealTransition = { duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] as const };

  const selectMannequinGender = (gender: "female" | "male") => {
    if (gender === mannequinGender || reverseTransition) return;

    mannequinTransitionRef.current?.pause();
    mannequinTransition2Ref.current?.pause();
    maleMannequinRef.current?.pause();
    maleMannequinTransition2Ref.current?.pause();
    maleReverseVideoRef.current?.pause();
    setMaleReverseTransition(null);
    setIsMaleTransitionPlaying(false);
    setMannequinGender(gender);
    setIsFemaleTransitionPlaying(false);
    setSelectedMannequinView("face");
    setActiveMannequinVideo(1);
    warmVideoCache([gender === "female" ? mannequinTransition : maleMannequin]);
  };

  return (
    <>
      <section id="flashbook" aria-label="Flashbook" className="relative h-dvh bg-[#242424]">
        <div className="relative h-dvh overflow-hidden">
        <motion.div
          ref={cardsScrollerRef}
          aria-label={t("flashbook.flashAlt")}
          onScroll={() => setIsInfoPanelOpen(false)}
          className="absolute inset-0 z-40 snap-y snap-proximity overflow-y-auto bg-[#242424] [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {showFeaturedCarousel && ([1, 2, 3, 4] as const).map((cardTest) => {
            const cardFlash = flashImages[cardTest];
            const isCardInfoOpen = false;
            return (
          <div key={cardTest} className="flex h-[50dvh] snap-start items-center justify-center border-b border-white/10 bg-[#242424] p-2 last:border-b-0">
          <motion.article
            className="relative z-10 h-[calc(50dvh-18px)] w-[calc(100vw-16px)] overflow-hidden rounded-[28px] border border-white/10 bg-[#f4f1eb] shadow-[0_14px_38px_rgba(0,0,0,0.22)]"
          >
            <motion.div
              initial={false}
              animate={{ width: isCardInfoOpen ? "60%" : "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 overflow-hidden border-r border-black/[0.08] bg-[#f4f1eb]"
            >
              <motion.div
                onClick={() => {
                  setSelectedTest(cardTest);
                  openFromFullscreenIcon(cardTest);
                }}
                className="absolute inset-0 cursor-zoom-in"
              >
                <Image
                  src={cardFlash}
                  alt={`${t("flashbook.flashAlt")} ${cardTest}`}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 92vw, 720px"
                  className={`${cardTest === 1 ? "scale-[1.1]" : "scale-[0.92]"} object-contain object-center mix-blend-multiply`}
                />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: isCardInfoOpen ? 0 : 1, y: isCardInfoOpen ? 8 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-3"
              >
                <div className="rounded-full border border-black/10 bg-white/78 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-black/65 shadow-sm backdrop-blur-md">
                  {String(cardTest).padStart(2, "0")} · {t(themeLabelKeys[flashCatalog[cardTest].theme])}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#252525] px-3.5 py-2 text-[10px] font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)]">
                  {t("flashbook.tryOn")} <span aria-hidden="true">→</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{
                x: isFullscreen || !isCardInfoOpen ? "105%" : "0%",
                opacity: isFullscreen || !isCardInfoOpen ? 0 : 1,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsInfoPanelOpen(false)}
              className="absolute inset-y-0 right-0 isolate flex w-[40%] cursor-pointer overflow-hidden border-l border-white/35 bg-white/[0.06] font-mono text-[#151619] shadow-[-12px_0_34px_rgba(0,0,0,0.06)] backdrop-blur-[30px] backdrop-saturate-[1.25]"
            >
              <Image
                aria-hidden="true"
                src={cardFlash}
                alt=""
                fill
                sizes="220px"
                className="pointer-events-none z-0 scale-125 object-cover object-center grayscale opacity-[0.05] blur-[18px]"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/16 via-white/[0.04] to-white/20" />
              <div aria-hidden="true" className="pointer-events-none absolute -inset-x-12 -top-20 z-[1] h-56 rotate-[28deg] bg-white/[0.08] blur-2xl" />
              <div
                className="relative z-10 flex h-full shrink-0 flex-col p-5 sm:p-6"
                style={{ width: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
              >
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/70">Flash</p>
              <p className="mt-2 text-[56px] font-light leading-[0.82] tracking-[-0.08em]">{String(cardTest).padStart(3, "0")}</p>

              <div className="mt-6 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.title")}</p>
                <p className="mt-1.5 text-[18px] font-medium uppercase leading-tight tracking-[0.02em]">SWIPE RIGHT</p>
              </div>

              <div className="mt-1 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.size")}</p>
                <p className="mt-1.5 text-[16px] uppercase">18 - 22 cm</p>
              </div>

              <div className="mt-1 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.aesthetic")}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <span className="flex h-[26px] items-center rounded-[6px] border border-black/[0.18] px-3 text-[10px] uppercase tracking-[0.05em]">{t("flashbook.statue")}</span>
                  <span className="flex h-[26px] items-center rounded-[6px] border border-black/[0.18] px-3 text-[10px] uppercase tracking-[0.05em]">{t("flashbook.surrealism")}</span>
                </div>
              </div>

              <div className="mt-1 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.theme")}</p>
                <p className="mt-1.5 text-[16px] uppercase">{t(themeLabelKeys[flashCatalog[cardTest].theme])}</p>
              </div>

              <div className="mt-1 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.price")}</p>
                <p className="mt-1.5 text-[16px] uppercase">{t("flashbook.from")} €{flashCatalog[cardTest].price}</p>
              </div>

              <div className="mt-1 border-t border-black/[0.12] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/70">{t("flashbook.status")}</p>
                <p className="mt-1.5 flex items-center gap-2 text-[16px] uppercase">{t("flashbook.available")} <span className="h-2 w-2 rounded-full bg-[#1e6a4a]" /></p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedTest(cardTest);
                    setIsFlashBookingOpen(true);
                  }}
                  className="mt-5 flex h-[52px] w-full items-center justify-between rounded-[10px] border border-black bg-black px-4 text-[16px] font-semibold uppercase text-white shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition hover:scale-[1.02] hover:bg-[#292929]"
                >
                  {t("flashbook.book")} <span aria-hidden="true" className="text-base leading-none">→</span>
                </button>
                <button type="button" onClick={(event) => event.stopPropagation()} className="mt-2 flex h-[46px] w-full items-center justify-between rounded-[8px] border border-black/[0.22] px-3 text-[16px] font-medium uppercase text-black/75 transition hover:border-black/[0.45] hover:bg-white/45">
                  {t("flashbook.viewAll")} <span aria-hidden="true" className="text-base leading-none">→</span>
                </button>
              </div>
              </div>
            </motion.div>

            <motion.button
              type="button"
              initial={false}
              animate={{ right: isCardInfoOpen ? "40%" : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              onClick={() => {
                setSelectedTest(cardTest);
                setIsInfoPanelOpen((isOpen) => selectedTest === cardTest ? !isOpen : true);
              }}
              aria-expanded={isCardInfoOpen}
              aria-label={t(isCardInfoOpen ? "flashbook.hideDetails" : "flashbook.showDetails")}
              className="hidden"
            >
              <motion.svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: isCardInfoOpen ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="h-5 w-5"
              >
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.button>
          </motion.article>
          </div>
            );
          })}
          <section aria-labelledby="all-flashes-title" className="min-h-dvh snap-start bg-[#f2f0ec] px-4 pb-24 pt-[calc(24px+env(safe-area-inset-top))] text-[#171717] sm:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 border-b border-black/15 pb-5">
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-black/45 sm:text-xs">Flashs</p>
                  <h2 id="all-flashes-title" className={`${framaBlack.className} text-[clamp(2.65rem,10vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.055em]`}>
                    {t("flashbook.allFlashes")}
                  </h2>
                  <p className="mt-4 max-w-md text-[12px] leading-relaxed text-black/50 sm:text-sm">
                    {t("flashbook.chooseToTry")}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-[24px] border border-black/[0.07] bg-white/65 p-3 shadow-[0_8px_26px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-4">
                <div>
                  <label className="relative">
                    <span className="sr-only">{t("flashbook.filterTheme")}</span>
                    <select
                      value={themeFilter}
                      onChange={(event) => setThemeFilter(event.target.value as "all" | FlashTheme)}
                      className="h-12 w-full appearance-none rounded-2xl border border-black/[0.08] bg-white px-4 pr-9 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-black outline-none transition focus:border-black/30"
                    >
                      <option value="all">{t("flashbook.allThemes")}</option>
                      <option value="realism">{t("flashbook.themeRealism")}</option>
                      <option value="blackwork">{t("flashbook.themeBlackwork")}</option>
                      <option value="ornamental">{t("flashbook.themeOrnamental")}</option>
                      <option value="erotic">{t("flashbook.themeErotic")}</option>
                    </select>
                    <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-black/45">⌄</span>
                  </label>

                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => setThemeFilter("all")}
                    className="mt-3 px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/45 underline decoration-black/20 underline-offset-4 transition hover:text-black"
                  >
                    {t("flashbook.resetFilters")}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {filteredTests.map((testNumber) => (
                  <button
                    key={testNumber}
                    type="button"
                    onClick={() => {
                      setSelectedTest(testNumber);
                      setIsInfoPanelOpen(false);
                      openFromFullscreenIcon(testNumber);
                    }}
                    aria-label={`${t("flashbook.tryFlash")} ${String(testNumber).padStart(2, "0")}`}
                    className="group text-left"
                  >
                    <span className="relative block aspect-[0.76] overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(0,0,0,0.11)] group-active:scale-[0.985]">
                      <Image
                        src={flashImages[testNumber]}
                        alt={`${t("flashbook.flashAlt")} ${testNumber}`}
                        fill
                        sizes="(max-width: 640px) 46vw, (max-width: 1024px) 25vw, 240px"
                        className={`${testNumber === 1 ? "scale-[1.1] group-hover:scale-[1.14]" : "scale-[0.9] group-hover:scale-[0.94]"} object-contain object-center mix-blend-multiply transition-transform duration-700`}
                      />
                      <span className="absolute bottom-3 right-3 rounded-full bg-black px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white sm:bottom-4 sm:right-4">
                        {t("flashbook.tryOn")}
                      </span>
                    </span>
                    <span className="mt-3 flex items-center justify-between px-1 font-mono">
                      <span className="text-[12px] font-semibold tracking-[0.08em]">TEST {String(testNumber).padStart(2, "0")}</span>
                      <span className="text-[10px] font-semibold">{t("flashbook.from")} €{flashCatalog[testNumber].price}</span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[0.08em] text-black/40">
                      <span>{t(themeLabelKeys[flashCatalog[testNumber].theme])}</span>
                      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#1e6a4a]" /> {t("flashbook.available")}</span>
                    </span>
                  </button>
                ))}
              </div>
              {filteredTests.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-black/15 px-6 py-14 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-black/45">
                  {t("flashbook.noResults")}
                </div>
              )}
            </div>
          </section>
        </motion.div>
        </div>
      </section>
      <BookingSheet
        open={isFlashBookingOpen}
        onClose={() => setIsFlashBookingOpen(false)}
        flashTitle={`TEST ${selectedTestName} · ${t(selectedBodyArea === "torso"
          ? "flashbook.areaTorso"
          : selectedBodyArea === "arm"
            ? "flashbook.areaArm"
            : selectedBodyArea === "forearm"
              ? "flashbook.areaForearm"
              : selectedBodyArea === "thigh"
                ? "flashbook.areaThigh"
                : "flashbook.areaLeg")}${hasMaleTorsoVariants ? ` · ${selectedTorsoVariantLabel}` : ""}`}
      />
      <AnimatePresence>
      {isFullscreen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Illustration fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fullscreenRevealTransition}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white p-5"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeFullscreen();
            }}
            aria-label="Fermer le flash agrandi"
            className="fixed left-3 top-[calc(12px+env(safe-area-inset-top))] z-[70] grid h-9 w-9 place-items-center rounded-full border border-black/[0.07] bg-white/55 text-[21px] font-light leading-none text-black/55 shadow-[0_5px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl transition active:scale-95"
          >
            <span aria-hidden="true" className="-translate-y-px">×</span>
          </button>
          <motion.div
            onClick={closeFullscreen}
            animate={{ x: activeMannequinVideo > 0 && (!isDesignToFaceTransitioning || isDesignTransitionVisible) ? "100vw" : 0 }}
            transition={fullscreenTransition}
            className="fixed inset-0 z-10 cursor-zoom-out overflow-hidden"
          >
            <motion.div
              className="absolute inset-0"
            >
              <motion.div
                initial={reduceMotion ? false : { x: "0%", scale: 0.96 }}
                animate={{
                  x: "-4%",
                  y: selectedTest === 1 ? "-8%" : "0%",
                  scale: selectedTest === 1 ? 1.08 : 1.25,
                }}
                exit={reduceMotion ? undefined : { x: "0%", scale: 0.96 }}
                transition={fullscreenRevealTransition}
                className="absolute inset-0 origin-center [will-change:transform]"
              >
                <Image
                  src={featuredFlash}
                  alt={`${t("flashbook.flashAlt")} 1`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </motion.div>
          {activeMannequinVideo > 0 && (
              <motion.div
                onClick={closeFullscreen}
                initial={isDesignToFaceTransitioning ? { opacity: 0, scaleY: 0.98 } : false}
                animate={isDesignToFaceTransitioning ? {
                  opacity: isDesignTransitionVisible ? 1 : 0,
                  scaleY: isDesignTransitionVisible ? 1 : 0.98,
                } : {
                  opacity: 1,
                  scaleY: 1,
                }}
                transition={{
                  duration: reduceMotion ? 0 : isDesignToFaceTransitioning ? 0.42 : 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onAnimationComplete={() => {
                  if (isDesignToFaceTransitioning && isDesignTransitionVisible) {
                    setIsDesignToFaceTransitioning(false);
                    setIsDesignTransitionVisible(false);
                    setIsFemaleTransitionPlaying(false);
                  }
                }}
                className={`absolute inset-0 origin-center cursor-zoom-out overflow-hidden bg-white ${activeMannequinVideo === 1 ? "z-40" : "z-20"}`}
              >
                <video
                  ref={mannequinTransitionRef}
                  aria-label="Mannequin transition"
                  muted
                  playsInline
                  preload="auto"
                  onPlaying={() => {
                    if (designPlayFallbackRef.current) {
                      clearTimeout(designPlayFallbackRef.current);
                      designPlayFallbackRef.current = null;
                    }
                    setIsDesignTransitionVisible(true);
                  }}
                  onEnded={() => {
                    if (designPlayFallbackRef.current) {
                      clearTimeout(designPlayFallbackRef.current);
                      designPlayFallbackRef.current = null;
                    }
                    setActiveMannequinVideo(2);
                    if (selectedMannequinView === "side") setIsFemaleTransitionPlaying(false);
                  }}
                  className="h-full w-full -translate-x-[6%] scale-[1.65] object-contain"
                >
                  <source src={mannequinTransition} type="video/mp4" />
                  Votre navigateur ne prend pas en charge la vidéo.
                </video>
              </motion.div>
          )}
          {activeMannequinVideo > 0 && (
              <div
                onClick={closeFullscreen}
                className="absolute inset-0 z-30 cursor-zoom-out overflow-hidden bg-white"
              >
                <video
                  ref={mannequinTransition2Ref}
                  aria-label="Mannequin transition, side view"
                  muted
                  playsInline
                  preload="auto"
                  onEnded={() => {
                    if (selectedMannequinView === "back") setIsFemaleTransitionPlaying(false);
                  }}
                  className="h-full w-full -translate-x-[6%] scale-[1.65] object-contain"
                >
                  <source src={mannequinTransition2} type="video/mp4" />
                  Votre navigateur ne prend pas en charge la vidéo.
                </video>
              </div>
          )}
          {reverseTransition && (
            <motion.div
              initial={false}
              animate={{ opacity: isReverseVideoVisible ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-[45] overflow-hidden bg-white"
            >
              <video
                key={reverseTransition}
                ref={reverseTransitionRef}
                aria-label={reverseTransition === "to-side" ? "Transition de dos vers côté" : "Transition de côté vers face"}
                muted
                playsInline
                preload="auto"
                onPlaying={showReverseTransition}
                onEnded={finishReverseTransition}
                className="h-full w-full -translate-x-[6%] scale-[1.65] object-contain"
              >
                <source
                  src={reverseTransition === "to-side" ? mannequinTransition2Reverse : mannequinTransitionReverse}
                  type="video/mp4"
                />
                Votre navigateur ne prend pas en charge la vidéo.
              </video>
            </motion.div>
          )}
          {mannequinGender === "female" && placementView && !isFemaleTransitionPlaying && !reverseTransition && (
            <div
              onClick={closeFullscreen}
              className="absolute inset-0 z-[46] cursor-zoom-out overflow-hidden bg-white"
            >
              {BODY_AREAS.map((area) => (
                <Image
                  key={`${placementView}-${area}`}
                  src={testPlacement(selectedTest, "female", placementView, area)}
                  alt={`TEST ${selectedTestName} femme ${placementView} ${area}`}
                  fill
                  sizes="100vw"
                  loading="eager"
                  className={`object-cover object-center ${selectedBodyArea === area ? "visible" : "invisible"}`}
                />
              ))}
            </div>
          )}
          {mannequinGender === "male" && activeMannequinVideo > 0 && (
            <div
              onClick={closeFullscreen}
              className="absolute inset-0 z-[46] cursor-zoom-out overflow-hidden bg-white"
            >
              <video
                ref={maleMannequinRef}
                aria-label={t("flashbook.maleMannequin")}
                muted
                playsInline
                preload="auto"
                onEnded={() => setIsMaleTransitionPlaying(false)}
                className="h-full w-full translate-x-[11%] translate-y-[1%] scale-[1.14] object-contain"
              >
                <source src={maleMannequin} type="video/mp4" />
                Votre navigateur ne prend pas en charge la vidéo.
              </video>
            </div>
          )}
          <AnimatePresence>
          {mannequinGender === "male" && maleReverseTransition && (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.08, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-[48] overflow-hidden bg-white"
            >
              <video
                key={maleReverseTransition}
                ref={maleReverseVideoRef}
                aria-label={maleReverseTransition === "to-face" ? "Mannequin homme, transition côté face" : "Mannequin homme, transition dos côté"}
                muted
                playsInline
                preload="auto"
                onEnded={finishMaleReverseTransition}
                className={`h-full w-full translate-y-[1%] scale-[1.14] object-contain ${maleReverseTransition === "to-side" ? "translate-x-[18.5%]" : "translate-x-[11%]"}`}
              >
                <source
                  src={maleReverseTransition === "to-face" ? maleMannequinReverse : maleMannequinTransition2Reverse}
                  type="video/mp4"
                />
                Votre navigateur ne prend pas en charge la vidéo.
              </video>
            </motion.div>
          )}
          </AnimatePresence>
          {mannequinGender === "male" && activeMannequinVideo > 0 && (
            <motion.div
              onClick={closeFullscreen}
              initial={false}
              animate={activeMannequinVideo === 2
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.985, filter: "blur(4px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute inset-0 z-[47] overflow-hidden bg-white ${activeMannequinVideo === 2 ? "cursor-zoom-out" : "pointer-events-none"}`}
            >
              <video
                ref={maleMannequinTransition2Ref}
                aria-label="Mannequin homme, transition côté dos"
                muted
                playsInline
                preload="auto"
                onEnded={() => setIsMaleTransitionPlaying(false)}
                className="h-full w-full translate-x-[18.5%] translate-y-[1%] scale-[1.14] object-contain"
              >
                <source src={maleMannequinTransition2} type="video/mp4" />
                Votre navigateur ne prend pas en charge la vidéo.
              </video>
            </motion.div>
          )}
          {mannequinGender === "male" && placementView && !isMaleTransitionPlaying && !maleReverseTransition && (
            <div
              onClick={closeFullscreen}
              className="absolute inset-0 z-[49] cursor-zoom-out overflow-hidden bg-white"
            >
              {BODY_AREAS.map((area) => area === "torso" && selectedTest === 1 && (placementView === "face" || placementView === "back")
                ? activeTorsoVariants.map((variant) => (
                    <Image
                      key={`male-${placementView}-torso-${variant}`}
                      src={placementView === "back" ? testOneMaleBackTorsoVariant(variant) : testOneMaleTorsoVariant(variant)}
                      alt={`TEST ${selectedTestName} homme ${placementView} torse ${variant}`}
                      fill
                      sizes="100vw"
                      loading="eager"
                      style={{
                        opacity: selectedBodyArea === "torso" && selectedTorsoVariant === variant ? 1 : 0,
                        transform: placementView === "back"
                          ? `scale(${selectedTorsoVariant === variant ? 1 : 0.96})`
                          : `translateY(${TORSO_VARIANT_POSITION[variant] + (selectedTorsoVariant === variant ? 0 : 2)}%) scale(${selectedTorsoVariant === variant ? 1 : 0.96})`,
                        transition: reduceMotion
                          ? "none"
                          : "opacity 850ms cubic-bezier(0.65, 0, 0.35, 1), transform 850ms cubic-bezier(0.65, 0, 0.35, 1)",
                      }}
                      className={`object-cover object-center will-change-[opacity,transform] ${
                        selectedBodyArea === "torso" && selectedTorsoVariant === variant ? "" : "pointer-events-none"
                      }`}
                    />
                  ))
                : (
                    <Image
                      key={`male-${placementView}-${area}`}
                      src={testPlacement(selectedTest, "male", placementView, area)}
                      alt={`TEST ${selectedTestName} homme ${placementView} ${area}`}
                      fill
                      sizes="100vw"
                      loading="eager"
                      className={`object-cover object-center ${selectedBodyArea === area ? "visible" : "invisible"}`}
                    />
                  ))}
            </div>
          )}
          {activeMannequinVideo > 0 && (
            <>
              <motion.aside
                initial={false}
                animate={{ x: isFullscreenInfoOpen ? 0 : "105%" }}
                transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFullscreenInfoOpen(false);
                }}
                className="absolute bottom-[calc(152px+env(safe-area-inset-bottom))] right-0 top-[calc(12px+env(safe-area-inset-top))] z-[58] w-[42%] max-w-[200px] cursor-pointer overflow-hidden rounded-l-[22px] border border-r-0 border-white/35 bg-white/[0.08] font-mono text-[#151619] shadow-[-14px_0_38px_rgba(0,0,0,0.08)] backdrop-blur-[30px] backdrop-saturate-[1.2]"
              >
                <Image
                  aria-hidden="true"
                  src={featuredFlash}
                  alt=""
                  fill
                  sizes="280px"
                  className="pointer-events-none scale-125 object-cover grayscale opacity-[0.04] blur-[16px]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/18 via-white/[0.04] to-white/22" />
                <div className="relative z-10 flex h-full flex-col overflow-hidden px-3 pb-3 pt-4 [overflow-wrap:anywhere]">
                  <p className="text-[8px] uppercase tracking-[0.24em] text-black/45">Flash {String(selectedTest).padStart(3, "0")}</p>
                  <p className="mt-1 text-[22px] font-medium uppercase leading-none">TEST {selectedTestName}</p>

                  <div className="mt-3 border-t border-black/10 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/45">{t("flashbook.placement")}</p>
                    <p className="mt-1 text-[12px] font-medium uppercase">
                      {t(selectedBodyArea === "torso"
                        ? "flashbook.areaTorso"
                        : selectedBodyArea === "arm"
                          ? "flashbook.areaArm"
                          : selectedBodyArea === "forearm"
                            ? "flashbook.areaForearm"
                            : selectedBodyArea === "thigh"
                              ? "flashbook.areaThigh"
                              : "flashbook.areaLeg")}
                      {hasMaleTorsoVariants ? ` · ${selectedTorsoVariantLabel}` : ""}
                    </p>
                  </div>

                  <div className="mt-2 border-t border-black/10 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/45">{t("flashbook.theme")}</p>
                    <p className="mt-1 text-[12px] font-medium uppercase">{t(themeLabelKeys[flashCatalog[selectedTest].theme])}</p>
                  </div>

                  <div className="mt-2 border-t border-black/10 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/45">{t("flashbook.size")}</p>
                    <p className="mt-1 text-[12px] uppercase">{selectedPlacementDetails.size}</p>
                  </div>

                  <div className="mt-2 border-t border-black/10 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/45">{t("flashbook.price")}</p>
                    <p className="mt-1 text-[12px] uppercase">{t("flashbook.from")} €{selectedPlacementDetails.price}</p>
                  </div>

                  <div className="mt-2 border-t border-black/10 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/45">{t("flashbook.status")}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] uppercase">
                      {t("flashbook.available")} <span className="h-2 w-2 rounded-full bg-[#1e6a4a]" />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsFlashBookingOpen(true);
                    }}
                    className="mt-2.5 flex h-10 w-full shrink-0 items-center justify-between rounded-[10px] bg-black px-3 text-[11px] font-semibold uppercase text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition active:scale-[0.98]"
                  >
                    {t("flashbook.book")} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </motion.aside>

              <motion.button
                type="button"
                initial={false}
                animate={{ right: isFullscreenInfoOpen ? "min(42%, 200px)" : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isFullscreenInfoOpen) setHasOpenedFullscreenInfo(true);
                  setIsFullscreenInfoOpen((isOpen) => !isOpen);
                }}
                aria-expanded={isFullscreenInfoOpen}
                aria-label={t(isFullscreenInfoOpen ? "flashbook.hideDetails" : "flashbook.showDetails")}
                className="absolute top-[42%] z-[59] flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-l-full border border-r-0 border-black/10 bg-white/90 text-black shadow-[-7px_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl"
              >
                <AnimatePresence>
                  {!hasOpenedFullscreenInfo && !isFullscreenInfoOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-none absolute right-12 whitespace-nowrap rounded-full border border-black/10 bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-black shadow-[0_7px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl"
                    >
                      {t("flashbook.infoAndBook")}
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={{ rotate: isFullscreenInfoOpen ? 180 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="h-5 w-5"
                >
                  <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.button>
            </>
          )}
          {activeMannequinVideo === 0 && (
            <Link
              href={`/studio?design=${selectedTest}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="group absolute bottom-[calc(67px+env(safe-area-inset-bottom))] left-1/2 z-[60] flex h-[68px] w-[calc(100%-40px)] max-w-[380px] -translate-x-1/2 items-center justify-between rounded-[20px] border border-black/[0.08] bg-white/80 py-2 pl-5 pr-2.5 text-black shadow-[0_14px_38px_rgba(0,0,0,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-[0.985]"
            >
              <span className="flex flex-col items-start text-left">
                <span className="font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-black/40">
                  {t("flashbook.virtualPreview")}
                </span>
                <span className="mt-1 text-[14px] font-semibold tracking-[-0.02em]">
                  {t("flashbook.tryOnBody")}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="mr-2 grid h-9 w-9 shrink-0 place-items-center text-[22px] font-light leading-none text-black transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          )}

          {activeMannequinVideo > 0 && (
          <>
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 z-[60] w-[calc(100%-40px)] max-w-[360px] -translate-x-1/2 rounded-[17px] border border-black/10 bg-white/90 p-1 shadow-[0_10px_28px_rgba(0,0,0,0.16)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => selectMannequinView("design")}
              className="group mb-1 flex h-8 w-full items-center rounded-[13px] border border-black/[0.06] bg-white/70 p-0.5 text-left transition-colors hover:bg-white"
            >
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-[10px] border border-black/[0.06] bg-white">
                <Image
                  src={featuredFlash}
                  alt=""
                  fill
                  sizes="36px"
                  className={`${selectedTest === 1 ? "scale-100" : "scale-[0.88]"} object-contain mix-blend-multiply`}
                />
              </span>
              <span className="ml-3 flex min-w-0 flex-1 flex-col">
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-black/35">
                  TEST {selectedTestName}
                </span>
                <span className="mt-0.5 text-[11px] font-semibold text-black/75">
                  {t("flashbook.viewDesign")}
                </span>
              </span>
              <span aria-hidden="true" className="mr-3 text-base text-black/45 transition-transform group-hover:-translate-x-0.5">←</span>
            </button>
            <div className="grid grid-cols-2 gap-1 border-b border-black/[0.07] pb-1.5">
              {(["female", "male"] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => selectMannequinGender(gender)}
                  aria-pressed={mannequinGender === gender}
                  className={`h-6 rounded-full text-[9px] font-semibold transition-colors ${
                    mannequinGender === gender ? "bg-black text-white" : "text-black/50 hover:text-black"
                  }`}
                >
                  {t(gender === "female" ? "flashbook.genderFemale" : "flashbook.genderMale")}
                </button>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-3 gap-1 border-b border-black/[0.07] pb-1">
              {([
                ["face", "flashbook.viewFace"],
                ["side", "flashbook.viewSide"],
                ["back", "flashbook.viewBack"],
              ] as const).map(([view, labelKey]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => selectMannequinView(view)}
                  aria-pressed={selectedMannequinView === view}
                  className={`h-6 rounded-full text-[9px] font-semibold transition-colors ${
                    selectedMannequinView === view ? "bg-black text-white" : "text-black/50 hover:text-black"
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-6 gap-1">
              {([
                ["torso", "flashbook.areaTorso"],
                ["arm", "flashbook.areaArm"],
                ["forearm", "flashbook.areaForearm"],
                ["thigh", "flashbook.areaThigh"],
                ["leg", "flashbook.areaLeg"],
              ] as const).map(([area, labelKey], index) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedBodyArea(area)}
                  aria-pressed={selectedBodyArea === area}
                  className={`h-7 min-w-0 rounded-full border px-1 text-[8px] font-semibold leading-none transition-colors ${
                    index < 3 ? "col-span-2" : "col-span-3"
                  } ${
                    selectedBodyArea === area
                      ? "border-black bg-black text-white"
                      : "border-black/[0.06] bg-black/[0.035] text-black/55 hover:bg-black/[0.07] hover:text-black"
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
            {hasMaleTorsoVariants && (
              <div className="mt-1 border-t border-black/[0.07] pt-1">
                <p className="mb-1 px-1 font-mono text-[7px] uppercase tracking-[0.16em] text-black/35">
                  {t("flashbook.position")}
                </p>
                <div className={`grid gap-1 ${placementView === "back" ? "grid-cols-3" : "grid-cols-4"}`}>
                  {([
                    ["center", "flashbook.positionCenter"],
                    ["high", "flashbook.positionHigh"],
                    ["middle", "flashbook.positionMiddle"],
                    ["low", "flashbook.positionLow"],
                  ] as const).filter(([variant]) => activeTorsoVariants.includes(variant)).map(([variant, labelKey]) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedTorsoVariant(variant)}
                      aria-pressed={selectedTorsoVariant === variant}
                      className={`h-6 rounded-full text-[8px] font-semibold transition-colors ${
                        selectedTorsoVariant === variant ? "bg-black text-white" : "bg-black/[0.035] text-black/50 hover:text-black"
                      }`}
                    >
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
