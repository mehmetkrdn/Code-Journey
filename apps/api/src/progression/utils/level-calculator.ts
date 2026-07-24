export const XP_PER_LEVEL = 100;

export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) {
    return 1;
  }

  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(totalXp: number) {
  const level = calculateLevel(totalXp);

  const currentLevelStartXp =
    (level - 1) * XP_PER_LEVEL;

  const nextLevelXp =
    level * XP_PER_LEVEL;

  const currentLevelXp =
    totalXp - currentLevelStartXp;

  return {
    level,
    totalXp,
    currentLevelXp,
    xpRequiredForNextLevel: XP_PER_LEVEL,
    nextLevelXp,
  };
}

//İlk sistemde her 100 XP bir seviye olacak: İleride değiştirilebilir buradan.