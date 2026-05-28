import { prisma } from "../lib/prisma.js";

export async function updateUserMastery(
  userId,
  topicId,
  subtopicId,
  attemptData,
) {
  const { isCorrect, timeSpent, viewedSolution } = attemptData;

  const currentMastery = await prisma.userMastery.findUnique({
    where: {
      userId_topicId_subtopicId: {
        userId,
        topicId,
        subtopicId: subtopicId ?? "",
      },
    },
  });

  const isFirstAttempt = !currentMastery;
  const newTotal = (currentMastery?.totalAttempts || 0) + 1;

  // Stats calculations
  const oldAccuracy = currentMastery?.accuracy || 0;
  const newAccuracy = isFirstAttempt
    ? isCorrect
      ? 1
      : 0
    : (oldAccuracy * (newTotal - 1) + (isCorrect ? 1 : 0)) / newTotal;

  const oldAvgTime = currentMastery?.avgTimeSpent || 0;
  const newAvgTime = isFirstAttempt
    ? timeSpent
    : (oldAvgTime * (newTotal - 1) + timeSpent) / newTotal;

  const oldViewRate = currentMastery?.solutionViewRate || 0;
  const newViewRate = isFirstAttempt
    ? viewedSolution
      ? 1
      : 0
    : (oldViewRate * (newTotal - 1) + (viewedSolution ? 1 : 0)) / newTotal;

  let history = currentMastery?.behavioralSnapshot?.history || [];
  history.push({
    c: isCorrect,
    t: timeSpent,
    s: viewedSolution,
    date: new Date().toISOString(),
  });

  if (history.length > 10) history.shift();

  return await prisma.userMastery.upsert({
    where: {
      userId_topicId_subtopicId: {
        userId,
        topicId,
        subtopicId: subtopicId ?? "",
      },
    },
    update: {
      accuracy: newAccuracy,
      avgTimeSpent: Math.round(newAvgTime),
      totalAttempts: newTotal,
      solutionViewRate: newViewRate,
      behavioralSnapshot: {
        history,
        trend: calculateTrend(history),
        lastRush: timeSpent < 15,
      },
      lastAttemptAt: new Date(),
    },
    create: {
      userId,
      topicId,
      subtopicId: subtopicId ?? "",
      accuracy: isCorrect ? 1 : 0,
      avgTimeSpent: timeSpent,
      totalAttempts: 1,
      solutionViewRate: viewedSolution ? 1 : 0,
      behavioralSnapshot: { history, trend: "stable" },
    },
  });
}

function calculateTrend(history) {
  if (!history || history.length < 4) return "stable";

  const mid = Math.floor(history.length / 2);
  const olderHalf = history.slice(0, mid);
  const recentHalf = history.slice(mid);

  const olderAccuracy = olderHalf.filter((h) => h.c).length / olderHalf.length;
  const recentAccuracy =
    recentHalf.filter((h) => h.c).length / recentHalf.length;

  if (recentAccuracy > olderAccuracy + 0.1) return "improving";
  if (recentAccuracy < olderAccuracy - 0.1) return "declining";
  return "stable";
}