import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { POSES, type PoseId } from "../data/poses";
import { imageIfPresent, videoIfPresent } from "../engine/assets";
import { DEBUG } from "../engine/env";
import { getQuality } from "../fx/quality";
import { Silhouette } from "./Silhouette";

function PoseMedia({ pose }: { pose: PoseId }) {
  const def = POSES[pose];
  const still = imageIfPresent(pose);
  const video = videoIfPresent(pose);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="pose-media">
      {still ? (
        <img src={still} alt="" className="pose-img" draggable={false} decoding="async" />
      ) : (
        <Silhouette pose={def} />
      )}
      {video && !videoFailed ? (
        <video
          className={`pose-video ${videoReady ? "is-ready" : ""}`}
          src={video}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          poster={still ?? undefined}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        />
      ) : null}
      {DEBUG && !still ? <span className="missing-label top-[22%] right-2">missing: {pose}.webp</span> : null}
    </div>
  );
}

/** Warm diya flicker overlay: screen blend, opacity 0.08–0.2, randomised at 2–5 Hz. */
function WarmFlicker() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (getQuality() === "reduced") return;
    let timer = 0;
    const tick = () => {
      if (ref.current) ref.current.style.opacity = (0.08 + Math.random() * 0.12).toFixed(3);
      timer = window.setTimeout(tick, 1000 / (2 + Math.random() * 3));
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);
  return <div ref={ref} className="warm-flicker" />;
}

/** Layer 5: character photo/video (or silhouette) with Ken Burns, breathing, rim light and 400 ms pose crossfades. */
export function Character({ pose, label }: { pose: PoseId; label: string }) {
  return (
    <div className="layer character parallax-fg" role="img" aria-label={label}>
      <div className="kenburns">
        <div className="breathe">
          <AnimatePresence initial={false}>
            <motion.div
              key={pose}
              className="pose-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <PoseMedia pose={pose} />
            </motion.div>
          </AnimatePresence>
          <div className="rim-light" />
        </div>
      </div>
      <WarmFlicker />
    </div>
  );
}
