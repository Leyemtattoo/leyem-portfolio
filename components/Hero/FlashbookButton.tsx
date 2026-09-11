"use client";

import ArrowIcon from "./ArrowIcon";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { neueMontrealRegular } from "@/app/fonts";
import { AnimatePresence, motion } from "framer-motion";

interface FlashbookButtonProps {
  delay?: number;
  onClick?: () => void;
  animateOnMount?: boolean;
}

export default function FlashbookButton({
  delay = 0,
  onClick,
  animateOnMount = true,
}: FlashbookButtonProps) {
  const { locale, t } = useTranslation();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={animateOnMount ? { x: "-110vw", opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`${neueMontrealRegular.className} relative flex h-[52px] w-[330px] items-center rounded-full border border-white/15 bg-[#252525]/55 text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:brightness-110`}
    >
      <span className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center">
        <ArrowIcon size={22} color="white" />
      </span>
      <span className="relative h-7 w-full overflow-hidden text-center text-[20px] font-normal tracking-[-0.03em] [perspective:500px]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={`${locale}-${t("cta.flashbook")}`}
            initial={{ y: "110%", rotateX: -72, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            exit={{ y: "-110%", rotateX: 72, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]"
          >
            {t("cta.flashbook")}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
