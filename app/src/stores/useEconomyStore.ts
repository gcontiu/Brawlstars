import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EconomyStore {
  coins: number;
  gems: number;
  bling: number;
  credits: number;
  powerPoints: number;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addBling: (amount: number) => void;
  addCredits: (amount: number) => void;
  addPowerPoints: (amount: number) => void;
  spend: (currency: 'coins' | 'gems' | 'bling' | 'credits' | 'powerPoints', amount: number) => boolean;
}

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      coins: 100,
      gems: 10,
      bling: 0,
      credits: 0,
      powerPoints: 0,
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      addGems: (amount) => set((s) => ({ gems: s.gems + amount })),
      addBling: (amount) => set((s) => ({ bling: s.bling + amount })),
      addCredits: (amount) => set((s) => ({ credits: s.credits + amount })),
      addPowerPoints: (amount) => set((s) => ({ powerPoints: s.powerPoints + amount })),
      spend: (currency, amount) => {
        const current = get()[currency];
        if (current < amount) return false;
        set({ [currency]: current - amount });
        return true;
      },
    }),
    { name: 'german-brawl-economy' }
  )
);
