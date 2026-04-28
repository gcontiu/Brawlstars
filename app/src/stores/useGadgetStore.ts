import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEconomyStore } from './useEconomyStore';

export type GadgetType = 'scula' | 'pacanele' | 'sursis';

export const GADGET_COSTS: Record<GadgetType, number> = {
  scula: 750,
  pacanele: 1250,
  sursis: 1250,
};

export const GADGET_MIN_LEVEL: Record<GadgetType, number> = {
  scula: 7,
  pacanele: 11,
  sursis: 9,
};

export const GADGET_LABELS: Record<GadgetType, string> = {
  scula: 'Scula',
  pacanele: 'Păcănele',
  sursis: 'Sursis',
};

export const GADGET_DESCRIPTIONS: Record<GadgetType, string> = {
  scula: 'Auto-completează articolul. 1× per battle.',
  pacanele: '3 variante de răspuns. 1× per battle.',
  sursis: '+2 min timer. Cooldown 3 cuvinte.',
};

interface GadgetPurchases {
  scula: boolean;
  pacanele: boolean;
  sursis: boolean;
}

const empty = (): GadgetPurchases => ({ scula: false, pacanele: false, sursis: false });

interface GadgetStore {
  purchases: Record<string, GadgetPurchases>;
  buy: (brawlerId: string, gadget: GadgetType) => boolean;
  has: (brawlerId: string, gadget: GadgetType) => boolean;
}

export const useGadgetStore = create<GadgetStore>()(
  persist(
    (set, get) => ({
      purchases: {},

      buy: (brawlerId, gadget) => {
        const current = get().purchases[brawlerId] ?? empty();
        if (current[gadget]) return false;
        const ok = useEconomyStore.getState().spend('coins', GADGET_COSTS[gadget]);
        if (!ok) return false;
        set((s) => ({
          purchases: {
            ...s.purchases,
            [brawlerId]: { ...(s.purchases[brawlerId] ?? empty()), [gadget]: true },
          },
        }));
        return true;
      },

      has: (brawlerId, gadget) => get().purchases[brawlerId]?.[gadget] ?? false,
    }),
    { name: 'german-brawl-gadgets' }
  )
);
