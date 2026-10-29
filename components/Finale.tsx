"use client";

import { AnimatedGirl } from "@/components/AnimatedGirl";
import { Confetti } from "@/components/Confetti";
import { DonationCard } from "@/components/DonationCard";
import { FestiveButton } from "@/components/FestiveButton";
import { MoonGraphic } from "@/components/MoonGraphic";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import { pickTitle } from "@/lib/dialogues";
import { getAudio } from "@/lib/audio";
import { shareExperience } from "@/lib/share";
import type { RelationshipStatus } from "@/types";
import { useEffect, useState } from "react";

export function Finale({
  name,
  status,
  photo,
  onReplay,
  onDeletePhoto,
}: {
  name: string;
  status: RelationshipStatus;
  photo: string | null;
  onReplay: () => void;
  onDeletePhoto: () => void;
}) {
  const headingRef = useFocusHeading();
  const [title] = useState(() => pickTitle(status));
  const [dated] = useState(() =>
    new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    getAudio()?.play("celebrate");
  }, []);

  async function share() {
    const result = await shareExperience(name);
    if (result === "shared") setNote("Share ho gaya!");
    else if (result === "copied") setNote("Link copy ho gaya. WhatsApp pe paste kar do.");
    else if (result === "failed") setNote("Share nahi ho paya. Address bar se link copy kar lo.");
    else setNote("");
  }

  return (
    <SceneShell>
      <div className="relative">
        <Confetti />
        <AnimatedGirl mood="celebrate" className="mx-auto h-44 w-36 sm:h-52 sm:w-40" />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-3xl leading-tight text-cream"
      >
        Congratulations {name} ji! 🎉
      </h1>
      <SpeechBubble>
        <p>Aapne successfully Karwa Chauth ka digital exam pass kar liya!</p>
        <p className="mt-2">Ab bas asli zindagi mein bhi itna hi pyaar aur patience rakhna! 😂❤️</p>
      </SpeechBubble>

      <article className="relative overflow-hidden rounded-3xl border-2 border-saffron bg-cream px-4 py-5 text-wine-deep shadow-xl">
        <MoonGraphic className="absolute -top-6 right-0 w-20 opacity-90" />
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-wine">
          KARWA CHAUTH CERTIFICATE
        </p>
        <h2 className="mt-2 text-center font-display text-3xl">{name}</h2>
        <p className="mt-3 text-center text-lg font-extrabold">{title}</p>
        <p className="mt-2 text-center text-sm font-bold">Status: Karwa Chauth Approved</p>
        <p className="mt-1 text-center text-sm">{dated}</p>
        {photo ? (
          <div className="mx-auto mt-4 w-28">
            {/* Session-only camera still. next/image cannot render this local data URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              className="aspect-square w-full rounded-full border-4 border-saffron object-cover"
            />
            <button
              type="button"
              onClick={onDeletePhoto}
              className="mt-2 min-h-12 w-full rounded-full text-sm font-extrabold underline"
            >
              Photo hatao
            </button>
          </div>
        ) : null}
        <p className="mt-4 text-center text-xs leading-relaxed">
          Yeh certificate unofficial hai. Face, relationship, ya personality measure nahi hui.
        </p>
      </article>

      {note ? (
        <p role="status" className="text-center text-sm font-bold text-saffron">
          {note}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <FestiveButton onClick={() => void share()}>Share Karo</FestiveButton>
        <FestiveButton variant="secondary" onClick={onReplay}>
          Phir Se Khelo
        </FestiveButton>
        <FestiveButton
          variant="ghost"
          className="sm:col-span-2"
          onClick={() =>
            setNote("Phone pe screenshot le lo — power aur volume, ya quick settings. Certificate sirf tumhare screen par hai.")
          }
        >
          Screenshot Lo
        </FestiveButton>
      </div>
      <DonationCard />
    </SceneShell>
  );
}
