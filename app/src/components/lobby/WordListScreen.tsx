import { usePlayerStore } from '../../stores/usePlayerStore';
import { vocabulary } from '../../data/vocabulary';
import { getUnlockedWordCount } from '../../engine/trophyCalculator';

interface Props {
  onBack: () => void;
}

export function WordListScreen({ onBack }: Props) {
  const { trophies } = usePlayerStore();
  const unlockedCount = getUnlockedWordCount(trophies);
  const unlockedWords = vocabulary.slice(0, unlockedCount);
  const nextCheckpoint = (Math.floor(trophies / 250) + 1) * 250;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a4e] to-[#0a0a1a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-brawl-card border border-brawl-border flex items-center justify-center"
        >
          ←
        </button>
        <div>
          <h1 className="font-display text-xl text-white">Cuvinte Deblocate</h1>
          <p className="text-xs text-gray-400">
            {unlockedWords.length} / {vocabulary.length} — Următorul checkpoint: {nextCheckpoint} 🏆
          </p>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-1.5">
          {unlockedWords.map((word) => (
            <div
              key={word.id}
              className="flex items-center justify-between bg-brawl-card/60 rounded-lg px-3 py-2 border border-brawl-border/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    word.article === 'der'
                      ? 'bg-blue-500/20 text-blue-400'
                      : word.article === 'die'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {word.article}
                </span>
                <span className="text-white text-sm font-bold">{word.german}</span>
              </div>
              <span className="text-gray-400 text-sm">{word.romanian}</span>
            </div>
          ))}
        </div>

        {/* Locked words indicator */}
        {unlockedCount < vocabulary.length && (
          <div className="mt-4 text-center py-6 bg-brawl-card/30 rounded-xl border border-dashed border-brawl-border">
            <span className="text-2xl">🔒</span>
            <p className="text-gray-500 text-sm mt-2">
              Încă {vocabulary.length - unlockedCount} cuvinte de deblocat
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Obține {nextCheckpoint} trofee pentru următoarele 15 cuvinte
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
