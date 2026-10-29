import { imageIfPresent } from "../engine/assets";
import { DEBUG } from "../engine/env";
import { Diya } from "../fx/Flames";

const BOKEH = Array.from({ length: 26 }, (_, i) => {
  const x = (i * 137.5) % 900;
  const y = 1040 + ((i * 53) % 110);
  const r = 6 + ((i * 7) % 12);
  const warm = i % 4 !== 0;
  return { x, y, r, warm, o: 0.25 + ((i * 13) % 40) / 100 };
});

const GARLAND = Array.from({ length: 34 }, (_, i) => {
  const t = i / 33;
  return { x: t * 900, y: 1196 + Math.sin(t * Math.PI * 4) * 16 + 14, r: 9 + (i % 3) };
});

function TerracePlaceholder() {
  return (
    <svg viewBox="0 0 900 1600" preserveAspectRatio="xMidYMax slice" className="terrace-svg" aria-hidden="true">
      <defs>
        <filter id="tb" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1420" />
          <stop offset="18%" stopColor="#1A0E18" />
          <stop offset="100%" stopColor="#080610" />
        </linearGradient>
        <linearGradient id="ledge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B3B2A" />
          <stop offset="100%" stopColor="#2A1418" />
        </linearGradient>
        <radialGradient id="warmpool" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#FFB454" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFB454" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12163A" stopOpacity="0" />
          <stop offset="100%" stopColor="#3A1F45" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="0" y="880" width="900" height="320" fill="url(#haze)" />
      <g filter="url(#tb)">
        {BOKEH.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.warm ? "#FFC26B" : "#AFC2FF"} opacity={b.o} />
        ))}
        <path d="M0 1150 L60 1118 L120 1132 L180 1096 L260 1124 L330 1086 L420 1120 L500 1094 L590 1128 L660 1100 L760 1130 L830 1108 L900 1126 L900 1190 L0 1190Z" fill="#0B0A1A" opacity="0.9" />
      </g>
      <rect x="0" y="1188" width="900" height="34" fill="url(#ledge)" />
      <rect x="0" y="1220" width="900" height="380" fill="url(#wall)" />
      <rect x="0" y="1188" width="900" height="260" fill="url(#warmpool)" />
      {GARLAND.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={i % 2 ? "#E8701A" : "#F7A531"} opacity="0.85" />
      ))}
    </svg>
  );
}

/** Layer 4: terrace photo (sky faded out so our moon shows) or the drawn terrace. */
export function Terrace() {
  const photo = imageIfPresent("bg-terrace-night");
  return (
    <div className="layer terrace parallax-bg" aria-hidden="true">
      {photo ? (
        <img src={photo} alt="" className="terrace-photo" draggable={false} />
      ) : (
        <>
          <TerracePlaceholder />
          <div className="terrace-diyas">
            {[0, 1, 2, 3, 4].map((i) => (
              <Diya key={i} className={`terrace-diya d${i}`} />
            ))}
          </div>
          {DEBUG ? <span className="missing-label top-[40%] left-2">missing: bg-terrace-night.webp</span> : null}
        </>
      )}
    </div>
  );
}
