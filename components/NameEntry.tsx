"use client";

import { useAudioControls } from "@/components/AudioProvider";
import { AnimatedGirl } from "@/components/AnimatedGirl";
import { FestiveButton } from "@/components/FestiveButton";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import { STATUS_OPTIONS, statusReaction } from "@/lib/dialogues";
import type { RelationshipStatus } from "@/types";
import { useState, type FormEvent } from "react";

function tidy(value: string) {
  return value.replace(/[\u0000-\u001F]/g, "").replace(/\s+/g, " ").trim().slice(0, 32);
}

export function NameEntry({
  onComplete,
}: {
  onComplete: (name: string, status: RelationshipStatus) => void;
}) {
  const headingRef = useFocusHeading();
  const { play } = useAudioControls();
  const [step, setStep] = useState<"name" | "status" | "reaction">("name");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<RelationshipStatus | null>(null);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function reject(message: string) {
    setError(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    const clean = tidy(name);
    if (!clean) {
      reject("Arre naam toh batao!");
      return;
    }
    setName(clean);
    setError("");
    setStep("status");
    play("giggle");
  }

  function submitStatus() {
    if (!status) {
      reject("Ek status choose karo, bestie.");
      return;
    }
    setError("");
    setStep("reaction");
    play("giggle");
  }

  const reaction = status ? statusReaction(name, status) : "";

  return (
    <SceneShell>
      <AnimatedGirl
        mood={step === "reaction" ? "laugh" : "think"}
        talking={step !== "name"}
        className="mx-auto h-44 w-36 sm:h-52 sm:w-40"
      />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-3xl leading-tight text-cream"
      >
        {step === "name" ? "Naam batao" : step === "status" ? "Status kya hai?" : `${name} ji`}
      </h1>

      {step === "name" ? (
        <form onSubmit={submitName} className={`space-y-3 ${shake ? "shake" : ""}`}>
          <SpeechBubble>
            <p>Okay bestie, pehle batao — tumhara naam kya hai? 👀</p>
          </SpeechBubble>
          <label htmlFor="visitor-name" className="sr-only">
            Your name
          </label>
          <input
            id="visitor-name"
            name="name"
            value={name}
            maxLength={32}
            autoComplete="nickname"
            enterKeyHint="next"
            placeholder="Apna naam likho..."
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "name-error" : undefined}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            className="festive-input"
          />
          {error ? (
            <p id="name-error" role="alert" className="font-bold text-saffron">
              {error} 😤
            </p>
          ) : (
            <p className="text-sm text-cream/80">Koi account nahi. Naam sirf is screen ke liye hai.</p>
          )}
          <FestiveButton type="submit">Aage chalo</FestiveButton>
        </form>
      ) : null}

      {step === "status" ? (
        <div className={shake ? "shake" : ""}>
          <SpeechBubble>
            <p>Ab batao — relationship status kya hai? 🤔</p>
            <p className="mt-1 text-sm text-cream/80">
              Yeh sirf comedy route choose karne ke liye hai. Koi judgement nahi.
            </p>
          </SpeechBubble>
          <div role="radiogroup" aria-label="Relationship status" className="mt-3 grid gap-2">
            {STATUS_OPTIONS.map((option) => {
              const selected = status === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setStatus(option.id);
                    setError("");
                    play("click");
                  }}
                  className={`min-h-14 w-full rounded-2xl border px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                    selected
                      ? "border-saffron bg-saffron text-wine-deep"
                      : "border-cream/30 bg-white/10 text-cream"
                  }`}
                >
                  <span className="block font-extrabold">{option.label}</span>
                  <span className={`block text-sm ${selected ? "text-wine-deep/80" : "text-cream/80"}`}>
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
          {error ? (
            <p role="alert" className="mt-2 font-bold text-saffron">
              {error}
            </p>
          ) : null}
          <FestiveButton className="mt-3" onClick={submitStatus}>
            Yeh wala lock karo
          </FestiveButton>
        </div>
      ) : null}

      {step === "reaction" && status ? (
        <div className="flex flex-1 flex-col gap-4">
          <SpeechBubble>
            <p>{reaction}</p>
          </SpeechBubble>
          <FestiveButton className="mt-auto" onClick={() => onComplete(name, status)}>
            {status === "single" ? "Fake husband milo 💍" : "Roast suno 😂"}
          </FestiveButton>
        </div>
      ) : null}
    </SceneShell>
  );
}
