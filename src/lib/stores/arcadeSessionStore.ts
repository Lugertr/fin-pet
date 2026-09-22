// lib/stores/arcadeSessionStore.ts
// Эфемерная сессия тренажёра (§10 ТЗ) — собирается один раз при запуске и
// читается экраном (modal)/arcade.tsx. Не персистится: это состояние одного
// прохождения, а не профиль.

import { TrainerSession } from '@/domain/arcade/TrainerSelection';
import { create } from 'zustand';

interface ArcadeSessionState {
  session: TrainerSession | null;
  startSession: (session: TrainerSession) => void;
  clearSession: () => void;
}

export const useArcadeSessionStore = create<ArcadeSessionState>((set) => ({
  session: null,
  startSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
