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
  section: string;
  action: (economy: ReturnType<typeof useEconomyStore.getState>) => void;
}

const SHOP_ITEMS: ShopItem[] = [
  // Power Points
  { id: 'pp_20',   icon: '⚡', name: '20 PP',   gemPrice: 8,   section: 'PP',    action: (e) => e.addPowerPoints(20) },
  { id: 'pp_100',  icon: '⚡', name: '100 PP',  gemPrice: 35,  section: 'PP',    action: (e) => e.addPowerPoints(100) },
  { id: 'pp_250',  icon: '⚡', name: '250 PP',  gemPrice: 80,  section: 'PP',    action: (e) => e.addPowerPoints(250) },
  // Coins
  { id: 'coins_50',   icon: '🪙', name: '50 Coins',   gemPrice: 5,   section: 'Coins', action: (e) => e.addCoins(50) },
  { id: 'coins_200',  icon: '🪙', name: '200 Coins',  gemPrice: 18,  section: 'Coins', action: (e) => e.addCoins(200) },
  { id: 'coins_500',  icon: '🪙', name: '500 Coins',  gemPrice: 40,  section: 'Coins', action: (e) => e.addCoins(500) },
  { id: 'coins_1500', icon: '🪙', name: '1500 Coins', gemPrice: 110, section: 'Coins', action: (e) => e.addCoins(1500) },
  // Bling
  { id: 'bling_100', icon: '✨', name: '100 Bling', gemPrice: 25,  section: 'Bling', action: (e) => e.addBling(100) },
  { id: 'bling_500', icon: '✨', name: '500 Bling', gemPrice: 100, section: 'Bling', action: (e) => e.addBling(500) },
  // Credits
  { id: 'credits_10', icon: '🎫', name: '10 Credite', gemPrice: 3, section: 'Credite', action: (e) => e.addCredits(10) },
  { id: 'credits_50', icon: '🎫', name: '50 Credite', gemPrice: 12, section: 'Credite', action: (e) => e.addCredits(50) },
];

const SECTIONS = ['PP', 'Coins', 'Bling', 'Credite'];

export function ShopScreen({ onBack }: Props) {
  const economy = useEconomyStore();
  const { gems, coins, powerPoints, bling, credits, spend } = economy;
  const [flashId, setFlashId] = useState<string | null>(null);

  function handleBuy(item: ShopItem) {
    if (gems < item.gemPrice || flashId) return;
    const success = spend('gems', item.gemPrice);
    if (success) {
      item.action(useEconomyStore.getState());
      setFlashId(item.id);
      setTimeout(() => setFlashId(null), 700);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3 border-b border-brawl-border flex-wrap">
        <button
          onClick={onBack}
          className="text-2xl text-brawl-yellow active:scale-90 transition-transform leading-none mr-1"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Shop</h1>

        {/* Resources top-right */}
        <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
          <ResourceBadge icon="💎" value={gems} color="text-purple-300" />
          <ResourceBadge icon="⚡" value={powerPoints} color="text-orange-300" />
          <ResourceBadge icon="🪙" value={coins} color="text-yellow-300" />
          <ResourceBadge icon="✨" value={bling} color="text-cyan-300" />
          <ResourceBadge icon="🎫" value={credits} color="text-blue-300" />
        </div>
      </div>

      {/* Items grouped by section */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {SECTIONS.map((section) => {
          const items = SHOP_ITEMS.filter((i) => i.section === section);
          return (
            <div key={section}>
              <p className="font-display text-xs text-gray-500 tracking-widest mb-2 uppercase">{section}</p>
              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => {
                  const canAfford = gems >= item.gemPrice;
                  const isFlashing = flashId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-brawl-card border rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300
                        ${isFlashing ? 'border-brawl-green bg-brawl-green/20 scale-105' : 'border-brawl-border'}`}
                    >
                      <span className="text-4xl">{item.icon}</span>
                      <p className="font-body text-white text-sm text-center font-semibold leading-tight">
                        {item.name}
                      </p>

                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford || !!flashId}
                        className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3
                          font-display text-sm transition-all active:scale-95
                          ${canAfford && !flashId
                            ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-md shadow-purple-900/60 border border-purple-400/50'
                            : 'bg-gray-700/50 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                          }`}
                      >
                        <span>💎</span>
                        <span>{item.gemPrice}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceBadge({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5 bg-black/50 rounded-full px-2 py-1 border border-white/10">
      <span className="text-xs">{icon}</span>
      <span className={`font-display text-xs leading-none ${color}`}>{value}</span>
    </div>
  );
}
