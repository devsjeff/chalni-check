import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Flow } from "../data/scenes";
import { closingLineId } from "../data/scenes";
import { line } from "../data/script";
import { SponsorCard } from "../ui/SponsorCard";
import { drawKeepsake } from "./KeepsakeCard";
import { SelfieOptional } from "./SelfieOptional";

interface Props {
  flow: Flow;
  name: string;
  onReplay(): void;
  onSwitch(): void;
}

const FILE_NAME = `karva-chauth-${new Date().getFullYear()}.png`;

/**
 * Last beat is the chalni selfie. A photo makes a named share card;
 * skip makes the same card without a name.
 */
export function Finale({ flow, name, onReplay, onSwitch }: Props) {
  const [step, setStep] = useState<"chalni" | "card">("chalni");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const closing = line(closingLineId(flow));
  const cardName = selfie ? name : "";

  useEffect(() => {
    if (step !== "card") return;
    let alive = true;
    let objectUrl: string | null = null;
    void drawKeepsake(cardName, closing, selfie).then((result) => {
      if (!alive || !result) return;
      objectUrl = URL.createObjectURL(result);
      setBlob(result);
      setUrl(objectUrl);
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [step, cardName, closing, selfie]);

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
      aria-labelledby={step === "chalni" ? "selfie-title" : "finale-title"}
    >
      {step === "chalni" ? (
        <SelfieOptional
          onCaptured={(shot) => {
            setSelfie(shot);
            setStep("card");
          }}
          onSkip={() => {
            setSelfie(null);
            setStep("card");
          }}
        />
      ) : (
        <>
          <h2 id="finale-title" className="sr-only">
            Tumhara Karva Chauth card
          </h2>
          <div className="keepsake-frame">
            {url ? (
              <img
                src={url}
                alt={`Karva Chauth card${cardName ? ` for ${cardName}` : ""}`}
                className="keepsake-img"
              />
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
            <SponsorCard />
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
