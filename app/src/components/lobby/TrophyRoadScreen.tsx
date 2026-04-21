import { usePlayerStore } from '../../stores/usePlayerStore';
import { playTap } from '../../engine/audioEngine';

interface Props {
  onBack: () => void;
}

type RewardType = 'start' | 'coins' | 'pp' | 'gems' | 'bling' | 'legendary';

interface TrophyMilestone {
  threshold: number;
  type: RewardType;
  label: string;
  icon: string;
  color: string;
}

function getRewardAt(threshold: number): Omit<TrophyMilestone, 'threshold'> {
  if (threshold === 0) return { type: 'start', label: 'Start', icon: '🏁', color: 'text-gray-400' };
  if (threshold % 500 === 0) return { type: 'legendary', label: 'Legendary Star Drop', icon: '⭐', color: 'text-brawl-yellow' };
  const cycle = Math.floor(threshold / 50) % 4;
  switch (cycle) {
    case 0: return { type: 'coins',  label: '200 Coins',        icon: '🪙', color: 'text-yellow-400' };
    case 1: return { type: 'pp',     label: '200 Power Points', icon: '⚡', color: 'text-orange-400' };
    case 2: return { type: 'gems',   label: '10 Gems',          icon: '💎', color: 'text-purple-400' };
    case 3: return { type: 'bling',  label: '500 Skin Shards',  icon: '✨', color: 'text-cyan-400' };
    default: return { type: 'coins', label: '200 Coins',        icon: '🪙', color: 'text-yellow-400' };
  }
}

function buildMilestones(upTo: number): TrophyMilestone[] {
  const milestones: TrophyMilestone[] = [];
  for (let t = 0; t <= upTo; t += 50) {
    milestones.push({ threshold: t, ...getRewardAt(t) });
  }
  return milestones;
}

export function TrophyRoadScreen({ onBack }: Props) {
  const { trophies } = usePlayerStore();
  const maxDisplay = Math.max(5000, Math.ceil((trophies + 300) / 500) * 500);
  const milestones = buildMilestones(maxDisplay);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-brawl-border">
        <button onClick={() => { playTap(); onBack(); }}
          className="text-2xl text-brawl-yellow active:scale-90 transition-transform leading-none">←</button>
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Trophy Road</h1>
        <div className="ml-auto flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5 border border-brawl-yellow/40">
          <span className="text-lg">🏆</span>
          <span className="font-display text-brawl-yellow text-lg leading-none">{trophies}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-brawl-border/50 flex gap-3 flex-wrap">
        <span className="text-[10px] text-gray-500 font-body">La fiecare 50 🏆:</span>
        <span className="text-[10px] text-yellow-400">🪙 Coins</span>
        <span className="text-[10px] text-orange-400">⚡ PP</span>
        <span className="text-[10px] text-purple-400">💎 Gems</span>
        <span className="text-[10px] text-cyan-400">✨ Skin Shards</span>
        <span className="text-[10px] text-brawl-yellow">⭐ Legendary (500)</span>
      </div>

      {/* Milestones */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-brawl-border z-0" />

          {milestones.map((m, idx) => {
            const passed = trophies >= m.threshold;
            const isNext = !passed && (idx === 0 || trophies >= milestones[idx - 1].threshold);
            const isLegendary = m.type === 'legendary';

            return (
              <div key={m.threshold}
                className={`relative z-10 flex items-center gap-4 py-2.5 px-3 rounded-xl mb-0.5 transition-all
                  ${isNext ? 'bg-brawl-yellow/10 border border-brawl-yellow/40' : 'border border-transparent'}
                  ${isLegendary && !passed ? 'bg-yellow-900/20 border border-yellow-500/40' : ''}
                `}
              >
                {/* Node */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base border-2
                  ${passed
                    ? 'bg-brawl-green border-brawl-green text-white'
                    : isNext
                    ? 'bg-brawl-yellow border-brawl-yellow text-black animate-pulse'
                    : isLegendary
                    ? 'bg-yellow-900/50 border-yellow-500/60 text-yellow-400'
                    : 'bg-brawl-card border-brawl-border text-gray-600'
                  }`}
                >
                  {passed ? '✓' : m.threshold === 0 ? '🏁' : isNext ? '★' : '🔒'}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-sm ${passed ? 'text-brawl-green' : isNext ? 'text-brawl-yellow' : isLegendary ? 'text-yellow-500' : 'text-gray-600'}`}>
                      {m.threshold === 0 ? 'Start' : `${m.threshold} 🏆`}
                    </span>
                    {isNext && <span className="text-[9px] font-display text-brawl-yellow bg-brawl-yellow/20 px-1.5 py-0.5 rounded-full">URMĂTOR</span>}
                    {isLegendary && <span className="text-[9px] font-display text-yellow-400 bg-yellow-900/40 px-1.5 py-0.5 rounded-full">SPECIAL</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-base">{m.icon}</span>
                    <span className={`font-body text-xs ${passed ? 'text-gray-400' : isNext || isLegendary ? m.color : 'text-gray-600'}`}>
                      {m.label}
                    </span>
                  </div>
                </div>

                {/* Progress for next milestone */}
                {isNext && idx < milestones.length - 1 && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-gray-500 font-body">{trophies} / {milestones[idx + 1]?.threshold}</p>
                    <div className="w-14 h-1.5 bg-black/60 rounded-full mt-1 overflow-hidden border border-brawl-border">
                      <div
                        className="h-full bg-gradient-to-r from-brawl-yellow to-brawl-orange rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            ((trophies - m.threshold) / (milestones[idx + 1].threshold - m.threshold)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
