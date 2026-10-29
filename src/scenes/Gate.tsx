import type { Flow } from "../data/scenes";
import { Diya } from "../fx/Flames";

interface GateProps {
  onPick(flow: Flow): void;
}

/**
 * Screen 0: who has arrived tonight? CSS and canvas only, so it paints instantly.
 * The card tap is the user gesture that unlocks Web Audio (browsers block sound
 * until then); App.tsx calls engine.unlock() in the same click handler.
 */
export function Gate({ onPick }: GateProps) {
  return (
    <section className="screen gate" aria-labelledby="gate-title">
      <p className="eyebrow">Karva Chauth · Chaand ki raat</p>
      <h1 id="gate-title" className="gate-title">
        Aaj raat kaun aaya hai?
      </h1>
      <div className="gate-cards">
        <button
          type="button"
          className="gate-card"
          onClick={() => onPick("boy")}
        >
          <span className="gate-card-title">Main Ladka hoon</span>
          <span className="gate-card-sub">Chhat par woh tumhara intezaar kar rahi hai</span>
        </button>
        <button type="button" className="gate-card" onClick={() => onPick("girl")}>
          <span className="gate-card-title">Main Ladki hoon</span>
          <span className="gate-card-sub">Woh paani ka glass liye khada hai</span>
        </button>
      </div>
      <p className="gate-note">Awaaz on rakho · lagbhag 3 minute</p>
      <Diya className="gate-diya gate-diya-left" />
      <Diya className="gate-diya gate-diya-right" />
    </section>
  );
}

interface EnterProps {
  name: string;
  flow: Flow;
  onEnter(): void;
}

/** Personal links skip the gate, but one tap is still needed to unlock audio. */
export function EnterScreen({ name, flow, onEnter }: EnterProps) {
  const who = flow === "boy" ? "Woh chhat par tumhara intezaar kar rahi hai" : "Woh chhat par tumhara intezaar kar raha hai";
  return (
    <section className="screen gate" aria-labelledby="enter-title">
      <p className="eyebrow">Karva Chauth · Chaand ki raat</p>
      <h1 id="enter-title" className="gate-title">
        {name ? `${name}, ` : ""}
        <span className="whitespace-nowrap">kisi ne tumhare liye</span> chaand sajaya hai
      </h1>
      <p className="gate-lede">{who}</p>
      <button type="button" className="enter-button" onClick={onEnter}>
        <span className="enter-moon" aria-hidden="true" />
        Tap karke andar aao
      </button>
      <p className="gate-note">Awaaz on rakho</p>
      <Diya className="gate-diya gate-diya-left" />
      <Diya className="gate-diya gate-diya-right" />
    </section>
  );
}
