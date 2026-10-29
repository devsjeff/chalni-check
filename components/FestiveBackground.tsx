import { FloatingHearts } from "@/components/FloatingHearts";
import { MoonGraphic } from "@/components/MoonGraphic";

function Lantern({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={`lantern-swing ${className}`} aria-hidden="true">
      <path d="M40 0v16" stroke="#ffb347" strokeWidth="2" />
      <path d="M22 28h36l8 64H14z" fill="#ffb347" />
      <path d="M26 36h28l6 48H20z" fill="#6b0f1a" />
      <path d="M34 46h12v28H34z" fill="#ffd27a" opacity="0.85" />
      <path d="M18 96h44" stroke="#ffb347" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function Diya({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 70" className={className} aria-hidden="true">
      <path d="M10 40c8 16 62 16 70 0-8 14-62 14-70 0z" fill="#ffb347" />
      <path d="M18 40c6 8 48 8 54 0-6 6-48 6-54 0z" fill="#6b0f1a" />
      <path className="flame" d="M45 34c6-10 2-20-1-26-6 8-8 16-1 26z" fill="#ff8a3d" />
      <path className="flame" d="M45 32c3-6 1-12 0-16-3 5-4 10 0 16z" fill="#ffe08a" />
    </svg>
  );
}

export function FestiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 8%, rgba(255,214,140,0.38), transparent 28%), radial-gradient(circle at 8% 18%, rgba(255,107,157,0.28), transparent 32%), linear-gradient(180deg, #2a0610 0%, #6b0f1a 46%, #8e1d4a 100%)",
        }}
      />
      <MoonGraphic className="absolute right-[8%] top-[4%] w-28 sm:w-36" />
      <Lantern className="absolute left-[-1.2rem] top-24 w-16 opacity-90 sm:left-6 sm:w-20" />
      <Lantern className="absolute right-[-1.2rem] top-32 w-14 opacity-80 sm:right-8 sm:w-16" />
      <Diya className="absolute bottom-3 left-2 w-16 sm:left-10 sm:w-20" />
      <Diya className="absolute bottom-4 right-2 w-14 sm:right-12 sm:w-20" />
      <FloatingHearts />
    </div>
  );
}
