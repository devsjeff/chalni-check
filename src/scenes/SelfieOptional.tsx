import { useEffect, useRef, useState } from "react";

/**
 * Last-step chalni selfie. Camera never starts on its own.
 * The still stays on this device; nothing is uploaded.
 * Video stays mounted so getUserMedia can attach after the live phase paints.
 */
export function SelfieOptional({
  onCaptured,
  onSkip,
}: {
  onCaptured(dataUrl: string): void;
  onSkip(): void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"ask" | "live" | "error">("ask");
  const [note, setNote] = useState("");

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => stop(), []);

  useEffect(() => {
    if (phase !== "live") return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
  }, [phase]);

  const start = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setPhase("error");
      setNote("Camera ke liye HTTPS aur ek supported browser chahiye.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setPhase("live");
    } catch {
      setPhase("error");
      setNote("Camera nahi khula. Skip karo, koi baat nahi.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const size = 720;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size);
    const shot = canvas.toDataURL("image/png");
    stop();
    onCaptured(shot);
  };

  const skip = () => {
    stop();
    onSkip();
  };

  return (
    <div className="selfie" role="dialog" aria-modal="true" aria-labelledby="selfie-title">
      <p className="eyebrow">Aakhri kadam</p>
      <h2 id="selfie-title" className="gate-title">
        Apne aap ko chalni mein dekho
      </h2>
      <p className="gate-lede">See yourself inside the chalni. Sirf is phone par rahegi.</p>
      <div className="selfie-ring selfie-ring-lg">
        <video
          ref={videoRef}
          className={`selfie-video ${phase === "live" ? "is-on" : ""}`}
          muted
          playsInline
          autoPlay
          aria-hidden={phase !== "live"}
        />
        {phase !== "live" ? <div className="selfie-empty" /> : null}
        <div className="chalni-ring-mesh selfie-mesh" />
        <div className="chalni-ring-rim selfie-rim" />
      </div>
      {note ? (
        <p className="finale-note" role="status">
          {note}
        </p>
      ) : null}
      <div className="finale-actions">
        {phase === "ask" || phase === "error" ? (
          <button type="button" className="primary-button selfie-cta" onClick={() => void start()}>
            Chalni mein dekho
          </button>
        ) : null}
        {phase === "live" ? (
          <button type="button" className="primary-button selfie-cta" onClick={capture}>
            Photo lo
          </button>
        ) : null}
        <button type="button" className="secondary-button selfie-skip" onClick={skip}>
          Skip karo
        </button>
      </div>
    </div>
  );
}
