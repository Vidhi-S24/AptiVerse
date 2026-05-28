import express from "express";
const router = express.Router();
import { isAdmin } from "../middleware/adminAuth.js";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import ImageKit from "@imagekit/nodejs";
import { enrichQuestion } from "../services/enrichmentService.js";


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

router.get("/imagekit-auth", authMiddleware, isAdmin, (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to get ImageKit authentication parameters" });
  }
});

router.post("/addQuestion", authMiddleware, isAdmin, async (req, res) => {
  try {
    const {
      examId,
      topicId,
      subtopicId,
      yearAsked,
      questionText,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      solution,
    } = req.body;

    const question = await prisma.question.create({
      data: {
        examId,
        topicId,
        subtopicId: subtopicId || "GENERAL",
        yearAsked: Number(yearAsked),
        questionText,
        imageUrl,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        solution,
      },
    });

    enrichQuestion(question.id).catch((err) =>
      console.error("Background AI Error:", err),
    );

    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add question" });
  }
});



export default router;
