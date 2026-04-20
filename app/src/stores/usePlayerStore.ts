import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStore {
  xp: number;
  trophies: number;
  winStreak: number;
  battlesPlayed: number;
  brawlerLevel: number;
  addXP: (amount: number) => void;
  updateTrophies: (delta: number) => void;
  incrementWinStreak: () => void;
  resetWinStreak: () => void;
  incrementBattles: () => void;
  levelUp: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      xp: 0,
      trophies: 0,
      winStreak: 0,
      battlesPlayed: 0,
      brawlerLevel: 1,
      addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
      updateTrophies: (delta) => set((s) => ({ trophies: Math.max(0, s.trophies + delta) })),
      incrementWinStreak: () => set((s) => ({ winStreak: s.winStreak + 1 })),
      resetWinStreak: () => set({ winStreak: 0 }),
      incrementBattles: () => set((s) => ({ battlesPlayed: s.battlesPlayed + 1 })),
      levelUp: () => set((s) => ({ brawlerLevel: Math.min(s.brawlerLevel + 1, 11) })),
    }),
    { name: 'german-brawl-player' }
  )
);
