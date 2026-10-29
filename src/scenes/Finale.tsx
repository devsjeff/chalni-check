import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Flow } from "../data/scenes";
import { closingLineId } from "../data/scenes";
import { line } from "../data/script";
import { drawKeepsake } from "./KeepsakeCard";
import { SelfieOptional } from "./SelfieOptional";

interface Props {
  flow: Flow;
  name: string;
  onReplay(): void;
  onSwitch(): void;
}

const FILE_NAME = `karva-chauth-${new Date().getFullYear()}.png`;

/** Keepsake card overlay with Share, Play again, Switch side, and an optional chalni selfie. */
export function Finale({ flow, name, onReplay, onSwitch }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selfie, setSelfie] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    void drawKeepsake(name, line(closingLineId(flow))).then((result) => {
      if (!alive || !result) return;
      objectUrl = URL.createObjectURL(result);
      setBlob(result);
      setUrl(objectUrl);
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [flow, name]);

  const download = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setNote("Card download ho gaya.");
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], FILE_NAME, { type: "image/png" });
    const data: ShareData = {
      files: [file],
      title: "Karva Chauth Moon Night",
      text: "Shubh Karva Chauth",
    };
    try {
      if (navigator.canShare?.(data) && navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    download();
  };

  return (
    <motion.div
      className="finale"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
    >
      <h2 id="finale-title" className="sr-only">
        Tumhara Karva Chauth card
      </h2>
      {selfie ? (
        <SelfieOptional onClose={() => setSelfie(false)} />
      ) : (
        <>
          <div className="keepsake-frame">
            {url ? (
              <img src={url} alt={`Karva Chauth card${name ? ` for ${name}` : ""}`} className="keepsake-img" />
            ) : (
              <div className="keepsake-wait">Card ban raha hai…</div>
            )}
          </div>
          <div className="finale-actions">
            <button type="button" className="primary-button" onClick={() => void share()} disabled={!blob}>
              Share karo
            </button>
            <div className="finale-row">
              <button type="button" className="secondary-button" onClick={onReplay}>
                Phir se khelo
              </button>
              <button type="button" className="secondary-button" onClick={onSwitch}>
                {flow === "boy" ? "Ladki ki taraf se khelo" : "Ladke ki taraf se khelo"}
              </button>
            </div>
            <button type="button" className="text-button" onClick={() => setSelfie(true)}>
              Chalni selfie
            </button>
            {note ? (
              <p className="finale-note" role="status">
                {note}
              </p>
            ) : null}
          </div>
        </>
      )}
    </motion.div>
  );
}
