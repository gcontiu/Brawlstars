import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UPGRADE_COSTS } from '../types';
import { useEconomyStore } from './useEconomyStore';

interface BrawlerProgress {
  trophies: number;
  level: number;
}

interface BrawlerStore {
  activeBrawlerId: string;
  progress: Record<string, BrawlerProgress>;
  setActive: (id: string) => void;
  addTrophies: (id: string, delta: number) => void;
  getProgress: (id: string) => BrawlerProgress;
  canUpgrade: (id: string) => boolean;
  upgrade: (id: string) => boolean;
}

const defaultProgress = (): BrawlerProgress => ({ trophies: 0, level: 1 });

export const useBrawlerStore = create<BrawlerStore>()(
  persist(
    (set, get) => ({
      activeBrawlerId: 'shelly',
      progress: { shelly: defaultProgress() },

      setActive: (id) => set({ activeBrawlerId: id }),

      addTrophies: (id, delta) =>
        set((s) => {
          const current = s.progress[id] ?? defaultProgress();
          return {
            progress: {
              ...s.progress,
              [id]: { ...current, trophies: Math.max(0, current.trophies + delta) },
            },
          };
        }),

      getProgress: (id) => get().progress[id] ?? defaultProgress(),

      canUpgrade: (id) => {
        const { level } = get().progress[id] ?? defaultProgress();
        if (level >= 11) return false;
        const cost = UPGRADE_COSTS.find((c) => c.level === level + 1);
        if (!cost) return false;
        const { powerPoints, coins } = useEconomyStore.getState();
        return powerPoints >= cost.powerPoints && coins >= cost.coins;
      },

      upgrade: (id) => {
        const { progress } = get();
        const current = progress[id] ?? defaultProgress();
        if (current.level >= 11) return false;
        const cost = UPGRADE_COSTS.find((c) => c.level === current.level + 1);
        if (!cost) return false;
        const economy = useEconomyStore.getState();
        const ppOk = economy.spend('powerPoints', cost.powerPoints);
        if (!ppOk) return false;
        const coinsOk = economy.spend('coins', cost.coins);
        if (!coinsOk) {
          economy.addPowerPoints(cost.powerPoints);
          return false;
        }
        set((s) => ({
          progress: {
            ...s.progress,
            [id]: { ...(s.progress[id] ?? defaultProgress()), level: current.level + 1 },
          },
        }));
        return true;
      },
    }),
    { name: 'german-brawl-brawlers' }
  )
);
