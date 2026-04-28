import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrawlerStore } from '../../stores/useBrawlerStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useEconomyStore } from '../../stores/useEconomyStore';
import { useGadgetStore, GADGET_COSTS, GADGET_MIN_LEVEL, GADGET_LABELS, GADGET_DESCRIPTIONS, type GadgetType } from '../../stores/useGadgetStore';
import { BRAWLER_DEFS, getBrawlerDef } from '../../data/brawlerDefs';
import { UPGRADE_COSTS } from '../../types';
import { vocabulary } from '../../data/vocabulary';
import { getUnlockedWordCount } from '../../engine/trophyCalculator';
import { playTap, playLevelUp, playUnlock } from '../../engine/audioEngine';
import { analytics } from '../../engine/analytics';

interface Props {
  onBack: () => void;
}

const GADGET_ORDER: GadgetType[] = ['scula', 'sursis', 'pacanele'];

export function BrawlersScreen({ onBack }: Props) {
  const brawlerStore = useBrawlerStore();
  const { trophies: globalTrophies } = usePlayerStore();
  const { powerPoints, coins } = useEconomyStore();
  const gadgetStore = useGadgetStore();
  const [selectedId, setSelectedId] = useState(brawlerStore.activeBrawlerId);

  const selectedDef = getBrawlerDef(selectedId);
  const selectedProgress = brawlerStore.getProgress(selectedId);
  const isUnlocked = globalTrophies >= selectedDef.unlockTrophies;
  const isActive = brawlerStore.activeBrawlerId === selectedId;
  const isMaxLevel = selectedProgress.level >= 11;
  const upgradeCost = UPGRADE_COSTS.find((c) => c.level === selectedProgress.level + 1);
  const canAfford = !isMaxLevel && !!upgradeCost && powerPoints >= upgradeCost.powerPoints && coins >= upgradeCost.coins;

  function handleSelect(id: string) {
    playTap();
    setSelectedId(id);
  }

  function handleSetActive() {
    if (!isUnlocked) return;
    playUnlock();
    brawlerStore.setActive(selectedId);
    onBack();
  }

  function handleUpgrade() {
    if (!isUnlocked || !canAfford) return;
    analytics.upgradeClicked(selectedId, selectedProgress.level);
    const ok = brawlerStore.upgrade(selectedId);
    if (ok) playLevelUp();
  }

  function handleBuyGadget(gadget: GadgetType) {
    playTap();
    gadgetStore.buy(selectedId, gadget);
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-brawl-border">
        <button onClick={() => { playTap(); onBack(); }} className="text-2xl text-brawl-yellow active:scale-90 transition-transform">←</button>
        <h1 className="font-display text-2xl text-brawl-yellow tracking-wide">Brawlers</h1>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-body">🪙 {coins}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Roster grid */}
        <div className="grid grid-cols-3 gap-2 px-4 py-4">
          {BRAWLER_DEFS.map((def) => {
            const unlocked = globalTrophies >= def.unlockTrophies;
            const prog = brawlerStore.getProgress(def.id);
            const isActiveBrawler = brawlerStore.activeBrawlerId === def.id;
            const isSelected = selectedId === def.id;

            return (
              <button
                key={def.id}
                onClick={() => handleSelect(def.id)}
                className={`relative rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 transition-all active:scale-95
                  ${isSelected ? 'border-brawl-yellow bg-brawl-card' : 'border-brawl-border bg-black/30'}
                  ${!unlocked ? 'opacity-50' : ''}
                `}
              >
                {isActiveBrawler && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brawl-green" />
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${unlocked ? '' : 'grayscale'}`}>
                  {def.image ? (
                    <img src={def.image} alt={def.name} className="w-full h-full object-contain" />
                  ) : (
                    <span>{def.emoji}</span>
                  )}
                </div>
                <span className={`font-display text-xs tracking-wide ${def.colorClass}`}>{def.name}</span>
                {unlocked ? (
                  <span className="text-[9px] text-gray-500 font-body">Lv {prog.level}</span>
                ) : (
                  <span className="text-[9px] text-gray-500 font-body">🏆 {def.unlockTrophies}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected brawler detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            className="px-4 pb-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Brawler card — image left, gadgets right */}
            <div className="bg-brawl-card border border-brawl-border rounded-2xl p-4">
              <div className="flex gap-4 items-start">
                {/* Left: image + info + actions */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-2xl"
                    style={{ boxShadow: `0 0 24px ${selectedDef.glowColor}` }}
                  >
                    {selectedDef.image ? (
                      <img src={selectedDef.image} alt={selectedDef.name}
                        className={`w-full h-full object-contain ${!isUnlocked ? 'grayscale opacity-40' : ''}`}
                      />
                    ) : (
                      <span className={!isUnlocked ? 'grayscale opacity-40' : ''}>{selectedDef.emoji}</span>
                    )}
                  </div>

                  <div className="text-center">
                    <p className={`font-display text-base tracking-wide ${selectedDef.colorClass}`}>{selectedDef.name.toUpperCase()}</p>
                    <p className="text-gray-400 text-[10px] font-body">{selectedDef.theme}</p>
                    {isUnlocked ? (
                      <p className="text-gray-300 font-body text-xs mt-0.5">
                        Nv {selectedProgress.level}{isMaxLevel ? ' ★' : ''} · {selectedProgress.trophies} 🏆
                      </p>
                    ) : (
                      <p className="text-brawl-red text-[10px] font-body mt-0.5">
                        🏆 {selectedDef.unlockTrophies} necesare
                      </p>
                    )}
                  </div>

                  {isUnlocked && !isActive && (
                    <button
                      onClick={handleSetActive}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-brawl-yellow to-brawl-orange
                        font-display text-black text-xs active:scale-95 transition-transform border-2 border-yellow-300/80"
                    >
                      SELECTEAZĂ
                    </button>
                  )}
                  {isActive && (
                    <div className="px-4 py-1.5 rounded-xl bg-brawl-green/20 border border-brawl-green/60">
                      <span className="font-display text-brawl-green text-xs">✓ ACTIV</span>
                    </div>
                  )}
                </div>

                {/* Right: gadget buy buttons */}
                <div className="flex-1 flex flex-col gap-2">
                  <p className="font-display text-[10px] text-gray-500 tracking-widest uppercase">Gadgets</p>
                  {GADGET_ORDER.map((gadget) => {
                    const minLvl = GADGET_MIN_LEVEL[gadget];
                    const owned = gadgetStore.has(selectedId, gadget);
                    const levelOk = selectedProgress.level >= minLvl;
                    const canBuy = isUnlocked && levelOk && !owned && coins >= GADGET_COSTS[gadget];

                    return (
                      <div
                        key={gadget}
                        className={`rounded-xl border p-2 flex flex-col gap-1 transition-all
                          ${owned ? 'border-brawl-green/50 bg-brawl-green/10'
                            : levelOk ? 'border-brawl-border bg-black/30'
                            : 'border-gray-700/40 bg-black/20 opacity-60'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs text-white tracking-wide">{GADGET_LABELS[gadget]}</span>
                          {owned ? (
                            <span className="text-brawl-green text-xs font-display">✓</span>
                          ) : levelOk ? (
                            <span className="text-[10px] font-body text-gray-400">🪙 {GADGET_COSTS[gadget]}</span>
                          ) : (
                            <span className="text-[10px] font-body text-gray-500">Lv {minLvl}+</span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-500 font-body leading-tight">{GADGET_DESCRIPTIONS[gadget]}</p>
                        {!owned && levelOk && isUnlocked && (
                          <button
                            onClick={() => handleBuyGadget(gadget)}
                            disabled={!canBuy}
                            className={`mt-0.5 w-full py-1 rounded-lg font-display text-xs transition-all active:scale-95
                              ${canBuy
                                ? 'bg-gradient-to-r from-brawl-yellow to-brawl-orange text-black border border-yellow-300/50'
                                : 'bg-gray-700/50 text-gray-500 border border-gray-600/30 cursor-not-allowed'}`}
                          >
                            {canBuy ? 'CUMPĂRĂ' : 'Insuficient'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upgrade section */}
            {isUnlocked && !isMaxLevel && upgradeCost && (
              <div className="bg-brawl-card border border-brawl-border rounded-xl p-4 flex flex-col gap-3">
                <p className="font-display text-white text-sm tracking-wide">
                  UPGRADE → NIVEL {selectedProgress.level + 1}
                </p>
                <div className="flex gap-3">
                  <CostBadge icon="⚡" label="Power Points" required={upgradeCost.powerPoints} available={powerPoints} />
                  <CostBadge icon="🪙" label="Coins" required={upgradeCost.coins} available={coins} />
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-display text-lg tracking-wide transition-all active:scale-95
                    ${canAfford
                      ? 'bg-gradient-to-b from-brawl-yellow to-brawl-orange text-black shadow-lg shadow-brawl-orange/50 border-2 border-yellow-300/80'
                      : 'bg-gray-700/50 text-gray-500 border-2 border-gray-600/30 cursor-not-allowed'
                    }`}
                >
                  {canAfford ? 'UPGRADE!' : 'Resurse insuficiente'}
                </button>
              </div>
            )}
            {isUnlocked && isMaxLevel && (
              <div className="bg-brawl-green/20 border border-brawl-green/50 rounded-xl p-4 text-center">
                <p className="font-display text-brawl-green text-lg">★ NIVEL MAXIM ATINS ★</p>
              </div>
            )}

            {/* Word list for selected brawler */}
            <BrawlerWordList brawlerId={selectedId} isUnlocked={isUnlocked} colorClass={selectedDef.colorClass} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function BrawlerWordList({ brawlerId, isUnlocked, colorClass }: { brawlerId: string; isUnlocked: boolean; colorClass: string }) {
  const [expanded, setExpanded] = useState(false);
  const brawlerStore = useBrawlerStore();
  const def = getBrawlerDef(brawlerId);
  const brawlerTrophies = brawlerStore.getProgress(brawlerId).trophies;
  const unlockedCount = getUnlockedWordCount(brawlerTrophies);
  const allWords = vocabulary.filter((w) => def.categories.includes(w.category));
  const unlockedWords = allWords.slice(0, Math.min(unlockedCount, allWords.length));
  const nextUnlock = Math.ceil((brawlerTrophies + 1) / 250) * 250;
  const progressToNext = brawlerTrophies % 250;

  return (
    <div className="bg-brawl-card border border-brawl-border rounded-xl overflow-hidden">
      <button
        onClick={() => { playTap(); setExpanded((e) => !e); }}
        className="w-full px-4 py-3 flex items-center justify-between active:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📖</span>
          <span className="font-display text-sm text-white tracking-wide">CUVINTE</span>
          <span className={`text-xs font-body ${colorClass}`}>
            {isUnlocked ? `${unlockedWords.length} / ${allWords.length}` : '🔒'}
          </span>
        </div>
        <span className="text-gray-500 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && isUnlocked && (
        <div className="px-4 pb-4">
          {unlockedWords.length < allWords.length && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-gray-500 font-body mb-1">
                <span>Următor unlock la {nextUnlock} trofee</span>
                <span>{progressToNext} / 250</span>
              </div>
              <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-brawl-border">
                <div
                  className="h-full bg-gradient-to-r from-brawl-yellow to-brawl-orange rounded-full transition-all"
                  style={{ width: `${(progressToNext / 250) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {unlockedWords.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-1 border-b border-brawl-border/30">
                <span className="font-body text-xs text-gray-200">
                  <span className="text-gray-500 mr-1">{w.article}</span>
                  {w.german}
                </span>
                <span className="font-body text-xs text-gray-400">{w.romanian}</span>
              </div>
            ))}
          </div>

          {unlockedWords.length < allWords.length && (
            <p className="text-center text-[10px] text-gray-600 font-body mt-2">
              + {allWords.length - unlockedWords.length} cuvinte blocate
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CostBadge({ icon, label, required, available }: { icon: string; label: string; required: number; available: number }) {
  const enough = available >= required;
  return (
    <div className={`flex-1 rounded-lg p-2.5 border text-center
      ${enough ? 'border-brawl-green/50 bg-brawl-green/10' : 'border-brawl-red/50 bg-brawl-red/10'}`}>
      <span className="text-lg">{icon}</span>
      <p className={`font-display text-base ${enough ? 'text-brawl-green' : 'text-brawl-red'}`}>{required}</p>
      <p className="text-[10px] text-gray-500 font-body">{label}</p>
      <p className={`text-[10px] font-body ${enough ? 'text-gray-400' : 'text-brawl-red'}`}>({available})</p>
    </div>
  );
}
