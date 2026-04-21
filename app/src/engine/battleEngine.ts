import type { VocabWord, MatchType } from '../types';

export type EvalResult = 'correct' | 'almost' | 'wrong';

export function generateBattleSet(
  wordPool: VocabWord[],
  count: number = 10
): Omit<{ word: VocabWord; matchType: MatchType; isRevenge: boolean }, 'playerAnswer' | 'selectedArticle' | 'isCorrect' | 'timeSpent'>[] {
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

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function getTypoTolerance(wordLength: number): number {
  if (wordLength <= 3) return 0;
  if (wordLength <= 6) return 1;
  if (wordLength <= 10) return 2;
  return 3;
}

export function evaluateRound(
  word: VocabWord,
  matchType: MatchType,
  answer: string,
  selectedArticle?: string
): EvalResult {
  const normalized = normalizeAnswer(answer);

  if (matchType === 'DE_TO_RO') {
    // Article (button selection) must always be exact
    const articleCorrect = selectedArticle?.toLowerCase() === word.article;
    if (!articleCorrect) return 'wrong';

    const correctTranslation = normalizeAnswer(word.romanian);

    // Exact match
    if (normalized === correctTranslation) return 'correct';

    // Accepted synonyms (exact match)
    if (word.acceptedAnswers) {
      for (const syn of word.acceptedAnswers) {
        if (normalized === normalizeAnswer(syn)) return 'correct';
      }
    }

    // Levenshtein typo tolerance — applied per token for multi-word phrases
    const correctTokens = correctTranslation.split(' ');
    const inputTokens = normalized.split(' ');
    if (correctTokens.length === inputTokens.length) {
      const allWithinTolerance = correctTokens.every((ct, i) => {
        const tol = getTypoTolerance(ct.length);
        return levenshtein(inputTokens[i], ct) <= tol;
      });
      if (allWithinTolerance) return 'almost';
    } else {
      // Different token count — try full-string Levenshtein
      const tol = getTypoTolerance(correctTranslation.length);
      if (tol > 0 && levenshtein(normalized, correctTranslation) <= tol) return 'almost';
    }

    return 'wrong';
  } else {
    // RO_TO_DE: user types "article word"
    const expectedFull = normalizeAnswer(`${word.article} ${word.german}`);

    // Exact match
    if (normalized === expectedFull) return 'correct';

    // Split to check article separately (article always strict)
    const parts = normalized.split(' ');
    const typedArticle = parts[0];
    const typedWord = parts.slice(1).join(' ');

    if (typedArticle !== word.article) return 'wrong';

    const correctWord = normalizeAnswer(word.german);
    const tol = getTypoTolerance(correctWord.length);
    if (tol > 0 && levenshtein(typedWord, correctWord) <= tol) return 'almost';

    return 'wrong';
  }
}

export const XP_PER_BATTLE = 25;
