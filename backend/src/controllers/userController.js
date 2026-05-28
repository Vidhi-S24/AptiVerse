import { prisma } from "../lib/prisma.js";
import { getUserAnalytics } from "../services/analyticsService.js";

export const getProfile = async (req, res) => {
  try {
    const { id, email } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: id, email: email },
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error lol", error: error.message });
  }
};

export const getProfileAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; 
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const data = await getUserAnalytics(userId);
    res.json(data);
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

