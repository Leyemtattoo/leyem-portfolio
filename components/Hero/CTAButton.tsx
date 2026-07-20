"use client";

import { motion } from "framer-motion";
import ArrowIcon from "./ArrowIcon";
import { CTAButtonProps } from "./types";

export default function CTAButton({
  text,
  variant,
}: CTAButtonProps) {
  const filled = variant === "filled";

  return (
    <motion.button
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.02 }}
      className={`
        relative
        w-[330px]
        h-[68px]
        overflow-hidden
        rounded-full
        ${
          filled
            ? "bg-[#2B1D26] text-white shadow-xl"
            : "border border-[#2B1D26] bg-[#F8F4F2] text-[#2B1D26]"
        }
      `}
    >
      {/* Background qui s'étire */}
      <motion.div
        initial={{ width: 52 }}
        animate={{ width: "100%" }}
        transition={{
          duration: 0.55,
          delay: 0.25,
        }}
        className={`
          absolute
          left-0
          top-0
          h-full
          rounded-full
          ${
            filled
              ? "bg-[#2B1D26]"
              : "bg-transparent"
          }
        `}
      />

      {/* Cercle */}
      <motion.div
        initial={{
          x: -120,
        }}
        animate={{
          x: 8,
        }}
        transition={{
          duration: 0.55,
        }}
        className="
          absolute
          top-1/2
          -translate-y-1/2
          z-20
          w-[52px]
          h-[52px]
          rounded-full
          flex
          items-center
          justify-center
        "
      >
        <motion.div
          initial={{ rotate: 180 }}
          animate={{ rotate: 0 }}
          transition={{
            delay: 0.55,
            duration: 0.25,
          }}
        >
          <ArrowIcon size={22} />
        </motion.div>
      </motion.div>

      {/* Texte */}
      <motion.div
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.7,
          duration: 0.35,
        }}
        className="
          relative
          z-30
          h-full
          flex
          items-center
          pl-24
        "
      >
        <span className="text-[20px] font-bold tracking-tight">
          {text}
        </span>
      </motion.div>
    </motion.button>
  );
}