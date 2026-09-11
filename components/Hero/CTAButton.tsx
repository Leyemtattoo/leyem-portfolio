"use client";

import { AnimatePresence, motion } from "framer-motion";
import ArrowIcon from "./ArrowIcon";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { neueMontrealRegular } from "@/app/fonts";

interface CTAButtonProps {
  delay?: number;
  onClick?: () => void;
  animateOnMount?: boolean;
}

export default function CTAButton({
  delay = 0,
  onClick,
  animateOnMount = true,
}: CTAButtonProps) {
  const { locale, t } = useTranslation();
  return (
    <motion.button
      onClick={onClick}
      initial={animateOnMount ? { x: "-110vw", opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative h-[68px] w-[330px] cursor-pointer"
    >
      {/* Capsule */}
      <motion.div
        layoutId="booking-panel"
        initial={{
          width: 330,
          opacity: 1,
        }}
        animate={{
          width: 330,
          opacity: 1,
        }}
        transition={{
          layout: {
            duration: 0.68,
            ease: [0.22, 1, 0.36, 1],
          },
          duration: 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-0 top-1/2 h-[52px] -translate-y-1/2 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] [will-change:transform,width,height,border-radius]"
      />

      {/* Texte */}
      <span className={`${neueMontrealRegular.className} pointer-events-none absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 overflow-hidden whitespace-nowrap text-center text-[20px] font-normal tracking-[-0.03em] text-[#252525] [perspective:500px]`}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={`${locale}-${t("cta.book")}`}
            initial={{ y: "110%", rotateX: -72, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            exit={{ y: "-110%", rotateX: 72, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]"
          >
            {t("cta.book")}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Cercle */}
      <motion.div
        initial={{
          x: 0,
          opacity: 1,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-[#252525]"
      >
        <div>
          <ArrowIcon size={22} />
        </div>
      </motion.div>
    </motion.button>
  );
}
