import { useId } from "react";
import { imageIfPresent } from "../engine/assets";

/** Decorated chalni: gota-patti rim, fine mesh, a tiny diya glowing behind it. */
export function ChalniProp({ className = "" }: { className?: string }) {
  const photo = imageIfPresent("prop-chalni");
  const id = useId().replace(/:/g, "");
  if (photo) return <img src={photo} alt="" className={`chalni-prop ${className}`} draggable={false} />;
  return (
    <svg viewBox="0 0 200 200" className={`chalni-prop ${className}`} aria-hidden="true">
      <defs>
        <pattern id={`${id}-mesh`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 H5 M0 0 V5" stroke="rgba(235,225,205,0.55)" strokeWidth="0.55" />
        </pattern>
        <radialGradient id={`${id}-diya`} cx="50%" cy="62%" r="40%">
          <stop offset="0%" stopColor="#FFE1A0" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FFB454" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFB454" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3D08A" />
          <stop offset="50%" stopColor="#B07A2A" />
          <stop offset="100%" stopColor="#F0C878" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill={`url(#${id}-diya)`} className="chalni-diya-glow" />
      <circle cx="100" cy="100" r="80" fill={`url(#${id}-mesh)`} />
      <circle cx="100" cy="100" r="84" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="9" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="#C1121F" strokeWidth="7" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="#D9A441" strokeWidth="3.4" strokeDasharray="1.5 6.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(217,164,65,0.6)" strokeWidth="1.2" />
    </svg>
  );
}
