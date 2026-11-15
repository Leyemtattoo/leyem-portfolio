"use client";

import { useEffect, useRef } from "react";

export default function CatVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;
    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = "auto";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let frame = 0;
    let lastTime = -1;
    const background = new Uint8Array(canvas.width * canvas.height);
    const queue = new Int32Array(background.length);
    const draw = () => {
      if (disposed || video.readyState < 2 || video.currentTime === lastTime) return;
      lastTime = video.currentTime;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      // Remove only darkness connected to the backdrop, preserving eyes and nose.
      background.fill(0);
      let head = 0;
      let tail = 0;
      const visit = (pixel: number) => {
        if (background[pixel]) return;
        const i = pixel * 4;
        if (Math.max(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]) >= 90) return;
        background[pixel] = 1;
        queue[tail++] = pixel;
      };
      for (let x = 0; x < canvas.width; x++) { visit(x); visit((canvas.height - 1) * canvas.width + x); }
      for (let y = 0; y < canvas.height; y++) { visit(y * canvas.width); visit(y * canvas.width + canvas.width - 1); }
      while (head < tail) {
        const pixel = queue[head++];
        const x = pixel % canvas.width;
        if (x > 0) visit(pixel - 1);
        if (x < canvas.width - 1) visit(pixel + 1);
        if (pixel >= canvas.width) visit(pixel - canvas.width);
        if (pixel < background.length - canvas.width) visit(pixel + canvas.width);
      }
      for (let pixel = 0; pixel < background.length; pixel++) {
        if (background[pixel]) pixels.data[pixel * 4 + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
    };
    const tick = () => { draw(); if (!disposed) frame = requestAnimationFrame(tick); };
    const resume = () => {
      if (motion.matches || document.hidden) { video.pause(); return; }
      void video.play().catch(() => { /* A touch retries autoplay on mobile. */ });
    };
    const ready = () => { draw(); resume(); };
    video.addEventListener("loadeddata", ready);
    document.addEventListener("touchstart", resume, { passive: true });
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", resume);
    video.src = "/videos/carousel-cat.mp4";
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", ready);
      document.removeEventListener("touchstart", resume);
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", resume);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);
  return <canvas ref={canvasRef} width={240} height={390} aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }} />;
}
