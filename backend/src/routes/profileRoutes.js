import express from "express";
import { generateProfileReview } from "../controllers/profileReviewController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile-review", authMiddleware, generateProfileReview);

export default router;