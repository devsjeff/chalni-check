import type { CameraFailure } from "@/types";

export class CameraAccessError extends Error {
  readonly failure: CameraFailure;

  constructor(failure: CameraFailure, message: string) {
    super(message);
    this.name = "CameraAccessError";
    this.failure = failure;
  }
}

export function stopStream(stream: MediaStream | null | undefined) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export async function requestCamera(): Promise<MediaStream> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new CameraAccessError("unsupported", "Camera is unavailable.");
  }

  if (!window.isSecureContext) {
    throw new CameraAccessError(
      "insecure",
      "Camera needs HTTPS or localhost.",
    );
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraAccessError(
      "unsupported",
      "This browser cannot open a camera.",
    );
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 720 },
        height: { ideal: 720 },
      },
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      throw new CameraAccessError("denied", "Camera permission was denied.");
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      throw new CameraAccessError("missing", "No camera was found.");
    }
    if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
      throw new CameraAccessError("busy", "The camera is busy.");
    }
    if (name === "SecurityError") {
      throw new CameraAccessError("insecure", "Camera is blocked on this connection.");
    }
    throw new CameraAccessError("unknown", "The camera could not start.");
  }
}

/** Crops the current video frame to a square JPEG. The image never leaves the browser. */
export function captureFrame(video: HTMLVideoElement, mirror = true): string | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const size = 720;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;
  if (mirror) {
    context.translate(size, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}
