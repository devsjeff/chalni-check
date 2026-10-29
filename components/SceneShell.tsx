"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export function useFocusHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}

export function SceneShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0.12 : 0.34, ease: "easeOut" }}
      className="flex flex-1 flex-col gap-4"
    >
      {children}
    </motion.section>
  );
}

export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="glass-card rounded-3xl px-4 py-3 text-base leading-relaxed text-cream">
      {children}
    </div>
  );
}
