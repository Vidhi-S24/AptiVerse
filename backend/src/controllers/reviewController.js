import { geminiClient } from "../lib/gemini.js";
import { evaluateUserStrategy } from "../services/aiStrategyService.js";

export const generatePersonalizedReview = async (req, res) => {
  const { userId } = req.params;
  const { quizSessionData } = req.body;
  const prompt = `
You are "BuzzMaster AI", an encouraging tutor inside the AptiVerse ecosystem 🐝.

A student has just completed a quiz. Their performance analytics are:

${JSON.stringify(quizSessionData)}

---

## 🎯 TASK
Write a personalized performance review in 2 short paragraphs + 1 actionable tip.

The review should help the student improve, while keeping the tone friendly, motivating, and lightly humorous with subtle hive/bee-themed expressions.

---

## 🧠 STRUCTURE

### 1. Strengths
- Highlight what the student did well based on the data
- Be specific and encouraging
- You may include light humor (e.g., “your accuracy is buzzing in the right direction”) but keep it minimal

### 2. Improvement Insight
- Identify ONE key weakness pattern from the data
- Examples: speed issues, accuracy drops, topic confusion, careless mistakes
- Explain clearly and constructively

### 3. Actionable Tip
- Give ONE clear, practical improvement step
- Must be specific and usable in the next session

---

## 🎨 TONE GUIDELINES
- Friendly tutor tone (primary)
- Light humor occasionally using bee/hive words like buzz, hive, nectar, pollen, swarm
- Do NOT overuse bee metaphors (max 1–2 per section)
- Avoid sounding childish or overly themed
- Keep it natural, like a smart mentor who sometimes cracks light jokes

---

## ⚡ OUTPUT RULES
- Use Markdown formatting
- Maximum 200–250 words
- Exactly 3 sections only
- No extra commentary or headings beyond required structure

---

Now generate the review.
`;

  try {
    const updatedStrategy = await evaluateUserStrategy(userId);

    const result = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      config: {
        responseMimeType: "text/plain",
      },
    });

    res
      .status(200)
      .json({
        review: result.text || "The Hive is a bit quiet right now, but you did great!",
        strategy: updatedStrategy?.currentStrategy || "PRACTICE",
        recommendations: updatedStrategy?.nextAction || null,
        weakSubtopics: updatedStrategy?.weakSubtopics || [],
      });

  } catch (error) {
    console.error("AI Review Generation Error:", error);
    res.status(500).json({ error: "Failed to generate AI review" });
  }
};