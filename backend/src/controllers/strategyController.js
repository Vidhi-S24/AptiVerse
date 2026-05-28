import { prisma } from "../lib/prisma.js";

export const getUserStrategy = async (req , res) => {
  const { userId } = req.params;

  try {
    const strategy = await prisma.userStrategy.findUnique({
      where: { userId },
    });

    if (!strategy) {
      return res.json({
        currentStrategy: "PRACTICE",
        weakSubtopics: [],
        nextAction: null
      });
    }

    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI strategy" });
  }
};