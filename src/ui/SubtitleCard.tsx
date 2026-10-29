import { useEffect, useState } from "react";
import type { LineHandle } from "../audio/engine";
import { lineText, revealedWords, splitWords, type Lang } from "../audio/subtitles";

interface Props {
  handle: LineHandle | null;
  lang: Lang;
  speakerLabel: string;
  hint?: string | null;
}

/** Glass subtitle card: words appear one by one in step with the voice. */
export function SubtitleCard({ handle, lang, speakerLabel, hint }: Props) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!handle) return;
    setVisible(true);
    setProgress(0);
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setProgress(handle.progress());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let hideTimer = 0;
    void handle.done.then(() => {
      if (!alive) return;
      setProgress(1);
      cancelAnimationFrame(raf);
      hideTimer = window.setTimeout(() => alive && setVisible(false), 2600);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
    };
  }, [handle]);

  const text = handle ? lineText(handle.line, lang) : "";
  const words = splitWords(text);
  const shown = revealedWords(words.length, progress);

  return (
    <div className="subtitles" aria-live="polite">
      <div className={`subtitle-card ${visible && handle ? "is-visible" : ""} ${lang === "hindi" ? "is-hindi" : ""}`}>
        <p className="subtitle-speaker">{speakerLabel}</p>
        <p className="subtitle-text">
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {words.map((word, index) => (
              <span key={`${handle?.line.id}-${index}`} className={`subtitle-word ${index < shown ? "is-on" : ""}`}>
                {word}{" "}
              </span>
            ))}
          </span>
        </p>
      </div>
      <p className={`hint-chip ${hint ? "is-visible" : ""}`}>{hint ?? ""}</p>
    </div>
  );
}
