import { create } from 'zustand';
import type { VocabWord, MatchType, BattlePhase } from '../types';

interface RoundResult {
  word: VocabWord;
  matchType: MatchType;
  isCorrect: boolean;
  isRevenge: boolean;
}

interface BattleStore {
  phase: BattlePhase;
  words: VocabWord[];
  matchTypes: MatchType[];
  currentIndex: number;
  results: RoundResult[];
  revengeQueue: VocabWord[];
  isRevengePart: boolean;

  startBattle: (words: VocabWord[]) => void;
  setPhase: (phase: BattlePhase) => void;
  recordResult: (isCorrect: boolean) => void;
  nextRound: () => boolean;
  startRevenge: () => boolean;
  reset: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  phase: 'idle',
  words: [],
  matchTypes: [],
  currentIndex: 0,
  results: [],
  revengeQueue: [],
  isRevengePart: false,

  startBattle: (words) => {
    const matchTypes = words.map(() =>
      Math.random() > 0.5 ? 'DE_TO_RO' as MatchType : 'RO_TO_DE' as MatchType
    );
    set({
      phase: 'countdown',
      words,
      matchTypes,
      currentIndex: 0,
      results: [],
      revengeQueue: [],
      isRevengePart: false,
    });
  },

  setPhase: (phase) => set({ phase }),

  recordResult: (isCorrect) => {
    const { words, matchTypes, currentIndex, isRevengePart } = get();
    const word = words[currentIndex];
    const matchType = matchTypes[currentIndex];
    const result: RoundResult = { word, matchType, isCorrect, isRevenge: isRevengePart };

    set((s) => ({
      results: [...s.results, result],
      revengeQueue: isCorrect ? s.revengeQueue : [...s.revengeQueue, word],
    }));
  },

  nextRound: () => {
    const { currentIndex, words } = get();
    if (currentIndex + 1 < words.length) {
      set({ currentIndex: currentIndex + 1, phase: 'playing' });
      return true;
    }
    return false;
  },

  startRevenge: () => {
    const { revengeQueue } = get();
    if (revengeQueue.length === 0) return false;
    const matchTypes = revengeQueue.map(() =>
      Math.random() > 0.5 ? 'DE_TO_RO' as MatchType : 'RO_TO_DE' as MatchType
    );
    set({
      words: revengeQueue,
      matchTypes,
      currentIndex: 0,
      revengeQueue: [],
      isRevengePart: true,
      phase: 'playing',
    });
    return true;
  },

  reset: () => set({
    phase: 'idle',
    words: [],
    matchTypes: [],
    currentIndex: 0,
    results: [],
    revengeQueue: [],
    isRevengePart: false,
  }),
}));
