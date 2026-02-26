import { create } from 'zustand';

interface AppState {
  scrollProgress: number;
  cursorPosition: { x: number; y: number };
  energyLevel: number;
  aiEvolution: number;
  coreRef: any;

  // Rocket transition state
  isTransitioning: boolean;
  transitionTarget: string | null;

  // Gesture mode
  gestureActive: boolean;

  setScrollProgress: (progress: number) => void;
  setCursorPosition: (x: number, y: number) => void;
  setEnergyLevel: (level: number) => void;
  setAiEvolution: (evolution: number) => void;
  setCoreRef: (ref: any) => void;
  startTransition: (target: string) => void;
  endTransition: () => void;
  setGestureActive: (active: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  scrollProgress: 0,
  cursorPosition: { x: 0, y: 0 },
  energyLevel: 0,
  aiEvolution: 0,
  coreRef: null,
  isTransitioning: false,
  transitionTarget: null,
  gestureActive: false,

  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setAiEvolution: (evolution) => set({ aiEvolution: evolution }),
  setCoreRef: (ref) => set({ coreRef: ref }),
  startTransition: (target) => set({ isTransitioning: true, transitionTarget: target }),
  endTransition: () => set({ isTransitioning: false, transitionTarget: null }),
  setGestureActive: (active) => set({ gestureActive: active }),
}));
