"use client";

import { useAudioControls } from "@/components/AudioProvider";
import { AudioLines, Volume2, VolumeX } from "lucide-react";

export function MusicControls() {
  const { muted, musicOn, toggleMute, toggleMusic } = useAudioControls();

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        aria-pressed={musicOn}
        aria-label={musicOn ? "Turn festive music off" : "Turn festive music on"}
        onClick={toggleMusic}
        className={`inline-flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
          musicOn ? "border-saffron bg-saffron text-wine-deep" : "border-cream/35 bg-wine-deep/40"
        }`}
      >
        <AudioLines aria-hidden="true" size={20} />
      </button>
      <button
        type="button"
        aria-pressed={muted}
        aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
        onClick={toggleMute}
        className="inline-flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-cream/35 bg-wine-deep/40 text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
      >
        {muted ? <VolumeX aria-hidden="true" size={20} /> : <Volume2 aria-hidden="true" size={20} />}
      </button>
    </div>
  );
}
