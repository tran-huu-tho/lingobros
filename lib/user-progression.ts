// Utility functions for user progression system

/**
 * Calculate user level based on XP
 * Every 10,000 XP = 1 level
 */
export function calculateLevel(xp: number): { level: number; levelName: string } {
  const level = Math.floor(xp / 10000) + 1;
  
  let levelName = 'Beginner';
  if (level >= 5) levelName = 'Master';
  else if (level >= 4) levelName = 'Expert';
  else if (level >= 3) levelName = 'Advanced';
  else if (level >= 2) levelName = 'Intermediate';
  
  return { level, levelName: levelName.toLowerCase() };
}

/**
 * Check and update streak based on last active date
 * Returns: { streak: number, isNewDay: boolean }
 */
export function calculateStreak(lastActiveAt: Date, currentStreak: number): { streak: number; isNewDay: boolean } {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  
  // Reset time to midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day - no change
    return { streak: currentStreak, isNewDay: false };
  } else if (diffDays === 1) {
    // Next day - increase streak
    return { streak: currentStreak + 1, isNewDay: true };
  } else {
    // Missed days - reset streak
    return { streak: 1, isNewDay: true };
  }
}

/**
 * Heart regeneration logic
 * Hearts regenerate 1 per 30 minutes, max 5
 */
export function calculateHearts(currentHearts: number, lastHeartUpdate: Date): { 
  hearts: number; 
  minutesUntilNext: number;
  lastUpdate: Date;
} {
  if (currentHearts >= 5) {
    return { hearts: 5, minutesUntilNext: 0, lastUpdate: lastHeartUpdate };
  }
  
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastHeartUpdate.getTime()) / (1000 * 60));
  const regenerated = Math.floor(diffMinutes / 30);
  const newHearts = Math.min(currentHearts + regenerated, 5);
  
  // Calculate minutes until next heart
  const minutesUntilNext = newHearts >= 5 ? 0 : 30 - (diffMinutes % 30);
  
  // Update lastHeartUpdate if hearts regenerated
  const newLastUpdate = regenerated > 0 ? now : lastHeartUpdate;
  
  return { 
    hearts: newHearts, 
    minutesUntilNext,
    lastUpdate: newLastUpdate
  };
}

/**
 * Deduct heart when user makes a mistake
 */
export function deductHeart(currentHearts: number): { hearts: number; canContinue: boolean } {
  const newHearts = Math.max(0, currentHearts - 1);
  return {
    hearts: newHearts,
    canContinue: newHearts > 0
  };
}

/**
 * Format time until next heart regeneration
 */
export function formatHeartRegenTime(minutes: number): string {
  if (minutes <= 0) return 'Sẵn sàng';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
}

/**
 * Calculate XP needed for next level
 */
export function getXpForNextLevel(currentXp: number): { current: number; required: number; progress: number } {
  const currentLevel = Math.floor(currentXp / 10000);
  const nextLevelXp = (currentLevel + 1) * 10000;
  const currentLevelXp = currentLevel * 10000;
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
  
  return {
    current: xpInCurrentLevel,
    required: xpNeededForLevel,
    progress: Math.round(progress)
  };
}
