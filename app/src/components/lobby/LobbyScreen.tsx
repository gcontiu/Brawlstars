import { usePlayerStore } from '../../stores/usePlayerStore';
import { useEconomyStore } from '../../stores/useEconomyStore';
import { useBrawlPassStore } from '../../stores/useBrawlPassStore';
import { getUnlockedWordCount } from '../../engine/trophyCalculator';

interface Props {
  onPlay: () => void;
  onWords: () => void;
  onShop: () => void;
  onBrawlers: () => void;
  onTrophyRoad: () => void;
  onQuest: () => void;
  onBrawlPass: () => void;
}

export function LobbyScreen({ onPlay, onWords, onShop, onBrawlers, onTrophyRoad, onQuest, onBrawlPass }: Props) {
  const { trophies, xp, brawlerLevel } = usePlayerStore();
  const { coins, gems, bling, powerPoints } = useEconomyStore();
  const unlockedCount = getUnlockedWordCount(trophies);

  const { level: brawlPassLevel, xpInLevel } = useBrawlPassStore();
  const brawlPassProgress = xpInLevel / 100;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818] relative overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-brawl-blue/10 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-brawl-yellow/5 blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-2">
        {/* Trophy Road */}
        <button onClick={onTrophyRoad} className="flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5 border border-brawl-yellow/40 shadow-inner active:scale-95 transition-transform">
          <span className="text-lg">🏆</span>
          <span className="font-display text-brawl-yellow text-lg leading-none">{trophies}</span>
        </button>

        {/* Resources */}
        <div className="flex items-center gap-1.5">
          <ResourcePill icon="🪙" value={coins} color="text-yellow-400" />
          <ResourcePill icon="💎" value={gems} color="text-purple-400" />
          <ResourcePill icon="✨" value={bling} color="text-cyan-400" />
          <ResourcePill icon="⚡" value={powerPoints} color="text-orange-400" />
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative z-10 px-4 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-6 text-right">{brawlerLevel}</span>
          <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all"
              style={{ width: `${Math.min((xp % 1000) / 10, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{xp % 1000}/1000</span>
        </div>
      </div>

      {/* Center — Brawler Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">

        {/* Side buttons LEFT */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          <SideButton icon="🛒" label="Shop" onClick={onShop} />
          <SideButton icon="🎮" label="Brawlers" onClick={onBrawlers} />
        </div>

        {/* Side buttons RIGHT */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          <SideButton icon="📖" label="Cuvinte" onClick={onWords} />
        </div>

        {/* Brawler image + info */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Nivel {brawlerLevel}</p>
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-brawl-yellow/20 blur-xl scale-110" />
            <img
              src="/shelly.webp"
              alt="Shelly"
              className="relative w-48 h-48 object-contain drop-shadow-[0_4px_24px_rgba(247,208,32,0.4)]"
            />
          </div>
          <p className="font-display text-2xl mt-2 text-white tracking-wide drop-shadow-lg">GERMAN BRAWLER</p>
          <p className="text-xs text-gray-400 mt-0.5">{unlockedCount} cuvinte deblocate</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 px-3 pb-5 flex items-end justify-between gap-3">

        {/* Left — Brawl Pass bar + Quest button side by side */}
        <div className="flex items-end gap-2 flex-1">

          {/* Brawl Pass slider bar */}
          <div onClick={onBrawlPass} className="flex-1 bg-black/60 rounded-xl border border-brawl-border px-3 py-2 min-w-0 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-display text-brawl-yellow tracking-wide">BRAWL PASS</span>
              <span className="text-[10px] text-gray-400">Lv {brawlPassLevel}/30</span>
            </div>
            {/* Progress bar with level notches */}
            <div className="relative h-4 bg-black/60 rounded-full border border-brawl-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brawl-yellow to-brawl-orange rounded-full transition-all duration-500"
                style={{ width: `${brawlPassProgress * 100}%` }}
              />
              {/* Notch markers */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-white/20"
                  style={{ left: `${i * 20}%` }}
                />
              ))}
            </div>
            {/* Level labels */}
            <div className="flex justify-between mt-0.5">
              {[0, 1, 2, 3, 4].map((i) => {
                const lvl = Math.floor((brawlPassLevel - 1) / 5) * 5 + i * 1;
                return (
                  <span key={i} className="text-[9px] text-gray-600">{lvl + 1}</span>
                );
              })}
            </div>
          </div>

          {/* Quest button */}
          <button onClick={onQuest} className="flex flex-col items-center gap-0.5 bg-black/60 rounded-xl border border-brawl-border px-3 py-2 active:scale-95 transition-transform flex-shrink-0">
            <span className="text-xl">📋</span>
            <span className="text-[10px] text-gray-300 font-body">Quest</span>
          </button>
        </div>

        {/* Right — PLAY button (rectangular) */}
        <button
          onClick={onPlay}
          className="rounded-2xl bg-gradient-to-b from-brawl-yellow to-brawl-orange
            font-display text-2xl text-black px-8 py-4
            shadow-lg shadow-brawl-orange/60 border-2 border-yellow-300/80
            active:scale-95 transition-transform leading-none
            flex flex-col items-center"
          style={{ minWidth: '96px' }}
        >
          <span className="text-3xl leading-none">▶</span>
          <span className="text-sm mt-0.5">PLAY</span>
        </button>
      </div>
    </div>
  );
}

function ResourcePill({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 text-xs border border-white/5">
      <span>{icon}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function SideButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 bg-black/60 rounded-xl px-3 py-2
        border border-brawl-border active:scale-95 transition-transform shadow-md"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] text-gray-300 font-body">{label}</span>
    </button>
  );
}
