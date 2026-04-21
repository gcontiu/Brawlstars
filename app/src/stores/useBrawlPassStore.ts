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
  unlockedTiers: ('free' | 'plus' | 'premium')[];
  claimedRewards: number[];
  addXP: (amount: number) => void;
  claimReward: (level: number) => BrawlPassReward | null;
  getRewardForLevel: (level: number) => BrawlPassReward;
  unlockTier: (tier: 'plus' | 'premium') => void;
  switchTier: (tier: 'free' | 'plus' | 'premium') => void;
}

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 30;

export const useBrawlPassStore = create<BrawlPassStore>()(
  persist(
    (set, get) => ({
      level: 1,
      xpInLevel: 0,
      tier: 'free',
      unlockedTiers: ['free'],
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
        const base = BRAWL_PASS_REWARDS[idx];
        const tier = get().tier;
        if (tier === 'plus') {
          return {
            coins: base.coins * 2,
            gems: base.gems + (level % 5 === 0 ? 1 : 0),
            powerPoints: base.powerPoints * 2 + 5,
            bling: 10 + (level % 3 === 0 ? 10 : 0),
          };
        }
        if (tier === 'premium') {
          return {
            coins: base.coins * 3,
            gems: base.gems * 2 + (level % 3 === 0 ? 2 : 0),
            powerPoints: base.powerPoints * 3 + 10,
            bling: 25 + (level % 3 === 0 ? 25 : 0),
          };
        }
        return base;
      },

      unlockTier: (tier: 'plus' | 'premium') => {
        set((state) => ({
          tier,
          unlockedTiers: state.unlockedTiers.includes(tier)
            ? state.unlockedTiers
            : [...state.unlockedTiers, tier],
        }));
      },

      switchTier: (tier: 'free' | 'plus' | 'premium') => {
        const { unlockedTiers } = get();
        if (unlockedTiers.includes(tier)) {
          set({ tier });
        }
      },
    }),
    { name: 'german-brawl-brawlpass' }
  )
);
