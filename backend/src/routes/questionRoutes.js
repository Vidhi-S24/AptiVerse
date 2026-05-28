import express from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { fetchQuiz, submitQuiz, getRecommendedPath } from "../controllers/quizController.js";

const router = express.Router();

router.get("/quiz", authMiddleware, fetchQuiz);
router.post("/quiz/submit", authMiddleware, submitQuiz);
router.get("/quiz/personalized", authMiddleware, getRecommendedPath); 


export default router;