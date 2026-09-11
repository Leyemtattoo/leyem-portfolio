"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import BookingSheet from "@/components/booking/BookingSheet";
import { useTranslation, type Locale } from "@/components/i18n/LanguageProvider";

type Gender = "female" | "male";
type View = "face" | "side" | "back";
type Area = "torso" | "arm" | "leg";
type AnatomicalZone = "shoulders" | "chest" | "abdomen" | "waistband" | "upperArm" | "forearm" | "thigh" | "calf" | "back";
type Placement = { x: number; y: number; scale: number; rotation: number; mirrored: boolean };
type ViewTransition = { src: string; target: View; frozenFrame?: string };

const REFERENCE_BODY_HEIGHT_CM = 180;
const ANATOMICAL_ZONES: Record<AnatomicalZone, { widthCm: number; lengthCm: number; area: Area }> = {
  shoulders: { widthCm: 45, lengthCm: 30, area: "torso" },
  chest: { widthCm: 40, lengthCm: 30, area: "torso" },
  abdomen: { widthCm: 32, lengthCm: 30, area: "torso" },
  waistband: { widthCm: 32, lengthCm: 14, area: "torso" },
  upperArm: { widthCm: 11.5, lengthCm: 32, area: "arm" },
  forearm: { widthCm: 9, lengthCm: 28, area: "arm" },
  thigh: { widthCm: 20, lengthCm: 46, area: "leg" },
  calf: { widthCm: 12.5, lengthCm: 43, area: "leg" },
  back: { widthCm: 40, lengthCm: 51, area: "torso" },
};

const getAnatomicalZone = (view: View, x: number, y: number): AnatomicalZone => {
  const distanceFromCenter = Math.abs(x - 50);

  if (y >= 72) return "calf";
  if (y >= 52) return "thigh";
  if (distanceFromCenter >= 18 && y >= 34) return "forearm";
  if (distanceFromCenter >= 18 && y >= 20) return "upperArm";
  if (view === "back" && y >= 20 && y < 51) return "back";
  if (y < 27) return "shoulders";
  if (y < 37) return "chest";
  if (y < 47) return "abdomen";
  return "waistband";
};

const femaleViewTransitions: Partial<Record<`${View}-${View}`, string>> = {
  // The generated filenames do not match their actual first/last views.
  "face-side": "/videos/female-back-to-side.mp4",
  "side-face": "/videos/female-side-to-back.mp4",
  "side-back": "/videos/female-side-to-face.mp4",
  "back-side": "/videos/female-face-to-side.mp4",
};

const maleViewTransitions: Partial<Record<`${View}-${View}`, string>> = {
  "face-side": "/videos/male-face-to-side.mp4",
  "side-face": "/videos/male-side-to-face.mp4",
  "side-back": "/videos/male-side-to-back.mp4",
  "back-side": "/videos/male-back-to-side.mp4",
};

const studioCopy: Record<Locale, {
  genders: { value: Gender; label: string }[];
  views: { value: View; label: string }[];
  areas: { value: Area; label: string }[];
  gesture: string;
  book: string;
  mirror: string;
  close: string;
  import: string;
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  moveMannequin: string;
  zoomIn: string;
  zoomOut: string;
  capture: string;
  capturing: string;
  retake: string;
  captureFailed: string;
}> = {
  fr: { genders: [{ value: "female", label: "Femme" }, { value: "male", label: "Homme" }], views: [{ value: "face", label: "Face" }, { value: "side", label: "Côté" }, { value: "back", label: "Dos" }], areas: [{ value: "torso", label: "Torse" }, { value: "arm", label: "Bras" }, { value: "leg", label: "Jambe" }], gesture: "Glisser · Pincer · Tourner", book: "Réserver", mirror: "Retourner le flash en miroir", close: "Revenir au flash sélectionné", import: "Importer", moveUp: "Monter le mannequin", moveDown: "Descendre le mannequin", moveLeft: "Déplacer le mannequin à gauche", moveRight: "Déplacer le mannequin à droite", moveMannequin: "Déplacer le mannequin", zoomIn: "Zoomer sur le mannequin", zoomOut: "Dézoomer le mannequin", capture: "Joindre une photo du placement", capturing: "Ajout de la photo…", retake: "Remplacer la photo", captureFailed: "La photo du placement n’a pas pu être ajoutée. Réessaie." },
  en: { genders: [{ value: "female", label: "Woman" }, { value: "male", label: "Man" }], views: [{ value: "face", label: "Front" }, { value: "side", label: "Side" }, { value: "back", label: "Back" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Arm" }, { value: "leg", label: "Leg" }], gesture: "Drag · Pinch · Rotate", book: "Book", mirror: "Mirror the flash", close: "Back to selected flash", import: "Upload", moveUp: "Move mannequin up", moveDown: "Move mannequin down", moveLeft: "Move mannequin left", moveRight: "Move mannequin right", moveMannequin: "Move mannequin", zoomIn: "Zoom in on mannequin", zoomOut: "Zoom out on mannequin", capture: "Attach a placement photo", capturing: "Attaching photo…", retake: "Replace photo", captureFailed: "The placement photo could not be attached. Please try again." },
  de: { genders: [{ value: "female", label: "Frau" }, { value: "male", label: "Mann" }], views: [{ value: "face", label: "Vorne" }, { value: "side", label: "Seite" }, { value: "back", label: "Rücken" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Arm" }, { value: "leg", label: "Bein" }], gesture: "Ziehen · Zoomen · Drehen", book: "Buchen", mirror: "Flash spiegeln", close: "Zurück zum ausgewählten Flash", import: "Hochladen", moveUp: "Mannequin nach oben", moveDown: "Mannequin nach unten", moveLeft: "Mannequin nach links", moveRight: "Mannequin nach rechts", moveMannequin: "Mannequin bewegen", zoomIn: "Mannequin vergrößern", zoomOut: "Mannequin verkleinern", capture: "Foto der Platzierung anhängen", capturing: "Foto wird angehängt…", retake: "Foto ersetzen", captureFailed: "Das Platzierungsfoto konnte nicht angehängt werden. Bitte erneut versuchen." },
  es: { genders: [{ value: "female", label: "Mujer" }, { value: "male", label: "Hombre" }], views: [{ value: "face", label: "Frente" }, { value: "side", label: "Perfil" }, { value: "back", label: "Espalda" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Brazo" }, { value: "leg", label: "Pierna" }], gesture: "Deslizar · Pellizcar · Girar", book: "Reservar", mirror: "Reflejar el flash", close: "Volver al flash seleccionado", import: "Subir", moveUp: "Subir el maniquí", moveDown: "Bajar el maniquí", moveLeft: "Mover el maniquí a la izquierda", moveRight: "Mover el maniquí a la derecha", moveMannequin: "Mover el maniquí", zoomIn: "Acercar el maniquí", zoomOut: "Alejar el maniquí", capture: "Adjuntar foto de la colocación", capturing: "Adjuntando foto…", retake: "Cambiar foto", captureFailed: "No se pudo adjuntar la foto de colocación. Inténtalo de nuevo." },
};

const initialPlacement: Placement = { x: 50, y: 43, scale: 0.72, rotation: 0, mirrored: false };
const flashDesigns = { 1: "/images/flashbook/TEST-01-placement-v2.png", 2: "/images/flashbook/TEST-02.webp", 3: "/images/flashbook/TEST-03.webp", 4: "/images/flashbook/TEST-04.webp" } as const;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function PlacementStudio({ designNumber = 1, allowUpload = false }: { designNumber?: 1 | 2 | 3 | 4; allowUpload?: boolean }) {
  const router = useRouter();
  const { locale } = useTranslation();
  const copy = studioCopy[locale];
  const [gender, setGender] = useState<Gender>("female");
  const [view, setView] = useState<View>("face");
  const [designSrc, setDesignSrc] = useState<string>(flashDesigns[designNumber]);
  const [uploadedName, setUploadedName] = useState(`TEST ${String(designNumber).padStart(2, "0")}`);
  const [placement, setPlacement] = useState<Placement>(initialPlacement);
  const [mannequinY, setMannequinY] = useState(0);
  const [mannequinX, setMannequinX] = useState(0);
  const [mannequinZoom, setMannequinZoom] = useState(1);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [viewTransition, setViewTransition] = useState<ViewTransition | null>(null);
  const [capturedReference, setCapturedReference] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [showFlashSize, setShowFlashSize] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [bookPulse, setBookPulse] = useState(false);
  const [showCaptureHint, setShowCaptureHint] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{ placement: Placement; center: { x: number; y: number }; distance: number; angle: number } | null>(null);
  const joystickRef = useRef<{ pointerId: number; startX: number; startY: number; mannequinX: number; mannequinY: number } | null>(null);
  const previousFlashScaleRef = useRef(initialPlacement.scale);
  const previousAnatomicalZoneRef = useRef<AnatomicalZone | null>(null);
  const flashSizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureVersionRef = useRef(0);

  const fullMannequins: Record<View, string> = {
    face: "/images/studio/male/face-full.jpg",
    side: "/images/studio/male/side-full.jpg",
    back: "/images/studio/male/back-full.jpg",
  };
  const femaleMannequins: Record<View, string> = {
    face: "/images/studio/female-face-full.jpg",
    side: "/images/studio/female-side-full.jpg",
    back: "/images/studio/female-back-full.jpg",
  };
  const mannequinSrc = gender === "female" ? femaleMannequins[view] : fullMannequins[view];
  const framedView = viewTransition?.target ?? view;
  const mannequinBaseScale = gender === "male"
    ? (framedView === "side" ? 1.5 : framedView === "back" ? 1.3 : 1.25)
    : (framedView === "side" ? 1.42 : 1.22);
  const mannequinScale = mannequinBaseScale * mannequinZoom;
  const transitionPlaying = Boolean(viewTransition && !viewTransition.frozenFrame);
  // Larger default view scales used to push the head above the viewport.
  // Offset each framing proportionally so the complete head is visible first.
  const mannequinHeadFramingVh = Math.max(0, mannequinBaseScale - 1) * 40;

  useEffect(() => {
    const sources = [...Object.values(femaleViewTransitions), ...Object.values(maleViewTransitions)].filter((source): source is string => Boolean(source));
    const preloads = sources.map((src) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      video.load();
      return video;
    });
    return () => {
      preloads.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (flashSizeTimerRef.current) clearTimeout(flashSizeTimerRef.current);
      if (captureFlashTimerRef.current) clearTimeout(captureFlashTimerRef.current);
      if (bookPulseTimerRef.current) clearTimeout(bookPulseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const hintTimer = window.setTimeout(() => setShowCaptureHint(false), 1800);
    return () => window.clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    if (Math.abs(placement.scale - previousFlashScaleRef.current) < 0.005) return;
    previousFlashScaleRef.current = placement.scale;
    setShowFlashSize(true);
    if (flashSizeTimerRef.current) clearTimeout(flashSizeTimerRef.current);
    flashSizeTimerRef.current = setTimeout(() => setShowFlashSize(false), 1100);
  }, [placement.scale]);

  useEffect(() => {
    const stageWidth = stageRef.current?.clientWidth ?? 390;
    const stageHeight = stageRef.current?.clientHeight ?? 844;
    const maxX = stageWidth * (0.08 + mannequinScale * 0.18);
    const maxY = stageHeight * (0.08 + mannequinScale * 0.23);
    setMannequinX((current) => clamp(current, -maxX, maxX));
    setMannequinY((current) => clamp(current, -maxY, maxY));
  }, [mannequinScale]);

  useEffect(() => {
    captureVersionRef.current += 1;
    setCapturedPreview(null);
    setCapturedReference(null);
  }, [gender, view, placement, mannequinX, mannequinY, mannequinZoom, designSrc]);

  const genderLabel = copy.genders.find((item) => item.value === gender)?.label ?? gender;
  const viewLabel = copy.views.find((item) => item.value === view)?.label ?? view;
  const anatomicalZone = getAnatomicalZone(view, placement.x, placement.y);
  const zoneReference = ANATOMICAL_ZONES[anatomicalZone];
  const areaLabel = copy.areas.find((item) => item.value === zoneReference.area)?.label ?? zoneReference.area;
  // At the initial pinch scale the design spans 60% of the local anatomical
  // reference width. Only tattoo pinch changes this ratio; body zoom is absent
  // from the physical calculation by design.
  const tattooZoneWidthRatio = 0.6 * (placement.scale / initialPlacement.scale);
  const rawFlashSizeCm = tattooZoneWidthRatio * zoneReference.widthCm;
  const rawFlashHeightCm = tattooZoneWidthRatio * zoneReference.lengthCm;
  const flashSizeCm = clamp(Math.round(rawFlashSizeCm * 2) / 2, 2, REFERENCE_BODY_HEIGHT_CM);
  const flashHeightCm = clamp(Math.round(rawFlashHeightCm * 2) / 2, 2, REFERENCE_BODY_HEIGHT_CM);
  const bookingTitle = `TEST ${String(designNumber).padStart(2, "0")} · ${genderLabel} · ${viewLabel} · ${areaLabel} · taille ${flashSizeCm.toFixed(1)} × ${flashHeightCm.toFixed(1)} cm · rotation ${Math.round(placement.rotation)}° · ${placement.mirrored ? "miroir" : "orientation normale"} · position ${Math.round(placement.x)} / ${Math.round(placement.y)}`;

  useEffect(() => {
    if (previousAnatomicalZoneRef.current === null) {
      previousAnatomicalZoneRef.current = anatomicalZone;
      return;
    }
    if (previousAnatomicalZoneRef.current === anatomicalZone) return;
    previousAnatomicalZoneRef.current = anatomicalZone;
    setShowFlashSize(true);
    if (flashSizeTimerRef.current) clearTimeout(flashSizeTimerRef.current);
    flashSizeTimerRef.current = setTimeout(() => setShowFlashSize(false), 1100);
  }, [anatomicalZone]);

  const resetPlacement = () => setPlacement(initialPlacement);
  const resetMannequin = () => {
    setMannequinY(0);
    setMannequinX(0);
    setMannequinZoom(1);
  };
  const changeView = (nextView: View) => {
    if (nextView === view) return;
    const transitions = gender === "female" ? femaleViewTransitions : maleViewTransitions;
    const transition = transitions[`${view}-${nextView}`];
    if (transition) setViewTransition({ src: transition, target: nextView });
    else {
      setView(nextView);
      setViewTransition(null);
    }
    resetPlacement();
    resetMannequin();
  };
  const uploadDesign = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setDesignSrc(url);
    setUploadedName(file.name);
  };

  const captureHasContent = (dataUrl: string) => new Promise<boolean>((resolve) => {
    const preview = new window.Image();
    preview.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve(true);
        return;
      }
      context.drawImage(preview, 0, 0, 32, 32);
      const pixels = context.getImageData(0, 0, 32, 32).data;
      let visiblePixels = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] < 238 || pixels[index + 1] < 238 || pixels[index + 2] < 238) visiblePixels += 1;
      }
      resolve(visiblePixels > 12);
    };
    preview.onerror = () => resolve(false);
    preview.src = dataUrl;
  });

  const uploadPlacement = async (dataUrl: string, captureVersion: number) => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const body = new FormData();
      body.append("file", new File([blob], `placement-test-${designNumber}.jpg`, { type: "image/jpeg" }));

      let uploadedUrl: string | null = null;
      for (let attempt = 0; attempt < 2 && !uploadedUrl; attempt += 1) {
        const response = await fetch("/api/upload", { method: "POST", body });
        const result = await response.json();
        if (response.ok && result.url) uploadedUrl = result.url;
      }
      if (!uploadedUrl) throw new Error(copy.captureFailed);
      if (captureVersionRef.current === captureVersion) setCapturedReference(uploadedUrl);
    } catch (error) {
      console.error(error);
      if (captureVersionRef.current === captureVersion) window.alert(copy.captureFailed);
    }
  };

  const capturePlacement = async (): Promise<string | null> => {
    const stage = stageRef.current;
    if (!stage || capturing || transitionPlaying) return null;
    const captureVersion = ++captureVersionRef.current;
    setCapturedReference(null);
    setCaptureFlash(true);
    if (captureFlashTimerRef.current) clearTimeout(captureFlashTimerRef.current);
    captureFlashTimerRef.current = setTimeout(() => setCaptureFlash(false), 260);
    setCapturing(true);
    try {
      await document.fonts.ready;
      await Promise.all([...stage.querySelectorAll("img")].map((image) => image.decode().catch(() => undefined)));
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      let dataUrl = await toJpeg(stage, {
        backgroundColor: "#ffffff",
        quality: 0.82,
        pixelRatio: 1,
        cacheBust: false,
        includeQueryParams: true,
        filter: (node) => !(node instanceof HTMLElement && node.hasAttribute("data-no-camera")),
      });

      if (!(await captureHasContent(dataUrl))) {
        dataUrl = await toJpeg(stage, {
          backgroundColor: "#ffffff",
          quality: 0.82,
          pixelRatio: 1,
          cacheBust: true,
          includeQueryParams: true,
          filter: (node) => !(node instanceof HTMLElement && node.hasAttribute("data-no-camera")),
        });
        if (!(await captureHasContent(dataUrl))) throw new Error(copy.captureFailed);
      }

      setCapturedPreview(dataUrl);
      setBookPulse(true);
      if (bookPulseTimerRef.current) clearTimeout(bookPulseTimerRef.current);
      bookPulseTimerRef.current = setTimeout(() => setBookPulse(false), 1500);
      void uploadPlacement(dataUrl, captureVersion);
      return dataUrl;
    } catch (error) {
      console.error(error);
      window.alert(copy.captureFailed);
      return null;
    } finally {
      setCapturing(false);
    }
  };

  const openBooking = async () => {
    setBookPulse(false);
    if (!capturedPreview) {
      const placementPreview = await capturePlacement();
      if (!placementPreview) return;
    }
    setBookingOpen(true);
  };

  const updateGesture = () => {
    const stage = stageRef.current;
    const points = [...pointersRef.current.values()];
    const gesture = gestureRef.current;
    if (!stage || !gesture || points.length === 0) return;
    const rect = stage.getBoundingClientRect();
    const center = points.length === 1 ? points[0] : { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const next = {
      ...gesture.placement,
      x: clamp(gesture.placement.x + ((center.x - gesture.center.x) / rect.width) * 100 / mannequinZoom, 0, 100),
      y: clamp(gesture.placement.y + ((center.y - gesture.center.y) / rect.height) * 100 / mannequinZoom, 0, 100),
    };
    if (points.length > 1) {
      const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180 / Math.PI;
      next.scale = clamp(gesture.placement.scale * (distance / gesture.distance), 0.18, 2.5);
      next.rotation = gesture.placement.rotation + angle - gesture.angle;
    }
    setPlacement(next);
  };

  const startGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointersRef.current.values()];
    const center = points.length === 1 ? points[0] : { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    gestureRef.current = {
      placement,
      center,
      distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 1,
      angle: points.length > 1 ? Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180 / Math.PI : 0,
    };
  };
  const moveGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    updateGesture();
  };
  const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    gestureRef.current = null;
    if (pointersRef.current.size === 1) {
      const point = [...pointersRef.current.values()][0];
      gestureRef.current = { placement, center: point, distance: 1, angle: 0 };
    }
  };

  const moveJoystick = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const joystick = joystickRef.current;
    if (!joystick || joystick.pointerId !== event.pointerId) return;
    const rawX = event.clientX - joystick.startX;
    const rawY = event.clientY - joystick.startY;
    const distance = Math.hypot(rawX, rawY);
    const radius = 23;
    const ratio = distance > radius ? radius / distance : 1;
    const x = rawX * ratio;
    const y = rawY * ratio;
    // Increase the travel with zoom, but keep a meaningful part of the body in
    // the viewport. Scaling the old fixed limits directly allowed the model to
    // disappear completely at high zoom levels.
    const stageWidth = stageRef.current?.clientWidth ?? 390;
    const stageHeight = stageRef.current?.clientHeight ?? 844;
    const maxMannequinX = stageWidth * (0.08 + mannequinScale * 0.18);
    const maxMannequinY = stageHeight * (0.08 + mannequinScale * 0.23);
    setJoystickPosition({ x, y });
    setMannequinX(clamp(joystick.mannequinX + rawX * 3.2, -maxMannequinX, maxMannequinX));
    setMannequinY(clamp(joystick.mannequinY + rawY * 3.2, -maxMannequinY, maxMannequinY));
  };

  const releaseJoystick = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (joystickRef.current?.pointerId !== event.pointerId) return;
    joystickRef.current = null;
    setJoystickPosition({ x: 0, y: 0 });
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#181818] text-white">
      <section ref={stageRef} className="absolute inset-0 select-none overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 will-change-transform" style={{ transform: `translate3d(${mannequinX}px, calc(${mannequinY}px + ${mannequinHeadFramingVh}dvh), 0) scale(${mannequinScale})`, transformOrigin: "center center" }}>
          <Image
          key={`${gender}-${view}-${anatomicalZone}`}
          src={mannequinSrc}
          alt={`Mannequin ${genderLabel.toLowerCase()}, ${viewLabel.toLowerCase()}, ${areaLabel.toLowerCase()}`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="pointer-events-none object-contain px-3 pb-[176px] sm:px-5 sm:pb-[196px]"
          />
          {viewTransition?.frozenFrame ? (
            <img
              src={viewTransition.frozenFrame}
              alt=""
              className="absolute inset-0 h-full w-full object-contain px-3 pb-[176px] sm:px-5 sm:pb-[196px]"
            />
          ) : viewTransition ? (
            <video
              key={viewTransition.src}
              src={viewTransition.src}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={(event) => {
                const video = event.currentTarget;
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");
                if (context && canvas.width && canvas.height) {
                  context.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const frozenFrame = canvas.toDataURL("image/jpeg", 0.9);
                  setView(viewTransition.target);
                  setViewTransition((current) => current?.src === viewTransition.src ? { ...current, frozenFrame } : current);
                } else {
                  setView(viewTransition.target);
                  setViewTransition(null);
                }
              }}
              onError={() => setViewTransition(null)}
              className="absolute inset-0 h-full w-full object-contain px-3 pb-[176px] sm:px-5 sm:pb-[196px]"
              aria-label="Transition du mannequin"
            />
          ) : null}
        </div>

        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-end px-4 pt-[max(12px,env(safe-area-inset-top))] text-black sm:px-6">
          <div data-no-camera className="pointer-events-auto flex gap-2">
            <button type="button" onClick={() => setPlacement((current) => ({ ...current, mirrored: !current.mirrored }))} aria-label={copy.mirror} aria-pressed={placement.mirrored} className={`grid size-9 place-items-center text-xl drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] transition-opacity ${placement.mirrored ? "text-black" : "text-black/55"}`}>↔</button>
            <button type="button" onClick={() => router.push(`/flashbook/gallery?offer=flash&selected=${designNumber}`)} aria-label={copy.close} className="grid size-9 place-items-center text-3xl leading-none text-black/60 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] transition-colors hover:text-black">×</button>
          </div>
        </header>

        <div data-no-camera className="absolute right-3 top-1/2 z-30 grid -translate-y-1/2 grid-cols-2 overflow-hidden rounded-[22px] border border-black/10 bg-white/90 text-black shadow-lg backdrop-blur sm:right-5">
          <button type="button" onClick={() => setMannequinZoom((current) => clamp(Number((current * 1.5).toFixed(2)), 1, 5))} disabled={mannequinZoom >= 5} aria-label={copy.zoomIn} className="grid size-10 place-items-center border-b border-r border-black/10 transition-colors active:bg-black/10 disabled:cursor-default disabled:text-black/25">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
              <circle cx="10.5" cy="10.5" r="6.25" />
              <path d="m15.2 15.2 4.3 4.3M10.5 7.8v5.4M7.8 10.5h5.4" />
            </svg>
          </button>
          <button type="button" onClick={() => setMannequinZoom((current) => clamp(Number((current / 1.5).toFixed(2)), 1, 5))} disabled={mannequinZoom <= 1} aria-label={copy.zoomOut} className="grid size-10 place-items-center border-b border-black/10 transition-colors active:bg-black/10 disabled:cursor-default disabled:text-black/25">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
              <circle cx="10.5" cy="10.5" r="6.25" />
              <path d="m15.2 15.2 4.3 4.3M7.8 10.5h5.4" />
            </svg>
          </button>
          <div className="col-span-2 grid h-[82px] place-items-center p-2">
            <button
              type="button"
              aria-label={copy.moveMannequin}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                joystickRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, mannequinX, mannequinY };
              }}
              onPointerMove={moveJoystick}
              onPointerUp={releaseJoystick}
              onPointerCancel={releaseJoystick}
              className="relative grid size-[66px] touch-none place-items-center rounded-full border border-black/10 bg-black/[0.06] shadow-inner"
            >
              <span className="pointer-events-none absolute inset-2 rounded-full border border-black/[0.06]" />
              <span className="pointer-events-none size-7 rounded-full bg-black shadow-[0_3px_8px_rgba(0,0,0,0.28)] transition-transform duration-75" style={{ transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)` }} />
            </button>
          </div>
        </div>

        <button data-no-camera type="button" onClick={() => void capturePlacement()} disabled={capturing || transitionPlaying} aria-label={capturedReference ? copy.retake : copy.capture} className={`absolute left-3 top-1/2 z-30 h-16 -translate-y-1/2 overflow-hidden rounded-full border border-black/10 bg-white/90 text-left text-black shadow-lg backdrop-blur transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-40 sm:left-5 ${showCaptureHint || capturing ? "w-[210px]" : "w-16"}`}>
          <span className={`absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center transition-[left,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${showCaptureHint || capturing ? "left-2.5" : "left-1/2 -translate-x-1/2"}`}>
            {capturedPreview ? <img src={capturedPreview} alt="" className="size-11 rounded-full object-cover" /> : capturing ? <span className="grid size-11 place-items-center animate-pulse text-xs">•••</span> : (
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-8">
                <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h2l1.2-1.8h5.6L16 6h2a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </svg>
            )}
          </span>
          <span className={`absolute left-[66px] top-1/2 w-[130px] -translate-y-1/2 text-[11px] font-semibold leading-tight transition-opacity duration-150 ${showCaptureHint || capturing ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            {capturing ? copy.capturing : capturedReference ? copy.retake : copy.capture}
          </span>
        </button>

        <div data-no-camera aria-hidden className={`pointer-events-none absolute inset-0 z-[80] bg-white transition-opacity duration-300 ${captureFlash ? "opacity-95 duration-75" : "opacity-0"}`} />

        <div className="pointer-events-none absolute inset-0 will-change-transform" style={{ transform: `translate3d(${mannequinX}px, ${mannequinY}px, 0) scale(${mannequinZoom})`, transformOrigin: "center center" }}>
          <div className="absolute left-0 top-0 h-full w-full" style={{ transform: `translate(${placement.x}%, ${placement.y}%) rotate(${placement.rotation}deg) scale(${placement.scale}) scaleX(${placement.mirrored ? -1 : 1})`, transformOrigin: "0 0", mixBlendMode: "multiply" }}>
            <div onPointerDown={startGesture} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} className="pointer-events-auto relative h-[30%] w-[72%] -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab active:cursor-grabbing">
              <Image src={designSrc} alt="Design à positionner" fill unoptimized sizes="70vw" className="pointer-events-none object-contain" />
            </div>
          </div>
        </div>

        <div data-no-camera className="pointer-events-none absolute bottom-[212px] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[10px] text-white/90 shadow-lg backdrop-blur sm:bottom-[232px]">{copy.gesture}</div>

        <div data-no-camera aria-live="polite" className={`pointer-events-none absolute left-1/2 top-[72px] z-30 -translate-x-1/2 rounded-full border border-black/10 bg-white/85 px-3 py-1 font-mono text-[11px] font-medium tabular-nums text-black/65 shadow-sm backdrop-blur transition-all duration-200 ${showFlashSize ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}>
          {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(flashSizeCm)} × {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(flashHeightCm)} cm
        </div>

        <aside data-no-camera className="absolute inset-x-2 bottom-[max(8px,env(safe-area-inset-bottom))] z-30 rounded-[26px] border border-black/10 bg-[#f3f1ec]/95 p-2.5 text-black shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:inset-x-4 sm:mx-auto sm:max-w-xl sm:p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">{uploadedName}</p>
            {allowUpload && <label className="cursor-pointer rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold text-white">{copy.import}<input type="file" accept="image/png,image/webp,image/jpeg" onChange={uploadDesign} className="sr-only" /></label>}
          </div>
          <CompactChoices items={copy.genders} value={gender} onChange={(next) => { setGender(next); setViewTransition(null); resetPlacement(); resetMannequin(); }} />
          <CompactChoices items={copy.views} value={view} onChange={changeView} />
          {!allowUpload && <button type="button" onClick={() => void openBooking()} disabled={capturing || transitionPlaying} className={`mt-2 flex w-full items-center justify-between gap-3 rounded-full bg-black px-5 py-3 text-xs font-semibold text-white transition-[transform,box-shadow,opacity] disabled:opacity-50 ${bookPulse ? "animate-pulse scale-[1.015] shadow-[0_0_0_4px_rgba(255,255,255,0.72),0_8px_22px_rgba(0,0,0,0.24)]" : ""}`}><span>{capturing ? copy.capturing : copy.book}</span><span aria-hidden>→</span></button>}
        </aside>
      </section>
      <BookingSheet open={bookingOpen} onClose={() => setBookingOpen(false)} flashTitle={bookingTitle} capturedReference={capturedReference ?? undefined} capturedPreview={capturedPreview ?? undefined} />
    </main>
  );
}

function CompactChoices<T extends string>({ items, value, onChange, compact = false }: { items: { value: T; label: string }[]; value: T; onChange: (value: T) => void; compact?: boolean }) {
  return <div className={`mt-1.5 grid gap-1 rounded-full bg-black/[0.055] p-1 ${compact ? "grid-cols-3" : items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
    {items.map((item) => <button key={item.value} type="button" onClick={() => onChange(item.value)} className={`min-w-0 rounded-full px-2 py-2 text-[11px] font-medium transition-colors sm:text-xs ${value === item.value ? "bg-black text-white shadow-sm" : "text-black/50"}`}>{item.label}</button>)}
  </div>;
}
