"use client";

import { AudioProvider } from "@/components/AudioProvider";
import { AnimatedGirl } from "@/components/AnimatedGirl";
import { ChalniCamera } from "@/components/ChalniCamera";
import { FakeHusbandSimulator } from "@/components/FakeHusbandSimulator";
import { FestiveBackground } from "@/components/FestiveBackground";
import { FestiveButton } from "@/components/FestiveButton";
import { Finale } from "@/components/Finale";
import { MusicControls } from "@/components/MusicControls";
import { NameEntry } from "@/components/NameEntry";
import { RoastSequence } from "@/components/RoastSequence";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import type { RelationshipStatus, Scene } from "@/types";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const FULL_PATH: Scene[] = ["welcome", "name", "husband", "roast", "camera", "finale"];
const SHORT_PATH: Scene[] = ["welcome", "name", "roast", "camera", "finale"];

function WelcomeScene({ onStart }: { onStart: () => void }) {
  const headingRef = useFocusHeading();

  return (
    <SceneShell>
      <AnimatedGirl mood="wave" className="mx-auto h-52 w-40 sm:h-60 sm:w-48" />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-4xl leading-none text-cream sm:text-5xl"
      >
        Karwa Chauth Ki Kasam
      </h1>
      <p className="text-center text-lg font-extrabold text-saffron">
        Single ho? No problem. Fake husband ready hai!
      </p>
      <SpeechBubble>
        <p>Hiiii bestie! 👋❤️</p>
        <p className="mt-2">Welcome to Karwa Chauth ki duniya!</p>
        <p className="mt-2">Yahan pyaar hai, drama hai... aur FULL roast bhi! 😂</p>
        <p className="mt-2">Single ho? Tension mat lo — fake husband ready hai! 💅</p>
      </SpeechBubble>
      <p className="text-center text-sm text-cream/80">Koi login nahi. Koi signup nahi. Seedha masti.</p>
      <FestiveButton className="pulse-cta mt-auto" onClick={onStart}>
        Chalo shuru karein 💃
      </FestiveButton>
    </SceneShell>
  );
}

function Experience() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState<Scene>("welcome");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<RelationshipStatus | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [run, setRun] = useState(0);

  const steps = status && status !== "single" ? SHORT_PATH : FULL_PATH;
  const stepIndex = Math.max(0, steps.indexOf(scene));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [scene, reduce, run]);

  function completeIntro(nextName: string, nextStatus: RelationshipStatus) {
    setName(nextName);
    setStatus(nextStatus);
    setScene(nextStatus === "single" ? "husband" : "roast");
  }

  function replay() {
    setName("");
    setStatus(null);
    setPhoto(null);
    setScene("welcome");
    setRun((value) => value + 1);
  }

  return (
    <div className="relative min-h-dvh">
      <FestiveBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-safe">
        <header className="flex items-center justify-between gap-3 pt-safe">
          <div>
            <p className="font-display text-lg leading-none text-cream">Karwa Chauth Ki Kasam</p>
            <p className="mt-1 text-xs text-cream/80">No login. No upload.</p>
          </div>
          <MusicControls />
        </header>
        <nav aria-label="Experience progress" className="mt-4">
          <ol className="flex gap-1.5">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`h-1.5 flex-1 rounded-full ${index <= stepIndex ? "bg-saffron" : "bg-cream/25"}`}
              />
            ))}
          </ol>
        </nav>
        <div id="experience" className="flex flex-1 flex-col py-4">
          <AnimatePresence mode="wait">
            {scene === "welcome" ? (
              <WelcomeScene key={`welcome-${run}`} onStart={() => setScene("name")} />
            ) : null}
            {scene === "name" ? (
              <NameEntry key={`name-${run}`} onComplete={completeIntro} />
            ) : null}
            {scene === "husband" && status === "single" ? (
              <FakeHusbandSimulator
                key={`husband-${run}`}
                name={name}
                onRoast={() => setScene("roast")}
                onSkipToCamera={() => setScene("camera")}
              />
            ) : null}
            {scene === "roast" && status ? (
              <RoastSequence
                key={`roast-${run}`}
                name={name}
                status={status}
                onDone={() => setScene("camera")}
              />
            ) : null}
            {scene === "camera" ? (
              <ChalniCamera
                key={`camera-${run}`}
                name={name || "Bestie"}
                onFinish={(nextPhoto) => {
                  setPhoto(nextPhoto);
                  setScene("finale");
                }}
              />
            ) : null}
            {scene === "finale" && status ? (
              <Finale
                key={`finale-${run}`}
                name={name}
                status={status}
                photo={photo}
                onReplay={replay}
                onDeletePhoto={() => setPhoto(null)}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function KarwaExperience() {
  return (
    <AudioProvider>
      <Experience />
    </AudioProvider>
  );
}
