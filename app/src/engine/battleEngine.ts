import type { VocabWord, MatchType, BattleRound } from '../types';

export function generateBattleSet(
  wordPool: VocabWord[],
  count: number = 10
): Omit<BattleRound, 'playerAnswer' | 'selectedArticle' | 'isCorrect' | 'timeSpent'>[] {
  const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((word) => {
    const matchType: MatchType = Math.random() > 0.5 ? 'DE_TO_RO' : 'RO_TO_DE';
    return { word, matchType, isRevenge: false };
  });
}

export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function evaluateRound(
  word: VocabWord,
  matchType: MatchType,
  answer: string,
  selectedArticle?: string
): boolean {
  const normalized = normalizeAnswer(answer);

  if (matchType === 'DE_TO_RO') {
    const correctTranslation = normalizeAnswer(word.romanian);
    const articleCorrect = selectedArticle?.toLowerCase() === word.article;
    const translationCorrect = normalized === correctTranslation;
    return articleCorrect && translationCorrect;
  } else {
    const expectedFull = normalizeAnswer(`${word.article} ${word.german}`);
    return normalized === expectedFull;
  }
}

export const XP_PER_BATTLE = 25;
