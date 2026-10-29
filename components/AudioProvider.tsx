"use client";

import { getAudio } from "@/lib/audio";
import type { SfxName } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AudioControls = {
  muted: boolean;
  musicOn: boolean;
  toggleMute: () => void;
  toggleMusic: () => void;
  play: (name: SfxName) => void;
};

const AudioContext = createContext<AudioControls | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    const unlock = () => getAudio()?.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const value = useMemo<AudioControls>(
    () => ({
      muted,
      musicOn,
      toggleMute: () => {
        const next = !muted;
        setMuted(next);
        getAudio()?.setMuted(next);
      },
      toggleMusic: () => {
        const next = !musicOn;
        setMusicOn(next);
        const audio = getAudio();
        void audio?.setMusic(next);
        if (!muted) audio?.play("click");
      },
      play: (name) => getAudio()?.play(name),
    }),
    [muted, musicOn],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudioControls(): AudioControls {
  return (
    useContext(AudioContext) ?? {
      muted: false,
      musicOn: false,
      toggleMute: () => undefined,
      toggleMusic: () => undefined,
      play: () => undefined,
    }
  );
}
