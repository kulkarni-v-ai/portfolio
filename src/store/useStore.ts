import { create } from 'zustand';

interface AppState {
  scrollProgress: number;
  cursorPosition: { x: number; y: number };
  energyLevel: number;
  aiEvolution: number;
  setScrollProgress: (progress: number) => void;
  setCursorPosition: (x: number, y: number) => void;
  setEnergyLevel: (level: number) => void;
  setAiEvolution: (evolution: number) => void;
}

export const useStore = create<AppState>((set) => ({
  scrollProgress: 0,
  cursorPosition: { x: 0, y: 0 },
  energyLevel: 0, // Range: 0 to 1
  aiEvolution: 0, // Range: 0 to 1
  
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setAiEvolution: (evolution) => set({ aiEvolution: evolution }),
}));
