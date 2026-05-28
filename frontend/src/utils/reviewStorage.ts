const STORAGE_KEY = "profile_ai_review";
const COOLDOWN = 15 * 60 * 1000;

export const saveReview = (review: string) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      review,
      timestamp: Date.now(),
      cooldown: COOLDOWN,
    })
  );
};

export const getStoredReview = () => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  return JSON.parse(stored);
};

export const getRemainingCooldown = () => {
  const stored = getStoredReview();

  if (!stored) return 0;

  const elapsed = Date.now() - stored.timestamp;
  const remaining = stored.cooldown - elapsed;

  return remaining > 0 ? remaining : 0;
};

export const canGenerateReview = () => {
  return getRemainingCooldown() === 0;
};