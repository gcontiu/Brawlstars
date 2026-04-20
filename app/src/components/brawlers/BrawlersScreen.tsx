import { usePlayerStore } from '../../stores/usePlayerStore';
import { useEconomyStore } from '../../stores/useEconomyStore';
import { UPGRADE_COSTS } from '../../types';

interface Props {
  onBack: () => void;
}

const LEVEL_STATS: Record<number, string[]> = {
  1: ['Vocabular de bază: 25 cuvinte', 'Timp per rundă: 12s'],
  2: ['Vocabular extins: 40 cuvinte', 'Timp per rundă: 12s', '+5% XP bonus'],
  3: ['Vocabular: 55 cuvinte', 'Timp per rundă: 11s', '+10% XP bonus'],
  4: ['Vocabular: 70 cuvinte', 'Timp per rundă: 11s', '+15% XP bonus'],
  5: ['Vocabular: 85 cuvinte', 'Timp per rundă: 10s', '+20% XP bonus'],
  6: ['Vocabular: 100 cuvinte', 'Timp per rundă: 10s', '+25% XP bonus', 'Revenge round bonus'],
  7: ['Vocabular: 120 cuvinte', 'Timp per rundă: 9s', '+30% XP bonus', 'Revenge round bonus'],
  8: ['Vocabular: 140 cuvinte', 'Timp per rundă: 9s', '+35% XP bonus', 'Trophy boost x1.2'],
  9: ['Vocabular: 160 cuvinte', 'Timp per rundă: 8s', '+40% XP bonus', 'Trophy boost x1.4'],
  10: ['Vocabular: 200 cuvinte', 'Timp per rundă: 8s', '+50% XP bonus', 'Trophy boost x1.5'],
  11: ['Vocabular complet deblocat', 'Timp per rundă: 7s', '+60% XP bonus', 'Trophy boost x2', 'NIVEL MAXIM'],
};

export function BrawlersScreen({ onBack }: Props) {
  const { brawlerLevel, levelUp } = usePlayerStore();
  const { powerPoints, coins, spend } = useEconomyStore();

  const isMaxLevel = brawlerLevel >= 11;
  const upgradeCost = UPGRADE_COSTS.find((c) => c.level === brawlerLevel + 1);
  const canAfford =
    !isMaxLevel &&
    upgradeCost !== undefined &&
    powerPoints >= upgradeCost.powerPoints &&
    coins >= upgradeCost.coins;

  const progressPercent = ((brawlerLevel - 1) / 10) * 100;
  const stats = LEVEL_STATS[brawlerLevel] ?? [];

  function handleUpgrade() {
    if (!upgradeCost || isMaxLevel) return;
    const ppOk = spend('powerPoints', upgradeCost.powerPoints);
    if (!ppOk) return;
    const coinsOk = spend('coins', upgradeCost.coins);
    if (!coinsOk) {
      // Refund power points if coins failed
      useEconomyStore.getState().addPowerPoints(upgradeCost.powerPoints);
      return;
    }
    levelUp();
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
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Brawlers</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Brawler card */}
        <div className="bg-brawl-card border border-brawl-border rounded-2xl p-5 flex flex-col items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-36 h-36">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#2a2a4a"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#F7D020"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/shelly.webp"
                alt="Shelly"
                className="w-24 h-24 object-contain drop-shadow-[0_2px_12px_rgba(247,208,32,0.5)]"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="font-display text-white text-xl tracking-wide">SHELLY</p>
            <p className="text-brawl-yellow font-body text-sm font-bold">
              Nivel {brawlerLevel}
              {isMaxLevel && <span className="ml-1 text-brawl-orange"> ★ MAX</span>}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-brawl-card border border-brawl-border rounded-xl p-4">
          <p className="font-display text-brawl-yellow text-sm mb-3 tracking-wide">STATISTICI NIVEL {brawlerLevel}</p>
          <ul className="space-y-1.5">
            {stats.map((stat) => (
              <li key={stat} className="flex items-center gap-2 text-sm font-body text-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-brawl-yellow flex-shrink-0" />
                {stat}
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className="flex gap-3">
          <ResourceDisplay icon="⚡" label="Power Points" value={powerPoints} color="text-orange-400" />
          <ResourceDisplay icon="🪙" label="Coins" value={coins} color="text-yellow-400" />
        </div>

        {/* Upgrade section */}
        {!isMaxLevel && upgradeCost ? (
          <div className="bg-brawl-card border border-brawl-border rounded-xl p-4 flex flex-col gap-3">
            <p className="font-display text-white text-sm tracking-wide">
              UPGRADE → NIVEL {brawlerLevel + 1}
            </p>
            <div className="flex gap-4">
              <CostBadge
                icon="⚡"
                label="Power Points"
                required={upgradeCost.powerPoints}
                available={powerPoints}
              />
              <CostBadge
                icon="🪙"
                label="Coins"
                required={upgradeCost.coins}
                available={coins}
              />
            </div>
            <button
              onClick={handleUpgrade}
              disabled={!canAfford}
              className={`
                w-full py-3 rounded-xl font-display text-lg tracking-wide transition-all active:scale-95
                ${canAfford
                  ? 'bg-gradient-to-b from-brawl-yellow to-brawl-orange text-black shadow-lg shadow-brawl-orange/50 border-2 border-yellow-300/80'
                  : 'bg-gray-700/50 text-gray-500 border-2 border-gray-600/30 cursor-not-allowed'
                }
              `}
            >
              {canAfford ? 'UPGRADE!' : 'Resurse insuficiente'}
            </button>
          </div>
        ) : isMaxLevel ? (
          <div className="bg-brawl-green/20 border border-brawl-green/50 rounded-xl p-4 text-center">
            <p className="font-display text-brawl-green text-lg">★ NIVEL MAXIM ATINS ★</p>
            <p className="font-body text-gray-400 text-sm mt-1">Shelly este la putere maximă!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ResourceDisplay({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex-1 bg-brawl-card border border-brawl-border rounded-xl p-3 flex flex-col items-center gap-1">
      <span className="text-2xl">{icon}</span>
      <span className={`font-display text-xl ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-500 font-body text-center">{label}</span>
    </div>
  );
}

function CostBadge({
  icon,
  label,
  required,
  available,
}: {
  icon: string;
  label: string;
  required: number;
  available: number;
}) {
  const enough = available >= required;
  return (
    <div className={`flex-1 rounded-lg p-2.5 border text-center ${enough ? 'border-brawl-green/50 bg-brawl-green/10' : 'border-brawl-red/50 bg-brawl-red/10'}`}>
      <span className="text-lg">{icon}</span>
      <p className={`font-display text-base ${enough ? 'text-brawl-green' : 'text-brawl-red'}`}>
        {required}
      </p>
      <p className="text-[10px] text-gray-500 font-body">{label}</p>
      <p className={`text-[10px] font-body ${enough ? 'text-gray-400' : 'text-brawl-red'}`}>
        ({available} disponibil)
      </p>
    </div>
  );
}
