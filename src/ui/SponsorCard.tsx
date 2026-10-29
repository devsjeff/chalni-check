import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { buildUpiUri, UPI_AMOUNT, UPI_ID } from "../data/upi";

/** Optional ₹20 UPI. Skip is always available. */
export function SponsorCard() {
  const [copied, setCopied] = useState(false);
  const uri = buildUpiUri();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="sponsor" aria-label="Optional support">
      <p className="sponsor-kicker">By choice</p>
      <h3 className="sponsor-title">₹{UPI_AMOUNT} se sponsor karo</h3>
      <p className="sponsor-copy">
        Mann ho to. Skip bilkul theek hai. UPI khul jaayega, amount ₹{UPI_AMOUNT} pehle se bhara hoga.
      </p>
      <div className="sponsor-qr" aria-hidden="true">
        <QRCodeSVG value={uri} size={132} bgColor="#F4ECD8" fgColor="#0B1026" level="M" />
      </div>
      <p className="sponsor-id">{UPI_ID}</p>
      <div className="sponsor-actions">
        <a className="primary-button" href={uri}>
          UPI kholo
        </a>
        <button type="button" className="secondary-button" onClick={() => void copy()}>
          {copied ? "UPI ID copy ho gaya" : "UPI ID copy karo"}
        </button>
      </div>
    </aside>
  );
}
