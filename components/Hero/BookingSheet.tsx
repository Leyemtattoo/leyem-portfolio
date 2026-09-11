"use client";

import { AnimatePresence, motion } from "framer-motion";
import BookingStepper from "./BookingStepper";

interface BookingDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function BookingDrawer({
  open,
  onClose,
}: BookingDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Fond assombri */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-[100] h-screen w-[520px] bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col p-10">

              <button
                onClick={onClose}
                className="self-end text-3xl text-neutral-400 transition hover:text-black"
              >
                ×
              </button>

             <BookingStepper />

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
