"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Hero() {
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHero(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative h-screen overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        {!showHero ? (
          <motion.div
            key="intro"
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <Image
                src="/images/cat.gif"
                alt="Cat"
                width={250}
                height={250}
                priority
                unoptimized
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.45,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-5 text-lg"
            >
              <span className="font-semibold text-black">Pet</span>{" "}
              <span className="font-normal text-neutral-500">
                the cat to enter
              </span>
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <div className="relative mx-auto h-screen w-full max-w-[430px]">
              <div className="absolute left-8 top-24 z-30 w-[330px]">
  <motion.h1
    initial={{ opacity: 1, y: "100vh" }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: 0.3,
      duration: 1.1,
      ease: [0.05, 1, 0.15, 1],
    }}
    className="w-max whitespace-nowrap text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-black"
  >
    Hi ! I'm Leyem !
  </motion.h1>

  <motion.p
    initial={{ opacity: 0, y: 35 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: 1.1,
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
    }}
    className="mt-8 text-[18px] leading-[1.4] text-neutral-600"
  >
    I'm a tattoo artist specializing in{" "}
    <strong className="text-black">
      graphic realism
    </strong>{" "}
    and{" "}
    <strong className="text-black">
      fine lines.
    </strong>
  </motion.p>
</div>
              <motion.div
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute -bottom-12 left-1/2 z-10 -translate-x-1/2"
              >
                <Image
                  src="/images/hero.png"
                  alt="Leyem"
                  width={780}
                  height={1200}
                  priority
                  className="h-[97vh] w-auto max-w-none object-contain object-bottom"
                />
              </motion.div>
                            <motion.button
                initial={{ x: -420 }}
                animate={{ x: 0 }}
                transition={{
                  delay: 1.8,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute bottom-[170px] left-1/2 z-40 flex h-[72px] w-[335px] -translate-x-1/2 items-center rounded-full bg-[#26283A] pl-[10px] pr-8 shadow-xl"
              >
                <motion.div
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 0 }}
                  transition={{
                    delay: 1.8,
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#3A3C4D]"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.div>

                <span className="ml-6 text-[17px] font-semibold text-white">
                  Book Appointment
                </span>
              </motion.button>
                          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}