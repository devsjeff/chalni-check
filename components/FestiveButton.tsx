"use client";

import { useAudioControls } from "@/components/AudioProvider";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-saffron text-wine-deep shadow-lg shadow-black/20",
  secondary: "border border-cream/35 bg-white/10 text-cream",
  ghost: "bg-transparent text-cream/90 underline decoration-cream/40 underline-offset-4",
};

export function FestiveButton({
  variant = "primary",
  className = "",
  onClick,
  type,
  children,
  ...props
}: Props) {
  const { play } = useAudioControls();

  return (
    <button
      type={type ?? "button"}
      {...props}
      className={`inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-extrabold tracking-tight transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      onClick={(event) => {
        play("click");
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
