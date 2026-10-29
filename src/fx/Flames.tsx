import { useId } from "react";

/** A brass diya with a flickering flame. Glow strength follows --voice. */
export function Diya({ className = "", lit = true }: { className?: string; lit?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 90" className={`diya ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#FFD27F" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#FFB454" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFB454" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-clay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9A441" />
          <stop offset="55%" stopColor="#8A5A1E" />
          <stop offset="100%" stopColor="#3A220C" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF7A1A" />
          <stop offset="55%" stopColor="#FFC15A" />
          <stop offset="100%" stopColor="#FFF4D6" />
        </linearGradient>
      </defs>
      {lit ? <circle className="diya-glow" cx="60" cy="40" r="44" fill={`url(#${id}-glow)`} /> : null}
      <path d="M14 58c10 22 82 22 92 0-6 4-20 7-46 7S20 62 14 58z" fill={`url(#${id}-clay)`} />
      <path d="M18 57c14 6 70 6 84 0" stroke="#F3C778" strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
      {lit ? (
        <g className="flame">
          <path d="M60 56c9-9 7-22 0-34-7 12-9 25 0 34z" fill={`url(#${id}-flame)`} />
          <path d="M60 54c4-4 3-10 0-16-3 6-4 12 0 16z" fill="#FFFBEF" opacity="0.9" />
        </g>
      ) : null}
    </svg>
  );
}

/** Foreground string of warm fairy lights hanging across the top of the frame. */
export function FairyLights() {
  const bulbs = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14;
    const x = 20 + t * 860;
    const y = 70 + Math.sin(t * Math.PI) * 70 + (i % 2) * 6;
    return { x, y, delay: (i * 0.37) % 2.4, warm: i % 3 !== 0 };
  });
  return (
    <svg viewBox="0 0 900 220" preserveAspectRatio="xMidYMin slice" className="fairy-lights" aria-hidden="true">
      <path d="M0 62 Q450 210 900 62" stroke="#2A1C12" strokeWidth="2" fill="none" opacity="0.8" />
      {bulbs.map((bulb, i) => (
        <g key={i} className="bulb" style={{ animationDelay: `${bulb.delay}s` }}>
          <circle cx={bulb.x} cy={bulb.y + 8} r="16" fill={bulb.warm ? "#FFB454" : "#FFE3A8"} opacity="0.18" />
          <circle cx={bulb.x} cy={bulb.y + 8} r="4.2" fill={bulb.warm ? "#FFC56E" : "#FFF0C8"} />
        </g>
      ))}
    </svg>
  );
}
