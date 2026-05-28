import { prisma } from '../lib/prisma.js';

export const getUserAnalytics = async (userId) => {
  // 1. Fetch data for Radar Chart (Last 50 attempts)
  // We include the question to "hop" to the topicId
  const attempts = await prisma.questionAttempt.findMany({
    where: { userId },
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      question: {
        select: { topicId: true }
      }
    }
  });

  // 2. Fetch data for Trend Line (Last 10 Test Results)
  const lastTests = await prisma.testResult.findMany({
    where: { userId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { accuracy: true, createdAt: true }
  });

  const allTests = await prisma.testResult.findMany({
    where: { userId },
    select: {
      score: true,
      totalQuestions: true,
    },
  });
  const attemptedTests = allTests.length;

  const totalScore = allTests.reduce(
    (sum, t) => sum + (t.score || 0),
    0
  );
  const attemptedQuestions = await prisma.questionAttempt.count({
  where: { userId },
});

  // 3. Process Topic Stats for the Hexagonal Radar Chart
  const topicStats = {};
  attempts.forEach((att) => {
    const topic = att.question.topicId;
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    topicStats[topic].total++;
    if (att.isCorrect) topicStats[topic].correct++;
  });

  // Format the radar data for Chart.js labels/datasets
  const radarData = Object.keys(topicStats).map(topic => ({
    topic: topic,
    score: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100)
  }));



  return {
    attemptedTests,
    attemptedQuestions,
    totalScore,
    radarData,
    testTrend: lastTests.reverse(), // Reverse so the chart goes left-to-right (Old -> New)
    recentHistory: attempts.slice(0, 20).map(a => a.isCorrect) // Rolling 20 accuracy
  };
};

export const updateAILayer = async (userId, quizData) => {
  const { topicId, subtopicId, attempts } = quizData;

  // Calculate metrics from current quiz
  const correct = attempts.filter(a => a.isCorrect).length;
  const quizAccuracy = correct / attempts.length;
  const avgTime = attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length;
  const viewRate = attempts.filter(a => a.viewedSolution).length / attempts.length;

  // Efficient UPSERT into UserMastery
  const mastery = await prisma.userMastery.upsert({
    where: {
      userId_topicId_subtopicId: { userId, topicId, subtopicId }
    },
    update: {
      // Moving average calculation: (OldAcc * OldCount + NewAcc * NewCount) / Total
      accuracy: { set: quizAccuracy },
      totalAttempts: { increment: attempts.length },
      avgTimeSpent: Math.round(avgTime),
      solutionViewRate: viewRate,
      lastAttemptAt: new Date(),
    },
    create: {
      userId,
      topicId,
      subtopicId,
      accuracy: quizAccuracy,
      totalAttempts: attempts.length,
      avgTimeSpent: Math.round(avgTime),
      solutionViewRate: viewRate,
    }
  });

  // 3. Trigger AI Strategy
  // (> 5 attempts)
  if (mastery.totalAttempts >= 5) {
    await generateUserStrategy(userId);
  }
};