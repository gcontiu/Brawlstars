import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BrawlPassReward {
  coins: number;
  gems: number;
  powerPoints: number;
  bling: number;
}

export const BRAWL_PASS_REWARDS: BrawlPassReward[] = Array.from({ length: 30 }, (_, i) => {
  const level = i + 1;
  const reward: BrawlPassReward = {
    coins: 10,
    gems: 0,
    powerPoints: 0,
    bling: 0,
  };

  if (level % 3 === 0) {
    reward.powerPoints += 5;
  }

  if (level % 5 === 0) {
    reward.gems += 2;
  }

  if (level === 10 || level === 20 || level === 30) {
    reward.gems += 5;
  }

  return reward;
});

interface BrawlPassStore {
  level: number;
  xpInLevel: number;
  tier: 'free' | 'plus' | 'premium';
  claimedRewards: number[];
  addXP: (amount: number) => void;
  claimReward: (level: number) => BrawlPassReward | null;
  getRewardForLevel: (level: number) => BrawlPassReward;
  unlockTier: (tier: 'plus' | 'premium') => void;
}

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 30;

export const useBrawlPassStore = create<BrawlPassStore>()(
  persist(
    (set, get) => ({
      level: 1,
      xpInLevel: 0,
      tier: 'free',
      claimedRewards: [],

      addXP: (amount: number) => {
        set((state) => {
          let newXP = state.xpInLevel + amount;
          let newLevel = state.level;

          while (newXP >= XP_PER_LEVEL && newLevel < MAX_LEVEL) {
            newXP -= XP_PER_LEVEL;
            newLevel += 1;
          }

          if (newLevel >= MAX_LEVEL) {
            newXP = Math.min(newXP, XP_PER_LEVEL - 1);
          }

          return { level: newLevel, xpInLevel: newXP };
        });
      },

      claimReward: (level: number) => {
        const { claimedRewards, level: currentLevel } = get();
        if (claimedRewards.includes(level)) return null;
        if (level > currentLevel) return null;

        const reward = get().getRewardForLevel(level);
        set({ claimedRewards: [...claimedRewards, level] });
        return reward;
      },

      getRewardForLevel: (level: number): BrawlPassReward => {
        const idx = Math.max(0, Math.min(level - 1, MAX_LEVEL - 1));
        return BRAWL_PASS_REWARDS[idx];
      },

      unlockTier: (tier: 'plus' | 'premium') => {
        set({ tier });
      },
    }),
    { name: 'german-brawl-brawlpass' }
  )
);
