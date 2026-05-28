import { Type } from "@google/genai";
import { geminiClient } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";

const metaSchema = {
  type: Type.OBJECT,
  properties: {
    difficulty: { type: Type.NUMBER, description: "Scale 0.1 to 1.0" },
    estimatedTime: { type: Type.NUMBER, description: "Seconds to solve" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Max 3 tags" }
  },
  required: ["difficulty", "estimatedTime", "tags"]
};

export const enrichQuestion = async (questionId) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) return;

    const prompt = `
      Analyze this academic question for difficulty and timing:
      Text: ${question.questionText}
      Topic: ${question.topicId}
      Solution: ${question.solution}
    `;

    const result = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: metaSchema
      }
    });

    const aiData = JSON.parse(result.text);

    await prisma.aiQuestionMeta.upsert({
      where: { questionId },
      update: {
        difficulty: aiData.difficulty,
        estimatedTime: aiData.estimatedTime,
        tags: aiData.tags,
      },
      create: {
        questionId,
        difficulty: aiData.difficulty,
        estimatedTime: aiData.estimatedTime,
        tags: aiData.tags,
        isAiGenerated: false 
      }
    });

    console.log(`Metadata generated for question ${questionId}`);
  } catch (error) {
    console.error(`Enrichment failed for ${questionId}:`, error.message);
  }
};