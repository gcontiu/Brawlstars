import { useState } from 'react';
import { useEconomyStore } from '../../stores/useEconomyStore';

interface Props {
  onBack: () => void;
}

interface ShopItem {
  id: string;
  icon: string;
  name: string;
  gemPrice: number;
  action: (economy: ReturnType<typeof useEconomyStore.getState>) => void;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coins_50',
    icon: '🪙',
    name: '50 Coins',
    gemPrice: 5,
    action: (e) => e.addCoins(50),
  },
  {
    id: 'coins_200',
    icon: '🪙',
    name: '200 Coins',
    gemPrice: 18,
    action: (e) => e.addCoins(200),
  },
  {
    id: 'pp_20',
    icon: '⚡',
    name: '20 Power Points',
    gemPrice: 8,
    action: (e) => e.addPowerPoints(20),
  },
  {
    id: 'pp_100',
    icon: '⚡',
    name: '100 Power Points',
    gemPrice: 35,
    action: (e) => e.addPowerPoints(100),
  },
  {
    id: 'credits_10',
    icon: '🎫',
    name: '10 Credits',
    gemPrice: 3,
    action: (e) => e.addCredits(10),
  },
];

export function ShopScreen({ onBack }: Props) {
  const economy = useEconomyStore();
  const { gems, spend } = economy;
  const [flashId, setFlashId] = useState<string | null>(null);

  function handleBuy(item: ShopItem) {
    if (gems < item.gemPrice) return;
    const success = spend('gems', item.gemPrice);
    if (success) {
      item.action(useEconomyStore.getState());
      setFlashId(item.id);
      setTimeout(() => setFlashId(null), 900);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-brawl-border">
        <button
          onClick={onBack}
          className="text-2xl text-brawl-yellow active:scale-90 transition-transform leading-none"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Shop</h1>

        {/* Gems display */}
        <div className="ml-auto flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5 border border-purple-500/40">
          <span className="text-lg">💎</span>
          <span className="font-display text-purple-300 text-lg leading-none">{gems}</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const canAfford = gems >= item.gemPrice;
            const isFlashing = flashId === item.id;

            return (
              <div
                key={item.id}
                className={`
                  relative bg-brawl-card border rounded-xl p-4 flex flex-col items-center gap-3
                  transition-all duration-300
                  ${isFlashing
                    ? 'border-brawl-green bg-brawl-green/20 scale-105'
                    : 'border-brawl-border'
                  }
                `}
              >
                {isFlashing && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-brawl-green/30 z-10">
                    <span className="font-display text-white text-lg">✓ Cumpărat!</span>
                  </div>
                )}

                <span className="text-4xl">{item.icon}</span>
                <p className="font-body text-white text-sm text-center font-semibold leading-tight">
                  {item.name}
                </p>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford || isFlashing}
                  className={`
                    w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3
                    font-display text-sm transition-all active:scale-95
                    ${canAfford && !isFlashing
                      ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-md shadow-purple-900/60 border border-purple-400/50'
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                    }
                  `}
                >
                  <span>💎</span>
                  <span>{item.gemPrice}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
