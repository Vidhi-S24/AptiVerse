import { Type } from "@google/genai";
import { geminiClient } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";

const strategySchema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.STRING,
      enum: ["REMEDIAL", "PRACTICE", "CHALLENGE", "MAINTENANCE"],
    },
    weakSubtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
    strongSubtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
    nextAction: {
      type: Type.OBJECT,
      properties: {
        topicId: { type: Type.STRING },
        subtopicId: { type: Type.STRING },
        difficulty: { type: Type.NUMBER },
      },
      required: ["topicId", "subtopicId", "difficulty"],
    },
  },
  required: ["strategy", "weakSubtopics", "strongSubtopics", "nextAction"],
};

export async function evaluateUserStrategy(userId) {
  try {
    // Fetch summarized mastery data
    const masteries = await prisma.userMastery.findMany({
      where: { userId },
      select: {
        topicId: true,
        subtopicId: true,
        accuracy: true,
        avgTimeSpent: true,
        behavioralSnapshot: true,
        lastAttemptAt: true,
      },
    });

    if (masteries.length === 0) return null;

    // If user has high accuracy but hasn't practiced in 14 days, force MAINTENANCE
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const needsMaintenance = masteries.some(
      (m) => m.accuracy > 0.8 && m.lastAttemptAt < fourteenDaysAgo,
    );

    // Call AI Coach
    const prompt = `
      As an academic coach, analyze this student's mastery profile:
      ${JSON.stringify(masteries)}
      
      Note: ${needsMaintenance ? "Prioritize a MAINTENANCE strategy for dormant topics." : "Focus on improving accuracy and speed."}
    `;

    const result = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: strategySchema,
      },
    });

    const aiDecision = JSON.parse(result.text);

    // Upsert Strategy
    return await prisma.userStrategy.upsert({
      where: { userId },
      update: {
        currentStrategy: aiDecision.strategy,
        weakSubtopics: aiDecision.weakSubtopics,
        strongSubtopics: aiDecision.strongSubtopics,
        nextAction: aiDecision.nextAction,
      },
      create: {
        userId,
        currentStrategy: aiDecision.strategy,
        weakSubtopics: aiDecision.weakSubtopics,
        strongSubtopics: aiDecision.strongSubtopics,
        nextAction: aiDecision.nextAction,
      },
    });
  } catch (error) {
    console.error("Critical Strategy Service Error:", error);
    return null;
  }
}
