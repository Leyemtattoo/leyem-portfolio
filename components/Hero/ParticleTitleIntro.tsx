"use client";

import { useEffect, useRef, type RefObject } from "react";

type Particle = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  delay: number;
};

export default function ParticleTitleIntro({
  lines,
  target,
  onReveal,
}: {
  lines: string[];
  target: RefObject<HTMLHeadingElement | null>;
  onReveal: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialLinesRef = useRef(lines);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    const introLines = initialLinesRef.current;
    let hasRevealed = false;
    const reveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;
      onRevealRef.current();
    };
    // Mobile Safari can suspend requestAnimationFrame while its browser chrome
    // settles. Never leave the real title hidden if the particle intro stalls.
    const revealFallback = window.setTimeout(reveal, 2000);
    const canvas = canvasRef.current;
    const heading = target.current;
    if (!canvas || !heading) {
      reveal();
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = window.sessionStorage.getItem("leyem-particle-intro") === "1";
    if (reduceMotion || alreadyPlayed) {
      reveal();
      return;
    }

    window.sessionStorage.setItem("leyem-particle-intro", "1");
    const context = canvas.getContext("2d");
    if (!context) {
      reveal();
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(pixelRatio, pixelRatio);

    const rect = heading.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(heading);
    const fontFamily = computedStyle.fontFamily;
    const baseFontSize = Number.parseFloat(computedStyle.fontSize);
    const mask = document.createElement("canvas");
    mask.width = Math.max(1, Math.round(width));
    mask.height = Math.max(1, Math.round(height));
    const maskContext = mask.getContext("2d", { willReadFrequently: true });
    if (!maskContext) {
      reveal();
      return;
    }

    maskContext.fillStyle = "#fff";
    maskContext.textBaseline = "top";
    introLines.forEach((line, index) => {
      const lineScale = introLines[0].startsWith("BONJOUR") && index === 0 ? 1.3 : 1;
      const lineFontSize = baseFontSize * lineScale;
      maskContext.font = `900 ${lineFontSize}px ${fontFamily}`;
      maskContext.fillText(line, rect.left, rect.top + index * baseFontSize * 0.83);
    });

    const imageData = maskContext.getImageData(0, 0, mask.width, mask.height).data;
    const candidates: Array<{ x: number; y: number }> = [];
    const sampleStep = width < 480 ? 3 : 4;
    for (let y = Math.max(0, Math.floor(rect.top)); y < Math.min(height, Math.ceil(rect.bottom)); y += sampleStep) {
      for (let x = Math.max(0, Math.floor(rect.left)); x < Math.min(width, Math.ceil(rect.right)); x += sampleStep) {
        if (imageData[(y * mask.width + x) * 4 + 3] > 100) candidates.push({ x, y });
      }
    }

    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
    }

    const particleCount = Math.min(width < 480 ? 1050 : 1400, candidates.length);
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    const particles: Particle[] = candidates.slice(0, particleCount).map(({ x, y }) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * Math.min(width * 0.72, 330);
      return {
        startX: centerX + Math.cos(angle) * radius,
        startY: centerY + Math.sin(angle) * radius * 0.62,
        targetX: x,
        targetY: y,
        size: 0.8 + Math.random() * 1.7,
        delay: Math.random() * 0.24,
      };
    });

    let frame = 0;
    let revealed = false;
    const startedAt = performance.now();
    const duration = 1450;
    const easeOut = (value: number) => 1 - Math.pow(1 - value, 4);

    const draw = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      context.clearRect(0, 0, width, height);
      const fade = progress > 0.82 ? 1 - (progress - 0.82) / 0.18 : 1;

      if (!revealed && progress >= 0.8) {
        revealed = true;
        reveal();
      }

      context.fillStyle = `rgba(255,255,255,${Math.max(0, fade)})`;
      particles.forEach((particle) => {
        const localProgress = Math.max(0, Math.min(1, (progress - particle.delay) / (1 - particle.delay)));
        const eased = easeOut(localProgress);
        const x = particle.startX + (particle.targetX - particle.startX) * eased;
        const y = particle.startY + (particle.targetY - particle.startY) * eased;
        context.beginPath();
        context.arc(x, y, particle.size * (0.7 + eased * 0.3), 0, Math.PI * 2);
        context.fill();
      });

      if (progress < 1) frame = window.requestAnimationFrame(draw);
      else canvas.style.display = "none";
    };

    frame = window.requestAnimationFrame(draw);
    return () => {
      window.clearTimeout(revealFallback);
      window.cancelAnimationFrame(frame);
    };
  }, [target]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[30]" />;
}
