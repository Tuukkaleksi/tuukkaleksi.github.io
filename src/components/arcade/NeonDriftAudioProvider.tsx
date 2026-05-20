"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { ArcadeAudio, getArcadeAudio, shutdownArcadeAudio } from "@/lib/arcade/audio";

const ArcadeAudioContext = createContext<ArcadeAudio | null>(null);

export function useArcadeAudio() {
  return useContext(ArcadeAudioContext) ?? getArcadeAudio();
}

type NeonDriftAudioProviderProps = {
  children: ReactNode;
};

/** Keeps hub music alive across /neon-drift/* routes (shop, leaderboard, play). */
export function NeonDriftAudioProvider({ children }: NeonDriftAudioProviderProps) {
  const audio = useMemo(() => getArcadeAudio(), []);

  useEffect(() => {
    audio.preloadMusic();
    void audio.resume().then(() => audio.playMenuMusic());

    return () => {
      audio.leaveNeonDriftHub();
      shutdownArcadeAudio();
    };
  }, [audio]);

  return (
    <ArcadeAudioContext.Provider value={audio}>{children}</ArcadeAudioContext.Provider>
  );
}
