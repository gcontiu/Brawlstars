import { useState } from 'react';
import type { MatchType } from '../../types';

export type GameMode = 'DE_TO_RO' | 'RO_TO_DE' | 'mix';

interface Props {
  onStart: (mode: GameMode) => void;
  onBack: () => void;
  currentMode?: GameMode;
}

interface ModeOption {
  id: GameMode;
  label: string;
  description: string;
  icon: string;
  accentClass: string;
  borderClass: string;
}

const MODES: ModeOption[] = [
  {
    id: 'DE_TO_RO',
    label: 'DE → RO',
    description: 'Citești cuvântul german și scrii traducerea în română.',
    icon: '🇩🇪',
    accentClass: 'from-blue-600 to-blue-800',
    borderClass: 'border-blue-500/70',
  },
  {
    id: 'RO_TO_DE',
    label: 'RO → DE',
    description: 'Citești cuvântul român și scrii germanul cu articol.',
    icon: '🇷🇴',
    accentClass: 'from-red-600 to-yellow-700',
    borderClass: 'border-yellow-500/70',
  },
  {
    id: 'mix',
    label: 'MIX',
    description: 'Ambele direcții aleatoriu — pentru adevărații brawleri!',
    icon: '🔀',
    accentClass: 'from-purple-600 to-pink-700',
    borderClass: 'border-purple-500/70',
  },
];

export function GameModeSelect({ onStart, onBack, currentMode = 'mix' }: Props) {
  const [selected, setSelected] = useState<GameMode>(currentMode);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] via-[#0e0e2a] to-[#080818] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brawl-blue/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 active:text-white transition-colors active:scale-95"
        >
          <span className="text-xl">‹</span>
          <span className="font-body text-sm">Înapoi</span>
        </button>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center px-6 pt-2 pb-6">
        <p className="font-display text-3xl text-white tracking-wide drop-shadow-lg">MOD DE JOC</p>
        <p className="text-sm text-gray-400 mt-1 font-body">Alege cum vrei să lupți!</p>
      </div>

      {/* Mode cards */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 gap-4">
        {MODES.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              className={`relative w-full rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 active:scale-95
                ${isSelected
                  ? `${mode.borderClass} bg-gradient-to-r ${mode.accentClass} shadow-lg`
                  : 'border-brawl-border bg-brawl-card/60'
                }`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <span className="absolute top-3 right-4 text-white text-lg">✓</span>
              )}
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-3xl">{mode.icon}</span>
                <span className={`font-display text-xl tracking-wide ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {mode.label}
                </span>
              </div>
              <p className={`text-xs font-body leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Start button */}
      <div className="relative z-10 px-5 pb-8 pt-4">
        <button
          onClick={() => onStart(selected)}
          className="w-full rounded-2xl bg-gradient-to-b from-brawl-yellow to-brawl-orange
            font-display text-2xl text-black py-4
            shadow-lg shadow-brawl-orange/50 border-2 border-yellow-300/80
            active:scale-95 transition-transform tracking-wide"
        >
          START!
        </button>
      </div>
    </div>
  );
}

// Re-export MatchType alias so callers can convert GameMode → MatchType
export function gameModeToMatchType(mode: GameMode): MatchType | 'mix' {
  return mode;
}
