import { create } from 'zustand'

interface SystemState {
  // ── Core System Values ──
  scrollProgress: number
  cursorPosition: { x: number; y: number }
  energyLevel: number
  aiEvolution: number
  
  // ── Actions ──
  setScrollProgress: (progress: number) => void
  setCursorPosition: (x: number, y: number) => void
  setEnergyLevel: (level: number) => void
  setAiEvolution: (evolution: number) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  // Initial states
  scrollProgress: 0,
  cursorPosition: { x: 0, y: 0 },
  energyLevel: 100, // Starts at 100%
  aiEvolution: 0,   // Starts at stage 0
  
  // Updaters
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setAiEvolution: (evolution) => set({ aiEvolution: evolution }),
}))
