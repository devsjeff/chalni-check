import { useEffect, useRef, useState } from "react";

/**
 * Optional chalni selfie, only after the finale. Camera never starts on its own.
 * The still stays on this device; nothing is uploaded.
 * Video stays mounted so getUserMedia can attach after the live phase paints.
 */
export function SelfieOptional({ onClose }: { onClose(): void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"ask" | "live" | "shot" | "error">("ask");
  const [shot, setShot] = useState<string | null>(null);
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
    stop();
    setShot(canvas.toDataURL("image/png"));
    setPhase("shot");
  };

  const download = () => {
    if (!shot) return;
    const link = document.createElement("a");
    link.href = shot;
    link.download = "karva-chauth-chalni.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const close = () => {
    stop();
    setShot(null);
    onClose();
  };

  return (
    <div className="selfie" role="dialog" aria-modal="true" aria-labelledby="selfie-title">
      <h2 id="selfie-title" className="gate-title">
        Chalni selfie
      </h2>
      <p className="gate-lede">Sirf is phone par rahegi. Upload nahi hoti.</p>
      <div className="selfie-ring">
        <video
          ref={videoRef}
          className={`selfie-video ${phase === "live" ? "is-on" : ""}`}
          muted
          playsInline
          autoPlay
          aria-hidden={phase !== "live"}
        />
        {phase === "shot" && shot ? (
          <img src={shot} alt="Tumhari chalni selfie, is phone par hi" className="selfie-shot" />
        ) : null}
        {phase !== "live" && phase !== "shot" ? <div className="selfie-empty" /> : null}
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
          <button type="button" className="primary-button" onClick={() => void start()}>
            Camera on karo
          </button>
        ) : null}
        {phase === "live" ? (
          <button type="button" className="primary-button" onClick={capture}>
            Photo lo
          </button>
        ) : null}
        {phase === "shot" ? (
          <button type="button" className="primary-button" onClick={download}>
            Save karo
          </button>
        ) : null}
        <button type="button" className="secondary-button selfie-skip" onClick={close}>
          Skip karo
        </button>
      </div>
    </div>
  );
}
