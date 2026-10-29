"use client";

import { useAudioControls } from "@/components/AudioProvider";
import { Confetti } from "@/components/Confetti";
import { FestiveButton } from "@/components/FestiveButton";
import { MoonGraphic } from "@/components/MoonGraphic";
import { SceneShell, SpeechBubble, useFocusHeading } from "@/components/SceneShell";
import { CameraAccessError, captureFrame, requestCamera, stopStream } from "@/lib/camera";
import type { CameraFailure } from "@/types";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const FAILURE_COPY: Record<CameraFailure, string> = {
  denied: "Koi baat nahi! Camera nahi chahiye, phir bhi masti karenge! 😎",
  missing: "Camera nahi mila? No worries! Lets skip! 🎉",
  insecure: "Camera ke liye HTTPS chahiye. Skip karo!",
  unsupported: "Is browser mein camera nahi chalta. Skip karke aage badh jao.",
  busy: "Camera kisi aur app mein busy hai. Band karke try karo, ya skip karo.",
  unknown: "Camera shuru nahi ho paya. Skip karke finale dekh lo.",
};

export function ChalniCamera({
  name,
  onFinish,
}: {
  name: string;
  onFinish: (photo: string | null) => void;
}) {
  const headingRef = useFocusHeading();
  const { play } = useAudioControls();
  const frameId = useId().replace(/:/g, "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [phase, setPhase] = useState<"idle" | "starting" | "live" | "captured" | "error">("idle");
  const [failure, setFailure] = useState<CameraFailure | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [burst, setBurst] = useState(false);

  const release = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
  }, [stream]);

  async function start() {
    setHint("");
    setFailure(null);
    setPhase("starting");
    try {
      const next = await requestCamera();
      if (!alive.current) {
        stopStream(next);
        return;
      }
      streamRef.current = next;
      setStream(next);
      setPhase("live");
    } catch (error) {
      if (!alive.current) return;
      const reason = error instanceof CameraAccessError ? error.failure : "unknown";
      setFailure(reason);
      setPhase("error");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const frame = captureFrame(video);
    if (!frame) {
      setHint("Frame nahi mila. Ek second ruk ke phir se capture karo.");
      return;
    }
    release();
    setShot(frame);
    setPhase("captured");
    setBurst(true);
    play("shutter");
    play("celebrate");
  }

  function retake() {
    setShot(null);
    setBurst(false);
    setHint("");
    setPhase("idle");
  }

  function stopCamera() {
    release();
    setPhase("idle");
  }

  function finish(photo: string | null) {
    release();
    onFinish(photo);
  }

  return (
    <SceneShell>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center font-display text-3xl leading-tight text-cream"
      >
        Chalni camera
      </h1>
      <SpeechBubble>
        <p>Ab camera ke saamne aao bestie! 😂</p>
        <p className="mt-2">Chalni ke andar apna face dikhao — Karwa Chauth ka mahaul banao!</p>
        <p className="mt-2">No fear, full confidence! ✨</p>
      </SpeechBubble>

      <div className="relative mx-auto w-full max-w-[320px]">
        {burst ? <Confetti /> : null}
        <div className="relative aspect-square overflow-hidden rounded-full border-4 border-saffron bg-wine-deep shadow-xl">
          {phase === "live" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Camera preview. This video stays on your phone and is not uploaded."
              className="h-full w-full scale-x-[-1] object-cover"
            />
          ) : null}
          {phase === "captured" && shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shot}
              alt={`${name} ka chalni moment, stored only in this browser tab`}
              className="h-full w-full object-cover"
            />
          ) : null}
          {phase !== "live" && phase !== "captured" ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-cream/80">
              Camera tab band hai. Button dabane par hi on hoga.
            </div>
          ) : null}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <pattern id={`${frameId}-mesh`} width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1.1" fill="rgba(255,245,230,0.35)" />
              </pattern>
            </defs>
            <circle cx="50" cy="50" r="46" fill={`url(#${frameId}-mesh)`} />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#ffb347" strokeWidth="2.4" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#fff5e6" strokeWidth="0.6" />
          </svg>
        </div>
        <MoonGraphic className="absolute -top-4 -right-2 w-16" />
      </div>

      {phase === "captured" ? (
        <SpeechBubble>
          <p>{name} ji ka chand toh screen par hi aa gaya! 🌝😂</p>
          <p className="mt-2 text-sm text-cream/80">
            Photo is browser tab mein hi hai. Koi upload, face scan, ya analysis nahi.
          </p>
        </SpeechBubble>
      ) : null}

      {phase === "idle" || phase === "starting" ? (
        <div className="glass-card rounded-3xl px-4 py-3 text-sm leading-relaxed text-cream">
          <p className="font-extrabold">Camera kyun chahiye?</p>
          <p className="mt-1">Chalni experience ke liye — tumhara face preview dikhane ke liye.</p>
          <p className="mt-1">Koi upload nahi hoga. Koi data saved nahi. Fully private.</p>
        </div>
      ) : null}

      {hint ? (
        <p role="status" className="text-center text-sm font-bold text-saffron">
          {hint}
        </p>
      ) : null}
      {phase === "error" && failure ? (
        <p role="alert" className="text-center font-bold text-cream">
          {FAILURE_COPY[failure]}
        </p>
      ) : null}

      <div className="mt-auto grid gap-3">
        {phase === "idle" || phase === "error" ? (
          <FestiveButton onClick={() => void start()}>
            Camera Allow Karo 📸
          </FestiveButton>
        ) : null}
        {phase === "starting" ? (
          <FestiveButton disabled>Camera khul raha hai...</FestiveButton>
        ) : null}
        {phase === "live" ? (
          <>
            <FestiveButton onClick={capture}>Capture Funny Moment 📸</FestiveButton>
            <FestiveButton variant="secondary" onClick={stopCamera}>
              Camera band karo
            </FestiveButton>
          </>
        ) : null}
        {phase === "captured" ? (
          <>
            <FestiveButton onClick={() => finish(shot)}>Yeh wali rakh lo</FestiveButton>
            <FestiveButton variant="secondary" onClick={retake}>
              Retake
            </FestiveButton>
            <FestiveButton variant="ghost" onClick={retake}>
              Photo hatao
            </FestiveButton>
          </>
        ) : null}
        <FestiveButton variant="secondary" onClick={() => finish(null)}>
          Skip Karo 😎
        </FestiveButton>
      </div>
    </SceneShell>
  );
}
