"use client";

import { FestiveButton } from "@/components/FestiveButton";
import { copyText } from "@/lib/share";
import { UPI_ID, buildUpiUri } from "@/lib/upi";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";

export function DonationCard() {
  const uri = useMemo(() => buildUpiUri(), []);
  const [showQr, setShowQr] = useState(false);
  const [note, setNote] = useState("");

  async function copyId() {
    const ok = await copyText(UPI_ID);
    setNote(ok ? "UPI ID copy ho gayi." : "Copy nahi ho paya. ID select karke manually copy kar lo.");
  }

  function donate() {
    setNote("UPI app khul sakti hai. Wapas aane ka matlab payment successful nahi hai.");
    window.location.assign(uri);
  }

  return (
    <section className="glass-card rounded-3xl px-4 py-4 text-cream" aria-label="Optional donation">
      <h2 className="font-display text-2xl leading-tight">Website pasand aayi? ❤️</h2>
      <p className="mt-2">Developer ko ek chai pila do ☕</p>
      <p className="mt-2 text-sm leading-relaxed text-cream/85">
        Support this project with ₹20. Totally optional, no pressure!
      </p>
      <p className="mt-3 text-sm">
        UPI ID: <code className="font-extrabold text-saffron">{UPI_ID}</code>
      </p>
      <div className="mt-4 grid gap-3">
        <FestiveButton onClick={donate}>Donate ₹20 via UPI</FestiveButton>
        <FestiveButton variant="secondary" onClick={() => void copyId()}>
          Copy UPI ID
        </FestiveButton>
        <FestiveButton variant="secondary" onClick={() => setShowQr((open) => !open)} aria-expanded={showQr}>
          {showQr ? "QR band karo" : "QR Code Dekho"}
        </FestiveButton>
      </div>
      {showQr ? (
        <div className="mt-4 flex justify-center rounded-2xl bg-cream p-3">
          <QRCodeSVG
            value={uri}
            size={196}
            bgColor="#FFF5E6"
            fgColor="#3D0810"
            level="M"
            includeMargin
            aria-label="QR code for the optional twenty rupee UPI link"
          />
        </div>
      ) : null}
      {note ? (
        <p role="status" className="mt-3 text-sm font-bold text-saffron">
          {note}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-cream/75">
        Payment optional hai. Yeh website payment verify nahi kar sakti jab tak koi trusted payment
        provider connected na ho. Button dabane se, ya UPI app se wapas aane se, payment successful
        nahi maani jayegi.
      </p>
    </section>
  );
}
