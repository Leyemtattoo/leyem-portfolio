"use client";

import { miniFlashDesigns, miniFlashName } from "@/components/Flashbook/miniFlashes";

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
type ViewTransition = { src: string; target: View };

const gestureHelp: Record<Locale, { title: string; steps: string[] }> = {
  fr: { title: "Ajuste ton flash", steps: ["Glisse pour le placer.", "Pince à deux doigts pour changer sa taille.", "Tourne à deux doigts pour l’orienter."] },
  en: { title: "Adjust your flash", steps: ["Drag to place it.", "Pinch with two fingers to resize it.", "Rotate with two fingers to change its angle."] },
  de: { title: "Passe dein Flash an", steps: ["Ziehe es an die gewünschte Stelle.", "Ziehe zwei Finger zusammen oder auseinander für die Größe.", "Drehe es mit zwei Fingern für den Winkel."] },
  es: { title: "Ajusta tu flash", steps: ["Arrastra para colocarlo.", "Pellizca con dos dedos para cambiar el tamaño.", "Gira con dos dedos para orientarlo."] },
};

const INITIAL_MANNEQUIN_ZOOM = 1.5;
const MAX_MANNEQUIN_ZOOM = 2.25;
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
  fr: { genders: [{ value: "female", label: "Femme" }, { value: "male", label: "Homme" }], views: [{ value: "face", label: "Face" }, { value: "side", label: "Côté" }, { value: "back", label: "Dos" }], areas: [{ value: "torso", label: "Torse" }, { value: "arm", label: "Bras" }, { value: "leg", label: "Jambe" }], gesture: "Glisser · Pincer · Tourner", book: "Réserver", mirror: "Retourner le flash en miroir", close: "Revenir à la galerie", import: "Importer", moveUp: "Monter le mannequin", moveDown: "Descendre le mannequin", moveLeft: "Déplacer le mannequin à gauche", moveRight: "Déplacer le mannequin à droite", moveMannequin: "Déplacer le mannequin", zoomIn: "Zoomer sur le mannequin", zoomOut: "Dézoomer le mannequin", capture: "Joindre une photo du placement", capturing: "Ajout de la photo…", retake: "Remplacer la photo", captureFailed: "La photo du placement n’a pas pu être ajoutée. Réessaie." },
  en: { genders: [{ value: "female", label: "Woman" }, { value: "male", label: "Man" }], views: [{ value: "face", label: "Front" }, { value: "side", label: "Side" }, { value: "back", label: "Back" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Arm" }, { value: "leg", label: "Leg" }], gesture: "Drag · Pinch · Rotate", book: "Book", mirror: "Mirror the flash", close: "Back to gallery", import: "Upload", moveUp: "Move mannequin up", moveDown: "Move mannequin down", moveLeft: "Move mannequin left", moveRight: "Move mannequin right", moveMannequin: "Move mannequin", zoomIn: "Zoom in on mannequin", zoomOut: "Zoom out on mannequin", capture: "Attach a placement photo", capturing: "Attaching photo…", retake: "Replace photo", captureFailed: "The placement photo could not be attached. Please try again." },
  de: { genders: [{ value: "female", label: "Frau" }, { value: "male", label: "Mann" }], views: [{ value: "face", label: "Vorne" }, { value: "side", label: "Seite" }, { value: "back", label: "Rücken" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Arm" }, { value: "leg", label: "Bein" }], gesture: "Ziehen · Zoomen · Drehen", book: "Buchen", mirror: "Flash spiegeln", close: "Zurück zur Galerie", import: "Hochladen", moveUp: "Mannequin nach oben", moveDown: "Mannequin nach unten", moveLeft: "Mannequin nach links", moveRight: "Mannequin nach rechts", moveMannequin: "Mannequin bewegen", zoomIn: "Mannequin vergrößern", zoomOut: "Mannequin verkleinern", capture: "Foto der Platzierung anhängen", capturing: "Foto wird angehängt…", retake: "Foto ersetzen", captureFailed: "Das Platzierungsfoto konnte nicht angehängt werden. Bitte erneut versuchen." },
  es: { genders: [{ value: "female", label: "Mujer" }, { value: "male", label: "Hombre" }], views: [{ value: "face", label: "Frente" }, { value: "side", label: "Perfil" }, { value: "back", label: "Espalda" }], areas: [{ value: "torso", label: "Torso" }, { value: "arm", label: "Brazo" }, { value: "leg", label: "Pierna" }], gesture: "Deslizar · Pellizcar · Girar", book: "Reservar", mirror: "Reflejar el flash", close: "Volver a la galería", import: "Subir", moveUp: "Subir el maniquí", moveDown: "Bajar el maniquí", moveLeft: "Mover el maniquí a la izquierda", moveRight: "Mover el maniquí a la derecha", moveMannequin: "Mover el maniquí", zoomIn: "Acercar el maniquí", zoomOut: "Alejar el maniquí", capture: "Adjuntar foto de la colocación", capturing: "Adjuntando foto…", retake: "Cambiar foto", captureFailed: "No se pudo adjuntar la foto de colocación. Inténtalo de nuevo." },
};

const initialPlacement: Placement = { x: 50, y: 44, scale: 0.72, rotation: 0, mirrored: false };
const flashDesigns = { 1: "/images/flashbook/TEST-01-placement-v2.png", 2: "/images/flashbook/TEST-02.webp", 3: "/images/flashbook/TEST-03.webp", 4: "/images/flashbook/TEST-04.webp", 5: "/images/walkins/angel-skull-full.png", 6: "/images/flashbook/arkansas-lovin-man.png", 7: "/images/flashbook/medusam.png", 8: "/images/flashbook/medusa.png", 9: "/images/flashbook/just-pray.png" } as const;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function PlacementStudio({ designNumber = 1, miniIndex, allowUpload = false }: { designNumber?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; miniIndex?: number; allowUpload?: boolean }) {
  const router = useRouter();
  const { locale } = useTranslation();
  const copy = studioCopy[locale];
  const [stageSize, setStageSize] = useState({ width: 390, height: 844 });
  const [gender, setGender] = useState<Gender>("female");
  const [view, setView] = useState<View>("face");
  const miniDesign = miniIndex !== undefined ? miniFlashDesigns[miniIndex] : undefined;
  const [designSrc, setDesignSrc] = useState<string>(miniDesign?.image ?? flashDesigns[designNumber]);
  const [uploadedName, setUploadedName] = useState(miniDesign ? miniFlashName(miniIndex!) : designNumber === 9 ? "Just pray" : designNumber === 7 ? "Medusam" : designNumber === 8 ? "Medus@" : designNumber === 6 ? "Arkansas lovin’ man" : designNumber === 5 ? "Angel skull" : designNumber === 1 ? "Mary Bird" : `TEST ${String(designNumber).padStart(2, "0")}`);
  const hasSixCmMinimum = !miniDesign && (designNumber === 1 || designNumber === 5 || designNumber === 6);
  const hasTenCmMinimum = !miniDesign && (designNumber === 7 || designNumber === 8);
  const maximumHeightCm = miniDesign?.maximumCm;
  const minimumHeightCm = miniDesign ? maximumHeightCm ? maximumHeightCm / Math.max(1, miniDesign.aspectRatio ?? 0.75) : miniDesign.minimumCm ?? 6 : designNumber === 9 ? 7 : hasTenCmMinimum ? 10 : 6;
  const hasMinimumSize = Boolean(miniDesign) || hasSixCmMinimum || hasTenCmMinimum || designNumber === 9;
  const defaultFlashScale = miniDesign ? minimumHeightCm * 0.0367 : designNumber === 9 ? 0.26 : hasTenCmMinimum ? 0.36 : hasSixCmMinimum ? 0.22 : initialPlacement.scale;
  const [placement, setPlacement] = useState<Placement>(() => ({ ...initialPlacement, scale: defaultFlashScale }));
  const [mannequinY, setMannequinY] = useState(0);
  const [mannequinX, setMannequinX] = useState(0);
  const initialMannequinZoom = miniDesign ? 3 : INITIAL_MANNEQUIN_ZOOM;
  const maxMannequinZoom = miniDesign ? 4.5 : MAX_MANNEQUIN_ZOOM;
  const [mannequinZoom, setMannequinZoom] = useState(initialMannequinZoom);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [viewTransition, setViewTransition] = useState<ViewTransition | null>(null);
  const [capturedReference, setCapturedReference] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{ placement: Placement; center: { x: number; y: number }; distance: number; angle: number } | null>(null);
  const joystickRef = useRef<{ pointerId: number; startX: number; startY: number; mannequinX: number; mannequinY: number } | null>(null);
  const captureFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureVersionRef = useRef(0);
  const captureInFlight = useRef(false);

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
  const mannequinImages = gender === "female" ? femaleMannequins : fullMannequins;
  const mannequinSrc = mannequinImages[view];
  const framedView = viewTransition?.target ?? view;
  const mannequinBaseScale = gender === "male"
    ? (framedView === "side" ? 1.5 : framedView === "back" ? 1.3 : 1.25)
    : (framedView === "side" ? 1.42 : 1.22);
  const mannequinScale = mannequinBaseScale * mannequinZoom;
  const transitionPlaying = viewTransition !== null;
  const imagePadding = stageSize.width >= 640 ? 196 : 176;
  const imageWidth = stageSize.width - (stageSize.width >= 640 ? 40 : 24);
  const imageHeight = Math.min(stageSize.height - imagePadding, imageWidth * 2400 / 1696);
  const imageTop = (stageSize.height - imagePadding - imageHeight) / 2;
  const initialScale = mannequinBaseScale * INITIAL_MANNEQUIN_ZOOM;
  const headTop = imageTop + imageHeight * 0.035;
  const mannequinHeadFramingPx = Math.max(0, 16 - (stageSize.height / 2 + (headTop - stageSize.height / 2) * initialScale));
  const bellyTop = stageSize.height / 2 + (imageTop + imageHeight * 0.37 - stageSize.height / 2) * initialScale + mannequinHeadFramingPx;
  // Keep the tattoo anchored to the body despite the fixed head framing offset.
  const tattooFramingY = mannequinHeadFramingPx * (1 - mannequinZoom / INITIAL_MANNEQUIN_ZOOM);
  const initialBellyY = ((bellyTop - stageSize.height / 2) / INITIAL_MANNEQUIN_ZOOM + stageSize.height / 2) / stageSize.height * 100;
  // Frame the torso and its flash together in the usable center of the screen.
  const initialMannequinY = stageSize.height * 0.45 - (
    stageSize.height / 2 + (initialBellyY / 100 * stageSize.height - stageSize.height / 2) * initialMannequinZoom
    + mannequinHeadFramingPx * (1 - initialMannequinZoom / INITIAL_MANNEQUIN_ZOOM)
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPlacement({ ...initialPlacement, scale: defaultFlashScale, y: initialBellyY });
    setMannequinX(0);
    setMannequinY(initialMannequinY);
  }, [initialBellyY, defaultFlashScale, initialMannequinY]);

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
      if (captureFlashTimerRef.current) clearTimeout(captureFlashTimerRef.current);
    };
  }, []);


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
  const rawFlashSizeCm = hasMinimumSize
    ? minimumHeightCm * (miniDesign ? miniDesign.aspectRatio ?? 0.75 : designNumber === 9 ? 655 / 875 : hasTenCmMinimum ? 1650 / 1383 : designNumber === 5 ? 641 / 818 : designNumber === 6 ? 1024 / 1280 : 2480 / 3508) * (placement.scale / defaultFlashScale)
    : tattooZoneWidthRatio * zoneReference.widthCm;
  const rawFlashHeightCm = hasMinimumSize
    ? minimumHeightCm * (placement.scale / defaultFlashScale)
    : tattooZoneWidthRatio * zoneReference.lengthCm;
  const flashSizeCm = clamp(Math.round(rawFlashSizeCm * 2) / 2, 2, REFERENCE_BODY_HEIGHT_CM);
  const flashHeightCm = clamp(Math.round(rawFlashHeightCm * 2) / 2, 2, REFERENCE_BODY_HEIGHT_CM);
  const bookingTitle = `${uploadedName} · ${genderLabel} · ${viewLabel} · ${areaLabel} · taille ${flashSizeCm.toFixed(1)} × ${flashHeightCm.toFixed(1)} cm · rotation ${Math.round(placement.rotation)}° · ${placement.mirrored ? "miroir" : "orientation normale"} · position ${Math.round(placement.x)} / ${Math.round(placement.y)}`;

  const resetPlacement = () => setPlacement({ ...initialPlacement, scale: defaultFlashScale, y: initialBellyY });
  const resetMannequin = () => {
    setMannequinY(initialMannequinY);
    setMannequinX(0);
    setMannequinZoom(initialMannequinZoom);
  };
  const changeView = (nextView: View) => {
    if (nextView === view) return;
    const transitions = gender === "female" ? femaleViewTransitions : maleViewTransitions;
    const transition = transitions[`${view}-${nextView}`];
    if (transition) {
      const targetImage = new window.Image();
      targetImage.src = mannequinImages[nextView];
      setViewTransition({ src: transition, target: nextView });
    } else {
      setView(nextView);
      setViewTransition(null);
    }
    resetPlacement();
    resetMannequin();
  };
  const finishViewTransition = () => {
    if (!viewTransition) return;
    setView(viewTransition.target);
    setViewTransition(null);
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
        const response = await fetch("/api/upload", { method: "POST", body, signal: AbortSignal.timeout(15000) });
        const result = await response.json();
        if (response.ok && result.url) uploadedUrl = result.url;
      }
      if (!uploadedUrl) throw new Error(copy.captureFailed);
      if (captureVersionRef.current === captureVersion) setCapturedReference(uploadedUrl);
      return uploadedUrl;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const capturePlacement = async (): Promise<string | null> => {
    const stage = stageRef.current;
    if (!stage || captureInFlight.current || transitionPlaying) return null;
    captureInFlight.current = true;
    setCaptureFailed(false);
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
      const uploaded = await uploadPlacement(dataUrl, captureVersion);
      if (!uploaded) throw new Error(copy.captureFailed);
      return dataUrl;
    } catch (error) {
      console.error(error);
      setCaptureFailed(true);
      return null;
    } finally {
      captureInFlight.current = false;
      setCapturing(false);
    }
  };

  const openBooking = () => {
    setBookingOpen(true);
    void capturePlacement();
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
      next.scale = clamp(gesture.placement.scale * (distance / Math.max(gesture.distance, 1)), maximumHeightCm ? defaultFlashScale / 3 : hasMinimumSize ? defaultFlashScale : 0.18, maximumHeightCm ? defaultFlashScale : 2.5);
      const angleDelta = ((angle - gesture.angle + 540) % 360) - 180;
      next.rotation = gesture.placement.rotation + angleDelta;
    }
    setPlacement(next);
  };

  const startGesture = (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    stageRef.current?.setPointerCapture(event.pointerId);
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
  const moveGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    updateGesture();
  };
  const endGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
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
    const maxMannequinX = Math.max(Math.abs(joystick.mannequinX), stageWidth * (0.08 + mannequinScale * 0.18));
    const maxMannequinY = Math.max(Math.abs(joystick.mannequinY), stageHeight * (0.08 + mannequinScale * 0.23));
    setJoystickPosition({ x, y });
    setMannequinX(clamp(joystick.mannequinX + rawX * 3.2, -maxMannequinX, maxMannequinX));
    setMannequinY(clamp(joystick.mannequinY + rawY * 3.2, -maxMannequinY, maxMannequinY));
  };

  const zoomOnFlash = (factor: number) => {
    const nextZoom = clamp(Number((mannequinZoom * factor).toFixed(2)), INITIAL_MANNEQUIN_ZOOM, maxMannequinZoom);
    if (nextZoom === mannequinZoom) return;
    const width = stageRef.current?.clientWidth ?? stageSize.width;
    const height = stageRef.current?.clientHeight ?? stageSize.height;
    // Frame the flash above the booking controls and move both layers together.
    const nextFramingY = mannequinHeadFramingPx * (1 - nextZoom / INITIAL_MANNEQUIN_ZOOM);
    setMannequinX(-(placement.x / 100 - 0.5) * width * nextZoom);
    setMannequinY(height * (0.45 - 0.5) - (placement.y / 100 - 0.5) * height * nextZoom - nextFramingY);
    setMannequinZoom(nextZoom);
  };

  const releaseJoystick = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (joystickRef.current?.pointerId !== event.pointerId) return;
    joystickRef.current = null;
    setJoystickPosition({ x: 0, y: 0 });
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#181818] text-white">
      <section ref={stageRef}
        onPointerDown={(event) => {
          // Track both fingers across the whole mannequin, including outside the tiny flash.
          if (!(event.target as HTMLElement).closest("[data-no-camera], button, a, input")) startGesture(event);
        }}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        className="absolute inset-0 touch-none select-none overflow-hidden bg-white">
        {/* Let the browser rerasterize the original photo at each zoom level. */}
        <div className="pointer-events-none absolute inset-0" style={{ transform: `translate(${mannequinX}px, ${mannequinY + mannequinHeadFramingPx}px) scale(${mannequinScale})`, transformOrigin: "center center" }}>
          <Image
          key={`${gender}-${view}`}
          src={mannequinSrc}
          alt={`Mannequin ${genderLabel.toLowerCase()}, ${viewLabel.toLowerCase()}, ${areaLabel.toLowerCase()}`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="pointer-events-none object-contain px-3 pb-[176px] sm:px-5 sm:pb-[196px]"
          />
          {viewTransition ? (
            <video
              key={viewTransition.src}
              src={viewTransition.src}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={finishViewTransition}
              onError={finishViewTransition}
              className="absolute inset-0 h-full w-full object-contain px-3 pb-[176px] sm:px-5 sm:pb-[196px]"
              aria-label="Transition du mannequin"
            />
          ) : null}
        </div>

        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-end px-4 pt-[max(12px,env(safe-area-inset-top))] text-black sm:px-6">
          <div data-no-camera className="pointer-events-auto flex gap-2">
            <button type="button" popoverTarget="studio-gesture-help" aria-label={{ fr: "Aide pour ajuster le flash", en: "Help adjusting your flash", de: "Hilfe zum Anpassen des Flashs", es: "Ayuda para ajustar tu flash" }[locale]} className="grid size-9 place-items-center text-[#686b70] transition-colors hover:text-[#e70101]">
              <span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-current text-[12px] font-medium">?</span>
            </button>
            <button type="button" onClick={() => setPlacement((current) => ({ ...current, mirrored: !current.mirrored }))} aria-label={copy.mirror} aria-pressed={placement.mirrored} className={`grid size-9 place-items-center text-xl drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] transition-opacity ${placement.mirrored ? "text-[#e70101]" : "text-[#686b70]"}`}>↔</button>

            <button type="button" onClick={() => router.push("/flashbook?return=gallery#designs", { scroll: false })} aria-label={copy.close} className="grid size-9 place-items-center text-3xl leading-none text-black/60 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] transition-colors hover:text-black">×</button>
          </div>
        </header>
        <div data-no-camera>
<div id="studio-gesture-help" popover="auto" aria-labelledby="studio-gesture-help-title" className="fixed bottom-auto left-auto right-4 top-[max(64px,calc(env(safe-area-inset-top)+56px))] m-0 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-black/10 bg-[#fffaf1]/95 px-4 py-3 text-[#686b70] shadow-lg backdrop-blur">
          <p id="studio-gesture-help-title" className="mb-1.5 text-[11px] font-semibold text-black/65">{gestureHelp[locale].title}</p>
          <ul className="space-y-1">
            {gestureHelp[locale].steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2 text-[10px] leading-4 sm:text-[11px]">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  {index === 0 ? <path d="M4 12h16m-4-4 4 4-4 4M8 8l-4 4 4 4" /> : index === 1 ? <path d="m4 4 6 6m10 10-6-6M4 9V4h5m11 11v5h-5" /> : <><path d="M20 10a8 8 0 1 0-2 8M20 4v6h-6" /><circle cx="12" cy="12" r="1" /></>}
                </svg>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        </div>

                    <div data-no-camera className="absolute right-3 top-1/2 z-30 grid -translate-y-1/2 grid-cols-2 rounded-[22px] border border-black/10 bg-white/90 text-black shadow-lg backdrop-blur sm:right-5">
          <button type="button" onClick={() => zoomOnFlash(1.5)} disabled={mannequinZoom >= maxMannequinZoom} aria-label={copy.zoomIn} className="grid size-10 place-items-center border-b border-r border-black/10 transition-colors active:bg-black/10 disabled:cursor-default disabled:text-black/25">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
              <circle cx="10.5" cy="10.5" r="6.25" />
              <path d="m15.2 15.2 4.3 4.3M10.5 7.8v5.4M7.8 10.5h5.4" />
            </svg>
          </button>
          <button type="button" onClick={() => zoomOnFlash(1 / 1.5)} disabled={mannequinZoom <= INITIAL_MANNEQUIN_ZOOM} aria-label={copy.zoomOut} className="grid size-10 place-items-center border-b border-black/10 transition-colors active:bg-black/10 disabled:cursor-default disabled:text-black/25">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
              <circle cx="10.5" cy="10.5" r="6.25" />
              <path d="m15.2 15.2 4.3 4.3M7.8 10.5h5.4" />
            </svg>
          </button>
          <div className="col-span-2 grid place-items-center gap-1 p-2">
            <button
              type="button"
              aria-label={copy.moveMannequin}
              title={{ fr: "Glisse pour déplacer le mannequin", en: "Drag to move the mannequin", de: "Ziehen, um das Modell zu bewegen", es: "Arrastra para mover el maniquí" }[locale]}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                joystickRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, mannequinX, mannequinY };
              }}
              onPointerMove={moveJoystick}
              onPointerUp={releaseJoystick}
              onPointerCancel={releaseJoystick}
              className="relative grid size-[66px] touch-none cursor-grab place-items-center rounded-full border border-black/10 bg-black/[0.04] shadow-inner active:cursor-grabbing"
            >
              <span className="pointer-events-none absolute inset-2 rounded-full border border-black/[0.06]" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 text-[10px] text-black/40"><span className="absolute left-1/2 top-0 -translate-x-1/2">▴</span><span className="absolute bottom-0 left-1/2 -translate-x-1/2">▾</span><span className="absolute left-1 top-1/2 -translate-y-1/2">◂</span><span className="absolute right-1 top-1/2 -translate-y-1/2">▸</span></span>
              <span className="pointer-events-none grid size-8 place-items-center rounded-full border border-[#e70101]/20 bg-[#fffaf1] text-[#e70101] shadow-[0_2px_5px_rgba(0,0,0,0.10)] transition-transform duration-75" style={{ transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)` }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18m-12-6 3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3" /></svg>
              </span>
            </button>
            <span className="pointer-events-none text-[9px] text-[#686b70]">{{ fr: "Déplacer", en: "Move", de: "Bewegen", es: "Mover" }[locale]}</span>
          </div>

        </div>





        <div data-no-camera aria-hidden className={`pointer-events-none absolute inset-0 z-[80] bg-white transition-opacity duration-300 ${captureFlash ? "opacity-95 duration-75" : "opacity-0"}`} />

        <div className="pointer-events-none absolute inset-0" style={{ transform: `translate(${mannequinX}px, ${mannequinY + tattooFramingY}px) scale(${mannequinZoom})`, transformOrigin: "center center", mixBlendMode: "multiply", opacity: designNumber === 5 ? 0.88 : 1 }}>
          <div className="absolute left-0 top-0 h-full w-full" style={{ transform: `translate(${placement.x}%, ${placement.y}%) rotate(${placement.rotation}deg) scale(${placement.scale}) scaleX(${placement.mirrored ? -1 : 1})`, transformOrigin: "0 0" }}>
            <div className="pointer-events-auto relative h-[30%] w-[72%] -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab active:cursor-grabbing" style={miniDesign ? {
              height: imageHeight * mannequinBaseScale * (minimumHeightCm / REFERENCE_BODY_HEIGHT_CM) / defaultFlashScale,
              width: imageHeight * mannequinBaseScale * (minimumHeightCm / REFERENCE_BODY_HEIGHT_CM) * (miniDesign?.aspectRatio ?? 0.75) / defaultFlashScale,
            } : undefined}>
              <Image src={designSrc} alt="Design à positionner" fill unoptimized sizes="70vw" className="pointer-events-none object-contain" />
            </div>
          </div>
        </div>





        <div data-no-camera aria-live="polite" className="pointer-events-none absolute left-1/2 top-[72px] z-30 -translate-x-1/2 rounded-full border border-black/10 bg-white/85 px-3 py-1 font-mono text-[11px] font-medium tabular-nums text-black/65 shadow-sm backdrop-blur">
          {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(flashSizeCm)} × {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(flashHeightCm)} cm
        </div>

        <aside data-no-camera className="absolute inset-x-2 bottom-[max(8px,env(safe-area-inset-bottom))] z-30 rounded-[26px] border border-black/10 bg-[#fffaf1]/95 p-2.5 text-black shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:inset-x-4 sm:mx-auto sm:max-w-xl sm:p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">{uploadedName}</p>
            {allowUpload && <label className="cursor-pointer rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold text-white">{copy.import}<input type="file" accept="image/png,image/webp,image/jpeg" onChange={uploadDesign} className="sr-only" /></label>}
          </div>
          <div className="flex items-center gap-2">
          <div className="flex shrink-0 gap-1 rounded-full border border-black/10 bg-white/50 p-1">
            {copy.genders.map((item) => (
              <button key={item.value} type="button" aria-label={item.label} title={item.label} aria-pressed={gender === item.value}
                onClick={() => { setGender(item.value); setViewTransition(null); resetPlacement(); resetMannequin(); }}
                className={`grid size-10 place-items-center rounded-full transition-colors ${gender === item.value ? "bg-[#fffaf1] text-[#e70101]" : "text-[#686b70] hover:text-[#e70101]"}`}>
                <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {item.value === "female" ? <><circle cx="12" cy="8" r="5" /><path d="M12 13v8m-3-3h6" /></> : <><circle cx="9" cy="15" r="5" /><path d="m13 11 7-7m-5 0h5v5" /></>}
                </svg>
              </button>
            ))}
          </div>
          <div className="min-w-0 flex-1"><CompactChoices items={copy.views} value={view} onChange={changeView} /></div>
          </div>
          {!allowUpload && <button type="button" onClick={() => void openBooking()} disabled={capturing || transitionPlaying} className={`mt-2 flex w-full items-center justify-between gap-3 rounded-full bg-[#e70101] px-5 py-3 text-xs font-semibold text-[#fffaf1] transition-[transform,box-shadow,opacity] disabled:opacity-50`}><span>{capturing ? copy.capturing : copy.book}</span><span aria-hidden>→</span></button>}
        </aside>
      </section>
      <BookingSheet open={bookingOpen} onClose={() => setBookingOpen(false)} flashTitle={bookingTitle} capturedReference={capturedReference ?? undefined} capturedPreview={capturedPreview ?? undefined} attachmentStatus={capturing ? "pending" : captureFailed ? "failed" : undefined} />
    </main>
  );
}

function CompactChoices<T extends string>({ items, value, onChange, compact = false }: { items: { value: T; label: string }[]; value: T; onChange: (value: T) => void; compact?: boolean }) {
  return <div className={`mt-1.5 grid gap-1 rounded-full bg-black/[0.055] p-1 ${compact ? "grid-cols-3" : items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
    {items.map((item) => <button key={item.value} type="button" onClick={() => onChange(item.value)} className={`min-w-0 rounded-full px-2 py-2 text-[11px] font-medium transition-colors sm:text-xs ${value === item.value ? "bg-[#fffaf1] text-[#e70101]" : "text-[#686b70]"}`}>{item.label}</button>)}
  </div>;
}
