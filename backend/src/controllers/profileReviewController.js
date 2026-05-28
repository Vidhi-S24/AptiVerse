import { geminiClient } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";

export const generateProfileReview = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🔹 Fetching user data...");

    // 1. Fetch mastery data
    const userMastery = await prisma.userMastery.findMany({
      where: { userId },
    });

    // 2. Fetch analytics (reuse existing API)
    const analyticsRes = await fetch(
      "http://localhost:3000/api/users/analytics",
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    if (!analyticsRes.ok) {
      throw new Error("Failed to fetch analytics");
    }

    const analytics = await analyticsRes.json();

    console.log("🔹 Data fetched successfully");

    // 3. Build prompt
    const prompt = `
You are BuzzMaster AI, a smart and supportive aptitude mentor.

You are given a student's performance data from tests, including:
- overall analytics (accuracy, trends, attempts)
- topic-wise mastery

DATA:
Analytics:
${JSON.stringify(analytics)}

Topic Mastery:
${JSON.stringify(userMastery)}

---

TASK:
Generate a concise performance review.

FORMAT RULES (VERY IMPORTANT):
- Do NOT use markdown (no **, no ###, no emojis in headings)
- Keep output clean, simple, and readable
- Use only plain text
- Use short paragraphs or numbered points
- Avoid unnecessary decoration

STRUCTURE:

**Strengths:**
Write 2–3 lines highlighting what the student is doing well.

(leave one blank line)

**Weakness:**
Identify ONE clear pattern or issue based on the data.

(leave one blank line)

**Actionable Tip:**
Give ONE specific and practical suggestion for improvement.

---

STYLE:
- Friendly but professional
- Light bee-themed tone allowed (max 1 subtle reference)
- Keep it crisp and to the point
- Maximum 120–150 words

Now generate the review : Keep it concise, motivating, slightly bee-themed, max 200 words..
`;

    console.log("🔹 Calling Gemini...");

    // 4. Generate review
    const result = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", 
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // 5. Safe extraction (IMPORTANT)
    const reviewText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No review generated";

    console.log("Review generated");

    return res.json({ review: reviewText });

  } catch (error) {
    console.error(" Profile Review Error:", error);

    return res.status(500).json({
      error: "Failed to generate profile review",
    });
  }
};