import { useEffect, useState } from "react";
import { fetchProfileReview } from "../services/reviewService";
import {
  saveReview,
  getStoredReview,
  getRemainingCooldown,
  canGenerateReview,
} from "../utils/reviewStorage";

export const useProfileReview = (token: string | null) => {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // load on mount
  useEffect(() => {
    const stored = getStoredReview();

    if (stored) {
      setReview(stored.review);
      setCooldown(getRemainingCooldown());
    }
  }, []);

  // countdown
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const generateReview = async () => {
    if (!token) return;

    if (!canGenerateReview()) {
      setCooldown(getRemainingCooldown());
      return;
    }

    setLoading(true);

    try {
      const reviewText = await fetchProfileReview(token);

      saveReview(reviewText);

      setReview(reviewText);
      setCooldown(15 * 60 * 1000);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return {
    review,
    loading,
    cooldown,
    generateReview,
  };
};