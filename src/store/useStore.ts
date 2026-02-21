import { create } from 'zustand';

interface AppState {
  scrollProgress: number;
  cursorPosition: { x: number; y: number };
  energyLevel: number;
  aiEvolution: number;
  coreRef: any; // Using any for the React ref to avoid circular dependency or complex typing issues here
  setScrollProgress: (progress: number) => void;
  setCursorPosition: (x: number, y: number) => void;
  setEnergyLevel: (level: number) => void;
  setAiEvolution: (evolution: number) => void;
  setCoreRef: (ref: any) => void;
}

export const useStore = create<AppState>((set) => ({
  scrollProgress: 0,
  cursorPosition: { x: 0, y: 0 },
  energyLevel: 0,
  aiEvolution: 0,
  coreRef: null,

  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setAiEvolution: (evolution) => set({ aiEvolution: evolution }),
  setCoreRef: (ref) => set({ coreRef: ref }),
}));
