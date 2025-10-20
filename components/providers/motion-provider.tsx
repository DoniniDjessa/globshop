"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </MotionConfig>
  );
}


