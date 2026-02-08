// src/utils/streakLogic.js
export const checkStreakStatus = (lastPostDate) => {
  if (!lastPostDate) return "START_WRITING";
  
  const today = new Date().setHours(0,0,0,0);
  const last = new Date(lastPostDate.seconds * 1000).setHours(0,0,0,0);
  const diffInDays = (today - last) / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) return "STREAK_ACTIVE";
  if (diffInDays === 1) return "STREAK_MAINTAINED";
  
  return "STREAK_BROKEN_BRUTAL"; // The brutal state
};