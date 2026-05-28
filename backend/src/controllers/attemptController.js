import { updateUserMastery } from "../services/masteryService";

export const submitAttempt = async (req, res) => {
  const newAttempt = await prisma.questionAttempt.create({
    data: { ...req.body }
  });

  res.status(201).json({ 
    isCorrect: newAttempt.isCorrect, 
    solution: "..." 
  });

  updateUserMastery(newAttempt.userId, newAttempt.id)
    .catch(err => console.error("Mastery Update Failed:", err));
};