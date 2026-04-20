import { useState } from 'react';
import { useBrawlPassStore, BRAWL_PASS_REWARDS } from '../../stores/useBrawlPassStore';
import { useEconomyStore } from '../../stores/useEconomyStore';
import type { BrawlPassReward } from '../../stores/useBrawlPassStore';

interface Props {
  onBack: () => void;
  onUnlockTest: (tier: 'plus' | 'premium') => void;
}

export function BrawlPassScreen({ onBack, onUnlockTest }: Props) {
  const bp = useBrawlPassStore();
  const economy = useEconomyStore();
  const [claimedFlash, setClaimedFlash] = useState<number | null>(null);

  function handleClaim(level: number) {
    const reward = bp.claimReward(level);
    if (!reward) return;
    economy.addCoins(reward.coins);
    if (reward.gems > 0) economy.addGems(reward.gems);
    if (reward.powerPoints > 0) economy.addPowerPoints(reward.powerPoints);
    if (reward.bling > 0) economy.addBling(reward.bling);
    setClaimedFlash(level);
    setTimeout(() => setClaimedFlash(null), 800);
  }

  function formatReward(r: BrawlPassReward): string {
    const parts: string[] = [];
    if (r.coins > 0) parts.push(`🪙 ${r.coins}`);
    if (r.powerPoints > 0) parts.push(`⚡ ${r.powerPoints}`);
    if (r.gems > 0) parts.push(`💎 ${r.gems}`);
    if (r.bling > 0) parts.push(`✨ ${r.bling}`);
    return parts.join('  ');
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-brawl-card border border-brawl-border flex items-center justify-center active:scale-95"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl text-brawl-yellow">BRAWL PASS</h1>
          <p className="text-xs text-gray-400">
            Nivel {bp.level}/30 — {bp.xpInLevel}/100 XP
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Tier badges */}
      <div className="flex gap-2 px-4 mb-3">
        <TierBadge label="Free" active={true} color="bg-gray-600" />
        <TierBadge
          label="Plus"
          active={bp.tier === 'plus' || bp.tier === 'premium'}
          color="bg-blue-600"
          locked={bp.tier === 'free'}
          onUnlock={() => onUnlockTest('plus')}
        />
        <TierBadge
          label="Premium"
          active={bp.tier === 'premium'}
          color="bg-purple-600"
          locked={bp.tier !== 'premium'}
          onUnlock={() => onUnlockTest('premium')}
        />
      </div>

      {/* XP progress bar */}
      <div className="px-4 mb-3">
        <div className="h-3 bg-black/60 rounded-full border border-brawl-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brawl-yellow to-brawl-orange rounded-full transition-all"
            style={{ width: `${(bp.xpInLevel / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Levels list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {BRAWL_PASS_REWARDS.map((reward, i) => {
            const level = i + 1;
            const isUnlocked = level <= bp.level;
            const isClaimed = bp.claimedRewards.includes(level);
            const isCurrent = level === bp.level;
            const isFlashing = claimedFlash === level;

            return (
              <div
                key={level}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all ${
                  isFlashing
                    ? 'bg-green-500/20 border-green-500/50'
                    : isCurrent
                      ? 'bg-brawl-yellow/10 border-brawl-yellow/40'
                      : isUnlocked
                        ? 'bg-brawl-card/60 border-brawl-border/50'
                        : 'bg-black/30 border-brawl-border/20 opacity-50'
                }`}
              >
                {/* Level number */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm ${
                  isClaimed ? 'bg-green-600 text-white' :
                  isUnlocked ? 'bg-brawl-yellow text-black' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {isClaimed ? '✓' : level}
                </div>

                {/* Reward info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{formatReward(reward)}</p>
                  {(level === 10 || level === 20 || level === 30) && (
                    <p className="text-[10px] text-brawl-yellow">Milestone Bonus!</p>
                  )}
                </div>

                {/* Claim button */}
                {isUnlocked && !isClaimed && (
                  <button
                    onClick={() => handleClaim(level)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-brawl-green to-green-700
                      font-display text-xs text-white active:scale-95 transition-transform animate-pulse"
                  >
                    CLAIM
                  </button>
                )}

                {!isUnlocked && (
                  <span className="text-gray-600 text-sm">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TierBadge({ label, active, color, locked, onUnlock }: {
  label: string;
  active: boolean;
  color: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  return (
    <button
      onClick={locked ? onUnlock : undefined}
      className={`flex-1 py-1.5 rounded-lg font-display text-xs text-center transition-all ${
        active
          ? `${color} text-white`
          : 'bg-black/40 text-gray-500 border border-brawl-border'
      } ${locked ? 'active:scale-95' : ''}`}
    >
      {locked && '🔒 '}{label}
    </button>
  );
}
