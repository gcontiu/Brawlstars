export function calculateTrophies(successRate: number, winStreak: number): number {
  let base: number;
  if (successRate > 50) {
    base = Math.floor(successRate / 10);
  } else if (successRate < 50) {
    base = -Math.ceil((100 - successRate) / 10);
  } else {
    base = 0;
  }
  const streakBonus = Math.min(winStreak, 10);
  return base + streakBonus;
}

export function getCheckpointLevel(trophies: number): number {
  return Math.floor(trophies / 250);
}

export function getUnlockedWordCount(trophies: number): number {
  const checkpoints = getCheckpointLevel(trophies);
  return Math.min(25 + checkpoints * 15, Infinity);
}
