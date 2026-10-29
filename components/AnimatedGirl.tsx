"use client";

import type { GirlMood } from "@/types";
import { useId } from "react";

type Props = {
  mood?: GirlMood;
  talking?: boolean;
  className?: string;
};

export function AnimatedGirl({ mood = "wave", talking = false, className = "" }: Props) {
  const raw = useId().replace(/:/g, "");
  const skin = `${raw}-skin`;
  const lehenga = `${raw}-lehenga`;
  const dupatta = `${raw}-dupatta`;
  const blush = `${raw}-blush`;
  const waving = mood === "wave" || mood === "celebrate";

  return (
    <div className={className}>
      <svg
        viewBox="0 0 280 360"
        role="img"
        aria-label="Cute animated girl in a festive pink lehenga, waving"
        className={`girl-svg h-full w-full overflow-visible mood-${mood} ${talking ? "is-talking" : ""} ${waving ? "is-waving" : ""}`}
      >
        <defs>
          <linearGradient id={skin} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8c9aa" />
            <stop offset="100%" stopColor="#e3a883" />
          </linearGradient>
          <linearGradient id={lehenga} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="48%" stopColor="#c43166" />
            <stop offset="100%" stopColor="#6b0f1a" />
          </linearGradient>
          <linearGradient id={dupatta} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd0e2" />
            <stop offset="100%" stopColor="#ff6b9d" />
          </linearGradient>
          <radialGradient id={blush} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e86b7a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e86b7a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="140" cy="338" rx="78" ry="10" fill="#2a0610" opacity="0.25" />

        <path className="dupatta" d="M78 158c-48 28-62 92-28 158 28-38 42-92 62-132 8-18-8-36-34-26z" fill={`url(#${dupatta})`} />
        <path className="dupatta" d="M196 150c52 24 70 96 32 162-30-46-46-98-64-136-8-16 8-38 32-26z" fill={`url(#${dupatta})`} opacity="0.95" />

        <path d="M96 206c-18 38-40 96-48 132h184c-8-36-30-94-48-132-16 16-72 16-88 0z" fill={`url(#${lehenga})`} />
        <path d="M58 316h164" stroke="#ffb347" strokeWidth="7" strokeLinecap="round" />
        <path d="M70 300h140" stroke="#ffb347" strokeWidth="2" opacity="0.85" />
        <circle cx="92" cy="308" r="3" fill="#ffb347" />
        <circle cx="140" cy="308" r="3" fill="#ffb347" />
        <circle cx="188" cy="308" r="3" fill="#ffb347" />

        <path d="M112 170c-6 22-12 36-16 48h88c-4-12-10-26-16-48-14 14-42 14-56 0z" fill="#8e1e45" />
        <path d="M124 176c10 10 22 10 32 0" stroke="#ffb347" strokeWidth="2" fill="none" />
        <path d="M120 168c12 18 28 18 40 0" stroke="#ffb347" strokeWidth="2.2" fill="none" />
        <circle cx="140" cy="186" r="3.4" fill="#ffb347" />

        <path d="M108 178c-24 16-34 42-18 58" stroke="#e3a883" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="92" cy="236" r="8" fill="#e3a883" />

        <g className="wave-arm">
          <path d="M172 176c22-14 40-36 48-64" stroke="#e3a883" strokeWidth="14" strokeLinecap="round" fill="none" />
          <ellipse cx="226" cy="104" rx="13" ry="15" fill="#e3a883" transform="rotate(-18 226 104)" />
          <path d="M186 168c8-8 18-8 26 0" stroke="#ffb347" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M192 174c6-6 14-6 20 0" stroke="#ffd27a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        <path d="M126 150h28c2 14 2 22 0 28h-28c-2-6-2-14 0-28z" fill={`url(#${skin})`} />

        <path d="M90 124c-16-48 8-90 50-94 48-2 78 40 66 92 12 36 4 78-22 92-22-22-54-24-78-8-20-18-28-54-16-82z" fill="#3a2418" />

        <g className="head">
          <ellipse cx="140" cy="118" rx="50" ry="56" fill={`url(#${skin})`} />
          <path d="M96 108c2-46 24-70 44-70s46 24 46 68c-16-28-34-36-46-34-16 2-32 12-44 36z" fill="#3a2418" />
          <path d="M140 48v34" stroke="#ffb347" strokeWidth="1.6" />
          <circle cx="140" cy="86" r="3.2" fill="#ffb347" />
          <circle cx="140" cy="100" r="3.3" fill="#c81d3a" />

          <ellipse cx="92" cy="122" rx="7" ry="9" fill="#e3a883" />
          <ellipse cx="188" cy="122" rx="7" ry="9" fill="#e3a883" />
          <g className="earring">
            <path d="M90 130v14" stroke="#ffb347" strokeWidth="1.6" />
            <ellipse cx="90" cy="150" rx="5" ry="7" fill="#ffb347" />
          </g>
          <g className="earring">
            <path d="M190 130v14" stroke="#ffb347" strokeWidth="1.6" />
            <ellipse cx="190" cy="150" rx="5" ry="7" fill="#ffb347" />
          </g>

          <path className="brow" d="M110 106c8-7 18-7 24 0" stroke="#3a2418" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path className="brow" d="M146 106c8-7 18-7 24 0" stroke="#3a2418" strokeWidth="2.3" fill="none" strokeLinecap="round" />

          <g className="eye-left">
            <ellipse cx="122" cy="120" rx="11" ry="12" fill="#fff" />
            <ellipse cx="123" cy="121" rx="6" ry="6.5" fill="#2c1810" />
            <circle cx="125.5" cy="118" r="2.1" fill="#fff" />
            <ellipse className="eyelid" cx="122" cy="120" rx="12" ry="13" fill="#e8b08a" />
          </g>
          <g className="eye-right">
            <ellipse cx="160" cy="120" rx="11" ry="12" fill="#fff" />
            <ellipse cx="161" cy="121" rx="6" ry="6.5" fill="#2c1810" />
            <circle cx="163.5" cy="118" r="2.1" fill="#fff" />
            <ellipse className="eyelid" cx="160" cy="120" rx="12" ry="13" fill="#e8b08a" />
          </g>

          <path d="M140 124c3 8 6 12 2 16" stroke="#c9896c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="108" cy="136" rx="9" ry="5" fill={`url(#${blush})`} />
          <ellipse cx="174" cy="136" rx="9" ry="5" fill={`url(#${blush})`} />

          <path className="mouth-smile" d="M122 146c6 12 30 12 36 0" stroke="#a33b45" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse className="mouth-open" cx="140" cy="150" rx="8" ry="7" fill="#6b2430" />
          <path className="mouth-laugh" d="M118 144c8 20 36 20 44 0-12 8-32 8-44 0z" fill="#6b2430" />
          <ellipse className="mouth-shock" cx="140" cy="150" rx="6" ry="8" fill="#6b2430" />
        </g>
      </svg>
    </div>
  );
}
