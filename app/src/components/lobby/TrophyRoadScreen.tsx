import { usePlayerStore } from '../../stores/usePlayerStore';
import { getCheckpointLevel } from '../../engine/trophyCalculator';
import { vocabulary } from '../../data/vocabulary';

interface Props {
  onBack: () => void;
}

interface Milestone {
  threshold: number;
  newWords: number;
  bonusCoins: number;
  bonusGems: number;
}

function buildMilestones(): Milestone[] {
  const totalWords = vocabulary.length;
  const totalCheckpoints = Math.ceil((totalWords - 25) / 15);
  const milestones: Milestone[] = [];

  for (let i = 0; i <= totalCheckpoints; i++) {
    const threshold = i * 250;
    const newWords = i === 0 ? 25 : 15;
    const bonusCoins = i === 0 ? 0 : (i % 4 === 0 ? 50 : 20);
    const bonusGems = i % 4 === 0 && i > 0 ? 2 : 0;
    milestones.push({ threshold, newWords, bonusCoins, bonusGems });
  }

  return milestones;
}

const MILESTONES = buildMilestones();

export function TrophyRoadScreen({ onBack }: Props) {
  const { trophies } = usePlayerStore();
  const currentCheckpoint = getCheckpointLevel(trophies);

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
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Trophy Road</h1>

        {/* Current trophies */}
        <div className="ml-auto flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5 border border-brawl-yellow/40">
          <span className="text-lg">🏆</span>
          <span className="font-display text-brawl-yellow text-lg leading-none">{trophies}</span>
        </div>
      </div>

      {/* Milestones list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="relative flex flex-col gap-0">
          {/* Vertical track line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-brawl-border z-0" />

          {MILESTONES.map((milestone, idx) => {
            const passed = trophies >= milestone.threshold;
            const isCurrent = idx === currentCheckpoint;
            const isLocked = !passed && !isCurrent;

            return (
              <div
                key={milestone.threshold}
                className={`
                  relative z-10 flex items-start gap-4 py-3 px-3 rounded-xl mb-1 transition-all
                  ${isCurrent ? 'bg-brawl-yellow/10 border border-brawl-yellow/40' : 'border border-transparent'}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold border-2
                    ${passed
                      ? 'bg-brawl-green border-brawl-green text-white'
                      : isCurrent
                      ? 'bg-brawl-yellow border-brawl-yellow text-black animate-pulse'
                      : 'bg-brawl-card border-brawl-border text-gray-600'
                    }
                  `}
                >
                  {passed ? '✓' : isLocked ? '🔒' : '★'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`font-display text-base leading-none ${
                        passed ? 'text-brawl-green' : isCurrent ? 'text-brawl-yellow' : 'text-gray-600'
                      }`}
                    >
                      {milestone.threshold === 0 ? 'Start' : `${milestone.threshold} 🏆`}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-display text-brawl-yellow bg-brawl-yellow/20 px-2 py-0.5 rounded-full">
                        ACUM
                      </span>
                    )}
                  </div>

                  <p
                    className={`font-body text-sm mt-0.5 ${
                      isLocked ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  >
                    +{milestone.newWords} cuvinte noi deblocate
                  </p>

                  {/* Bonus rewards */}
                  {(milestone.bonusCoins > 0 || milestone.bonusGems > 0) && (
                    <div className="flex items-center gap-2 mt-1">
                      {milestone.bonusCoins > 0 && (
                        <span
                          className={`text-xs font-body flex items-center gap-0.5 ${
                            isLocked ? 'text-gray-600' : 'text-yellow-400'
                          }`}
                        >
                          🪙 {milestone.bonusCoins}
                        </span>
                      )}
                      {milestone.bonusGems > 0 && (
                        <span
                          className={`text-xs font-body flex items-center gap-0.5 ${
                            isLocked ? 'text-gray-600' : 'text-purple-400'
                          }`}
                        >
                          💎 {milestone.bonusGems}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress indicator for current */}
                {isCurrent && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-gray-500 font-body">
                      {trophies} / {MILESTONES[idx + 1]?.threshold ?? milestone.threshold}
                    </p>
                    <div className="w-16 h-1.5 bg-black/60 rounded-full mt-1 overflow-hidden border border-brawl-border">
                      <div
                        className="h-full bg-gradient-to-r from-brawl-yellow to-brawl-orange rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            ((trophies - milestone.threshold) /
                              ((MILESTONES[idx + 1]?.threshold ?? milestone.threshold + 250) -
                                milestone.threshold)) *
                              100,
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
