import { useState } from 'react';
import { useQuestStore } from '../../stores/useQuestStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useEconomyStore } from '../../stores/useEconomyStore';

interface Props {
  onClose: () => void;
}

interface BonusResult {
  label: string;
}

function rollBonus(): BonusResult | null {
  if (Math.random() > 1 / 20) return null;
  const bonuses: BonusResult[] = [
    { label: '🎉 Bonus: +5 Gems!' },
    { label: '🎉 Bonus: +50 Coins!' },
    { label: '🎉 Bonus: +10 Power Points!' },
  ];
  return bonuses[Math.floor(Math.random() * bonuses.length)];
}

export function QuestPanel({ onClose }: Props) {
  const { activeQuests, completedQuestIds, claimQuest } = useQuestStore();
  const { addXP } = usePlayerStore();
  const { addGems, addCoins, addPowerPoints } = useEconomyStore();
  const [claimedBonus, setClaimedBonus] = useState<Record<string, string | null>>({});
  const [justClaimed, setJustClaimed] = useState<Set<string>>(new Set());

  function handleClaim(questId: string) {
    const success = claimQuest(questId);
    if (!success) return;

    addXP(500);

    const bonus = rollBonus();
    if (bonus) {
      if (bonus.label.includes('Gems')) addGems(5);
      else if (bonus.label.includes('Coins')) addCoins(50);
      else if (bonus.label.includes('Power Points')) addPowerPoints(10);
    }

    setClaimedBonus((prev) => ({ ...prev, [questId]: bonus?.label ?? null }));
    setJustClaimed((prev) => new Set([...prev, questId]));
  }

  const totalCompleted = completedQuestIds.length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div className="relative w-full bg-gradient-to-b from-[#1a1a3e] to-[#0f0f28] border-t-2 border-brawl-border rounded-t-3xl pb-8 pt-4 px-4 max-h-[85vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-brawl-border rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 className="font-display text-brawl-yellow text-2xl tracking-wide">Quest-uri</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white active:scale-90 transition-all text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full border border-brawl-border"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Quest list */}
        <div className="flex flex-col gap-3 mb-6">
          {activeQuests.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-body text-gray-400 text-sm">
                Nu ai quest-uri active. Revino mai târziu!
              </p>
            </div>
          ) : (
            activeQuests.map((quest) => {
              const isJustClaimed = justClaimed.has(quest.id);
              const bonus = claimedBonus[quest.id];
              const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

              return (
                <div
                  key={quest.id}
                  className={`
                    bg-brawl-card border rounded-xl p-4 flex flex-col gap-3 transition-all
                    ${isJustClaimed
                      ? 'border-brawl-green/60 bg-brawl-green/10'
                      : quest.completed
                      ? 'border-brawl-yellow/50'
                      : 'border-brawl-border'
                    }
                  `}
                >
                  {/* Description + reward */}
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`font-body text-sm leading-snug ${
                        isJustClaimed ? 'text-brawl-green' : 'text-white'
                      }`}
                    >
                      {quest.description}
                    </p>
                    <span className="flex-shrink-0 text-xs font-body text-brawl-yellow bg-brawl-yellow/10 border border-brawl-yellow/30 rounded-full px-2 py-0.5">
                      +{quest.rewardXP} XP
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-body text-gray-400 mb-1">
                      <span>Progres</span>
                      <span>
                        {quest.progress} / {quest.target}
                      </span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-brawl-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.completed || isJustClaimed
                            ? 'bg-gradient-to-r from-brawl-green to-green-400'
                            : 'bg-gradient-to-r from-brawl-blue to-cyan-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Bonus notification */}
                  {isJustClaimed && bonus && (
                    <p className="font-display text-brawl-yellow text-sm text-center animate-bounce">
                      {bonus}
                    </p>
                  )}

                  {/* Claim / status button */}
                  {isJustClaimed ? (
                    <div className="text-center">
                      <span className="font-display text-brawl-green text-sm">
                        ✓ Revendicat!
                      </span>
                    </div>
                  ) : quest.completed ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="w-full py-2.5 rounded-xl font-display text-base bg-brawl-green text-white
                        shadow-md shadow-green-900/60 border border-green-400/50
                        animate-pulse active:scale-95 transition-transform"
                    >
                      CLAIM ★
                    </button>
                  ) : (
                    <div className="text-center">
                      <span className="font-body text-gray-500 text-xs">
                        {quest.target - quest.progress} rămase
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer — total completed */}
        <div className="flex items-center justify-center gap-2 pt-3 border-t border-brawl-border">
          <span className="text-gray-500 font-body text-xs">Quest-uri completate total:</span>
          <span className="font-display text-brawl-yellow text-sm">{totalCompleted}</span>
        </div>
      </div>
    </div>
  );
}
