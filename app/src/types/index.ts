export interface VocabWord {
  id: string;
  german: string;
  romanian: string;
  article?: 'der' | 'die' | 'das';
  category: string;
  acceptedAnswers?: string[]; // sinonime acceptate pentru traducerea în română (DE→RO)
}

export interface PlayerState {
  xp: number;
  trophies: number;
  winStreak: number;
  battlesPlayed: number;
}

export interface EconomyState {
  coins: number;
  gems: number;
  bling: number;
  credits: number;
  powerPoints: number;
}

export type MatchType = 'DE_TO_RO' | 'RO_TO_DE';

export interface BattleRound {
  word: VocabWord;
  matchType: MatchType;
  playerAnswer: string;
  selectedArticle?: 'der' | 'die' | 'das';
  isCorrect: boolean;
  timeSpent: number;
  isRevenge: boolean;
}

export type BattlePhase = 'idle' | 'countdown' | 'playing' | 'feedback' | 'revenge' | 'results';

export interface BattleState {
  phase: BattlePhase;
  rounds: BattleRound[];
  currentRoundIndex: number;
  revengeQueue: VocabWord[];
  correctCount: number;
  totalCount: number;
  isRevengePart: boolean;
}

export interface BrawlerDef {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  categories: string[];
  colorClass: string;
  glowColor: string;
  unlockTrophies: number;
  image?: string;
}

export const UPGRADE_COSTS: { level: number; powerPoints: number; coins: number }[] = [
  { level: 2, powerPoints: 20, coins: 50 },
  { level: 3, powerPoints: 30, coins: 100 },
  { level: 4, powerPoints: 50, coins: 150 },
  { level: 5, powerPoints: 80, coins: 290 },
  { level: 6, powerPoints: 130, coins: 480 },
  { level: 7, powerPoints: 210, coins: 800 },
  { level: 8, powerPoints: 340, coins: 1250 },
  { level: 9, powerPoints: 550, coins: 1875 },
  { level: 10, powerPoints: 890, coins: 2800 },
  { level: 11, powerPoints: 1440, coins: 5000 },
];
