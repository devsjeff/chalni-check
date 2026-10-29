"use client";

import { useAudioControls } from "@/components/AudioProvider";
import { AnimatedGirl } from "@/components/AnimatedGirl";
import { FestiveButton } from "@/components/FestiveButton";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import { roastLines } from "@/lib/dialogues";
import type { RelationshipStatus } from "@/types";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function RoastSequence({
  name,
  status,
  onDone,
}: {
  name: string;
  status: RelationshipStatus;
  onDone: () => void;
}) {
  const headingRef = useFocusHeading();
  const { play } = useAudioControls();
  const reduce = useReducedMotion();
  const lines = roastLines(name, status);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const skipTyping = useRef(false);
  const line = lines[index] ?? "";
  const finishedLine = Boolean(reduce) || count >= line.length;
  const visible = reduce ? line : line.slice(0, count);

  useEffect(() => {
    if (reduce) return;
    skipTyping.current = false;
    let current = 0;
    const timer = window.setInterval(() => {
      if (skipTyping.current) {
        window.clearInterval(timer);
        return;
      }
      current += 1;
      setCount(current);
      if (current >= line.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [index, line, reduce]);

  function next() {
    if (!finishedLine) {
      skipTyping.current = true;
      setCount(line.length);
      return;
    }
    if (index >= lines.length - 1) {
      onDone();
      return;
    }
    setCount(0);
    setIndex((value) => value + 1);
    play("giggle");
  }

  const mood = index === lines.length - 1 ? "wink" : index % 2 === 0 ? "talk" : "laugh";

  return (
    <SceneShell>
      <AnimatedGirl
        mood={mood}
        talking={!finishedLine}
        className="mx-auto h-44 w-36 sm:h-52 sm:w-40"
      />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-3xl leading-tight text-cream"
      >
        Thodi si roast
      </h1>
      <p className="text-center text-sm font-bold text-saffron">
        {index + 1} / {lines.length}
      </p>
      <SpeechBubble>
        <p aria-live="polite">
          <span className="sr-only">{line}</span>
          <span aria-hidden="true">{visible}</span>
        </p>
      </SpeechBubble>
      <div className="mt-auto grid grid-cols-2 gap-3">
        <FestiveButton variant="secondary" onClick={onDone}>
          Skip
        </FestiveButton>
        <FestiveButton onClick={next}>{finishedLine && index === lines.length - 1 ? "Camera" : "Next"}</FestiveButton>
      </div>
    </SceneShell>
  );
}
