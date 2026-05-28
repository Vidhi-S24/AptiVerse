import express from "express";
const router = express.Router();
import { getProfile, getProfileAnalytics } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";
import { generatePersonalizedReview } from "../controllers/reviewController.js";
import { getUserStrategy } from "../controllers/strategyController.js";

router.get("/profile", authMiddleware, getProfile);
router.get('/analytics', authMiddleware, getProfileAnalytics);
router.get('/strategy/:userId', authMiddleware, getUserStrategy);
router.post("/review/:userId", authMiddleware, generatePersonalizedReview);

export default router;
