"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        <div key={pathname}>{children}</div>
      </AnimatePresence>
    </MotionConfig>
  );
}


