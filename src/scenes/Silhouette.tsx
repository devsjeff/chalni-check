import type { PoseDef } from "../data/poses";

function Flame({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle className="sil-flame-glow" r="70" fill="url(#sil-warm)" />
      <g className="flame">
        <path d="M0 0c12-12 9-30 0-46-9 16-12 34 0 46z" fill="#FFB454" />
        <path d="M0-3c5-5 4-14 0-22-4 8-5 17 0 22z" fill="#FFF4D6" />
      </g>
    </g>
  );
}

function Chalni({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="url(#sil-mesh)" opacity="0.85" />
      <circle cx={x} cy={y} r={r * 0.5} fill="url(#sil-warm)" opacity="0.55" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#D9A441" strokeWidth="10" opacity="0.9" />
      <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#C1121F" strokeWidth="5" strokeDasharray="2 9" opacity="0.8" />
    </g>
  );
}

function Glass({ x, y, s = 1, tilt = 0 }: { x: number; y: number; s?: number; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <path d="M-34 -70 L34 -70 L27 70 L-27 70 Z" fill="rgba(200,220,255,0.10)" stroke="rgba(230,240,255,0.55)" strokeWidth="3" />
      <path d="M-31 -20 L31 -20 L27 66 L-27 66 Z" fill="rgba(150,190,255,0.28)" />
      <path d="M-20 -62 L-16 60" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

const HER_BODY =
  "M296 760 C326 676 392 646 455 646 C518 646 584 676 612 760 C640 840 650 980 664 1120 L690 1600 L220 1600 L246 1120 C258 980 268 840 296 760 Z";
const HER_HAIR =
  "M376 512 C366 420 414 372 455 372 C502 372 546 420 536 512 C546 600 566 700 552 790 L360 790 C344 700 364 600 376 512 Z";
const HIM_BODY =
  "M262 780 C300 690 382 662 455 662 C528 662 610 690 648 780 C672 860 676 1000 680 1140 L690 1600 L220 1600 L230 1140 C234 1000 238 860 262 780 Z";

/**
 * Tasteful stand-in for a missing character photo: a dark figure with warm
 * diya light from below-left and cool moon rim light from the upper right.
 */
export function Silhouette({ pose }: { pose: PoseDef }) {
  const her = pose.who === "her";
  const p = pose.prop;
  return (
    <svg viewBox="0 0 900 1600" preserveAspectRatio="xMidYMax slice" className="silhouette" aria-hidden="true">
      <defs>
        <radialGradient id="sil-warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD27F" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#FFB454" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFB454" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sil-fill" x1="0.9" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#2B2C4A" />
          <stop offset="40%" stopColor="#16111F" />
          <stop offset="100%" stopColor="#0A0710" />
        </linearGradient>
        <linearGradient id="sil-saree" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5A0F22" />
          <stop offset="100%" stopColor="#2A0712" />
        </linearGradient>
        <linearGradient id="sil-kurta" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A4652" />
          <stop offset="100%" stopColor="#15121C" />
        </linearGradient>
        <pattern id="sil-mesh" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(10,8,20,0.25)" />
          <path d="M0 0 L8 8 M8 0 L0 8" stroke="rgba(230,220,200,0.35)" strokeWidth="0.8" />
        </pattern>
      </defs>

      <g className="sil-figure">
        {her ? <path d={HER_HAIR} fill="#0C0910" /> : null}
        <path d={her ? HER_BODY : HIM_BODY} fill={her ? "url(#sil-saree)" : "url(#sil-kurta)"} />
        {her ? (
          <path d="M318 712 C420 790 540 930 660 1110 L672 1210 C548 1040 420 900 300 810 Z" fill="#7A1630" opacity="0.75" />
        ) : (
          <path d="M405 668 L455 760 L505 668" stroke="#D9A441" strokeWidth="5" fill="none" opacity="0.8" />
        )}
        {her ? (
          <path d="M318 714 C420 792 540 932 660 1112" stroke="#D9A441" strokeWidth="6" fill="none" opacity="0.7" />
        ) : null}
        <path d={her ? "M428 590 L482 590 L488 660 L422 660 Z" : "M420 600 L490 600 L498 676 L412 676 Z"} fill="url(#sil-fill)" />
        <g transform={`rotate(${pose.tilt} 455 530)`}>
          <ellipse cx="455" cy="522" rx={her ? 62 : 66} ry={her ? 78 : 82} fill="url(#sil-fill)" />
          <path
            d={
              her
                ? "M392 500 C392 430 424 400 455 400 C492 400 520 432 520 494 C500 456 474 446 455 448 C432 450 408 466 392 500 Z"
                : "M388 500 C384 434 418 402 455 400 C496 400 526 432 522 498 C508 468 484 452 455 452 C428 452 402 468 388 500 Z"
            }
            fill="#0A0709"
          />
          {her ? <circle cx="455" cy="476" r="5" fill="#C1121F" /> : null}
          {her ? <circle cx="390" cy="560" r="7" fill="#D9A441" opacity="0.85" /> : null}
          {her ? <circle cx="520" cy="560" r="7" fill="#D9A441" opacity="0.85" /> : null}
        </g>
      </g>

      {p === "thali" || p === "thali-out" ? (
        <g>
          <path d="M300 760 C330 860 360 900 400 920" stroke="url(#sil-fill)" strokeWidth="46" strokeLinecap="round" fill="none" />
          <path d="M610 760 C580 860 550 900 510 920" stroke="url(#sil-fill)" strokeWidth="46" strokeLinecap="round" fill="none" />
          <ellipse cx="455" cy={p === "thali" ? 930 : 1010} rx={p === "thali" ? 150 : 210} ry={p === "thali" ? 30 : 44} fill="#8A5A1E" />
          <ellipse cx="455" cy={p === "thali" ? 924 : 1002} rx={p === "thali" ? 138 : 196} ry={p === "thali" ? 24 : 36} fill="#D9A441" opacity="0.9" />
          <circle cx="400" cy={p === "thali" ? 918 : 996} r="9" fill="#C1121F" />
          <circle cx="510" cy={p === "thali" ? 918 : 996} r="10" fill="#F4ECD8" opacity="0.9" />
          <Flame x={455} y={p === "thali" ? 914 : 990} scale={p === "thali" ? 1 : 1.5} />
        </g>
      ) : null}

      {p === "chalni-up" ? (
        <g>
          <path d="M600 760 C650 680 690 600 700 520" stroke="url(#sil-fill)" strokeWidth="42" strokeLinecap="round" fill="none" />
          <Chalni x={710} y={430} r={96} />
          <Flame x={710} y={470} scale={0.6} />
        </g>
      ) : null}

      {p === "chalni-face" ? (
        <g>
          <path d="M320 780 C350 700 380 660 400 640" stroke="url(#sil-fill)" strokeWidth="42" strokeLinecap="round" fill="none" />
          <path d="M590 780 C560 700 530 660 510 640" stroke="url(#sil-fill)" strokeWidth="42" strokeLinecap="round" fill="none" />
          <Chalni x={455} y={600} r={132} />
          <Flame x={455} y={660} scale={0.7} />
        </g>
      ) : null}

      {p === "hand-smile" ? (
        <path d="M600 780 C560 700 520 640 480 600" stroke="url(#sil-fill)" strokeWidth="40" strokeLinecap="round" fill="none" />
      ) : null}

      {p === "sip" ? (
        <g>
          <path d="M80 1400 C200 1100 300 820 390 650" stroke="#D8D0BE" strokeWidth="44" strokeLinecap="round" fill="none" opacity="0.55" />
          <Glass x={420} y={600} s={0.75} tilt={-28} />
        </g>
      ) : null}

      {p === "glass" || p === "glass-up" ? (
        <g>
          <path d="M630 780 C660 880 660 960 640 1010" stroke="url(#sil-fill)" strokeWidth="44" strokeLinecap="round" fill="none" />
          <Glass x={640} y={1060} s={0.75} />
        </g>
      ) : null}

      {p === "glass-offer" ? (
        <g>
          <path d="M640 790 C640 900 560 1000 500 1050" stroke="url(#sil-fill)" strokeWidth="52" strokeLinecap="round" fill="none" />
          <Glass x={470} y={1040} s={1.25} />
        </g>
      ) : null}

      {p === "hand-neck" ? (
        <path d="M640 790 C700 700 660 620 560 590" stroke="url(#sil-fill)" strokeWidth="42" strokeLinecap="round" fill="none" />
      ) : null}

      {p === "hand-heart" ? (
        <g>
          <path d="M650 800 C640 880 560 880 500 850" stroke="url(#sil-fill)" strokeWidth="46" strokeLinecap="round" fill="none" />
          <circle className="sil-heart-glow" cx="490" cy="840" r="70" fill="url(#sil-warm)" opacity="0.6" />
        </g>
      ) : null}
    </svg>
  );
}
