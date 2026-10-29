"use client";

import { useAudioControls } from "@/components/AudioProvider";
import { AnimatedGirl } from "@/components/AnimatedGirl";
import { FakeHusband } from "@/components/FakeHusband";
import { FestiveButton } from "@/components/FestiveButton";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import { HUSBAND_CARDS } from "@/lib/dialogues";
import { useState } from "react";

export function FakeHusbandSimulator({
  name,
  onRoast,
  onSkipToCamera,
}: {
  name: string;
  onRoast: () => void;
  onSkipToCamera: () => void;
}) {
  const headingRef = useFocusHeading();
  const { play } = useAudioControls();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string[]>([]);
  const allTapped = HUSBAND_CARDS.every((card) => tapped.includes(card.id));
  const active = HUSBAND_CARDS.find((card) => card.id === openId);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
    setTapped((current) => (current.includes(id) ? current : [...current, id]));
    play("giggle");
  }

  return (
    <SceneShell>
      <div className="flex items-end justify-center gap-2">
        <AnimatedGirl mood={active ? "laugh" : "smug"} talking className="h-36 w-28" />
        <FakeHusband className="h-36 w-28" />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-3xl leading-tight text-cream"
      >
        Fake Husband Simulator
      </h1>
      <SpeechBubble>
        <p>Bestie {name}, since you are single... let me introduce you to your FAKE HUSBAND! 😂</p>
        <p className="mt-2">Yeh raha tumhara virtual pati — ready to disappoint! 💀</p>
        <p className="mt-2 text-sm text-cream/80">100% fictional. Koi real insaan nahi. Sirf comedy.</p>
      </SpeechBubble>

      <div className="grid gap-2">
        {HUSBAND_CARDS.map((card) => {
          const open = openId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-expanded={open}
              onClick={() => toggle(card.id)}
              className={`rounded-2xl border px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                open ? "border-saffron bg-cream text-wine-deep" : "border-cream/30 bg-white/10 text-cream"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-extrabold">
                  {card.emoji} {card.title}
                </span>
                <span className={`text-sm font-bold ${open ? "text-wine-deep" : "text-saffron"}`}>
                  {open ? "Reacted" : "React"}
                </span>
              </span>
              {open ? (
                <span className="mt-2 block text-sm leading-relaxed">
                  <span className="block">Fake husband: &quot;{card.husband}&quot;</span>
                  <span className="mt-1 block font-extrabold">{card.reaction}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {allTapped ? (
        <SpeechBubble>
          <p>Toh kaisa laga single life? 😂❤️</p>
          <p className="mt-2">Ab thodi si roast, phir chalni camera. Ready?</p>
        </SpeechBubble>
      ) : (
        <p className="text-center text-sm text-cream/75">{tapped.length}/4 scenes reacted</p>
      )}

      <div className="mt-auto grid gap-3">
        <FestiveButton onClick={onRoast}>Roast suno 😂</FestiveButton>
        <FestiveButton variant="secondary" onClick={onSkipToCamera}>
          Skip karo, camera wali cheez karo! 😎
        </FestiveButton>
      </div>
    </SceneShell>
  );
}
