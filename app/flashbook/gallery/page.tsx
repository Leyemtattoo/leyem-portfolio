"use client";

import FlashbookBook from "@/components/Flashbook/FlashbookBook";
import ArrowIcon from "@/components/Hero/ArrowIcon";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function FlashbookPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#201e21]" />}>
      <FlashbookContent />
    </Suspense>
  );
}

function FlashbookContent() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFlashExpanded, setIsFlashExpanded] = useState(false);
  const selectedParam = Number(searchParams.get("selected"));
  const initialSelectedTest = ([1, 2, 3, 4] as const).find((test) => test === selectedParam);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-[#201e21]" />
      <motion.button
        type="button"
        onClick={() => router.push("/flashbook/categories?from=flash")}
        aria-label="Retour aux catégories"
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: isFlashExpanded ? 0 : 1, rotate: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed left-4 z-[90] grid size-[52px] place-items-center rounded-full border border-white/15 bg-[#252525]/55 text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] backdrop-blur-xl ${isFlashExpanded ? "pointer-events-none" : ""}`}
        style={{ top: "var(--flash-home-top, calc(100dvh - 120px - env(safe-area-inset-bottom)))" }}
      >
        <span className="rotate-180"><ArrowIcon size={22} color="white" /></span>
      </motion.button>
      <motion.main
        initial={false}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="fixed inset-0 z-10 h-[100dvh] overflow-hidden bg-[#201e21] [will-change:transform]"
      >
        <FlashbookBook onFullscreenChange={setIsFlashExpanded} initialSelectedTest={initialSelectedTest} />
      </motion.main>
    </>
  );
}
