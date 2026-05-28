import { prisma } from "../lib/prisma.js";
import { evaluateUserStrategy } from "../services/aiStrategyService.js";
import { updateUserMastery } from "../services/masteryService.js";
import { generateAiQuestions } from "../services/aiQuestionService.js";

export const fetchQuiz = async (req, res) => {
  const { examName, topicId, subtopicId, limit = 10 } = req.query;
  const queryLimit = parseInt(limit) || 10;

  const isValid = (val) => val && val !== "null" && val !== "undefined";

  try {
    let rawQuestions;
    const hasExam = isValid(examName);
    const hasTopic = isValid(topicId);
    const hasSubtopic = isValid(subtopicId);

    if (hasExam && hasTopic && hasSubtopic) {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      WHERE "exam_id" = ${examName} AND "topic_id" = ${topicId} AND "subtopic_id" = ${subtopicId} 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    } else if (!hasExam && hasTopic && hasSubtopic) {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      WHERE "topic_id" = ${topicId} AND "subtopic_id" = ${subtopicId} 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    } else if (!hasExam && hasTopic) {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      WHERE "topic_id" = ${topicId} 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    } else if (hasExam && hasTopic) {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      WHERE "exam_id" = ${examName} AND "topic_id" = ${topicId} 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    } else if (hasExam) {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      WHERE "exam_id" = ${examName} 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    } else {
      rawQuestions = await prisma.$queryRaw`
      SELECT * FROM "questions" 
      ORDER BY RANDOM() LIMIT ${queryLimit}`;
    }

    const formatted = rawQuestions.map((q) => {
      const correctOptionMap = { A: 0, B: 1, C: 2, D: 3 };
      const dbAnswer = (
        q.correct_answer ||
        q.correctAnswer ||
        "A"
      ).toUpperCase();
      return {
        id: q.id,
        questionText: q.question_text || q.questionText,
        options: [
          q.option_a || q.optionA,
          q.option_b || q.optionB,
          q.option_c || q.optionC,
          q.option_d || q.optionD,
        ],
        correctOption: correctOptionMap[dbAnswer] ?? 0,
        solutionText:
          q.solution || q.solution_text || "Solution not available.",
        year: q.year_asked || q.year || 2026,
        imageUrl: q.image_url || q.imageUrl || null,
        conditions: q.conditions || [],
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Quiz Fetch Error", error);
    res.status(500).json({ message: "Failed to load questions" });
  }
};

export const submitQuiz = async (req, res) => {
  const userId = req.user?.id || req.body.userId;

  const { score, totalQuestions, timeTaken, answers, topicId, subtopicId } = req.body;
  //if question not viewed
  const validAnswers = (answers || []).filter((ans) => {
    return ans.questionId && (ans.selectedOption !== null || ans.viewedSolution);
  });

  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID is missing. Check auth headers." });
  }
  if (timeTaken === undefined || timeTaken === null) {
    return res
      .status(400)
      .json({ error: "timeTaken is required by the schema." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const test = await tx.testResult.create({
        data: {
          userId,
          score: parseInt(score),
          totalQuestions: parseInt(totalQuestions),
          accuracy: totalQuestions ? score / totalQuestions : 0,
          timeTaken: parseInt(timeTaken),
        },
      });

      const savedStaticAttempts = [];
      const aiAttempts = [];

      for (const ans of answers || []) {
        if (ans.isAiGenerated) {
          aiAttempts.push(ans);
          continue;
        }

        const isValid =
          ans.questionId &&
          (ans.selectedOption !== null || ans.viewedSolution);

        if (!isValid) continue;

        const attempt = await tx.questionAttempt.create({
          data: {
            user: { connect: { id: userId } },
            question: { connect: { id: ans.questionId } },
            test: { connect: { id: test.id } },
            isCorrect: !!ans.isCorrect,
            selectedOption: ans.selectedOption ?? null,
            timeSpent: parseInt(ans.timeSpent) || 0,
            viewedSolution: !!ans.viewedSolution,
          },
          include: { question: true },
        });

        savedStaticAttempts.push(attempt);
      }

      return { test, savedStaticAttempts, aiAttempts };
    }, {
      timeout: 5000,
    });

    const staticUpdates = result.savedStaticAttempts.map((att) =>
      updateUserMastery(userId, att.question.topicId, att.question.subtopicId, att)
    );

    const aiUpdates = result.aiAttempts.map((att) =>
      updateUserMastery(userId, topicId, subtopicId, att)
    );
    await Promise.all([...staticUpdates, ...aiUpdates]);


    const updatedStrategy = await evaluateUserStrategy(userId);

    res.status(201).json({
      message: "Quiz analyzed by the Hive!",
      testId: result.test.id,
      score: result.test.score,
    });
  } catch (error) {
    console.error("Quiz Submission Error Details:", error);
    res.status(500).json({
      error: "Failed to save quiz results.",
      details: error.message,
    });
  }
};

export const getRecommendedPath = async (req, res) => {
  const userId = req.user?.id || req.body.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    // Retrieve the latest Strategy generated by the AI
    const strategy = await prisma.userStrategy.findUnique({
      where: { userId }
    });

    if (!strategy || !strategy.nextAction) {
      return res.status(404).json({
        message: "No recommended path found. Take a standard quiz to let the Hive analyze your level!"
      });
    }

    const { topicId, subtopicId, difficulty } = strategy.nextAction;

    // Fetch the IDs of questions solved in the last 30 attempts to ensure variety
    const solvedAttempts = await prisma.questionAttempt.findMany({
      where: { userId },
      select: { questionId: true },
      take: 30,
      orderBy: { createdAt: 'desc' }
    });

    // Filter out nulls and flatten the array
    const excludedIds = solvedAttempts.map(a => a.questionId).filter(Boolean);

    // Try to fetch 15 curated questions from the Database
    const dbQuestions = await prisma.question.findMany({
      where: {
        topicId: topicId,
        subtopicId: subtopicId,
        id: { notIn: excludedIds }
      },
      take: 15
    });

    // Map DB questions to the Frontend Schema
    let finalQuiz = dbQuestions.map((q) => {
      const correctOptionMap = { A: 0, B: 1, C: 2, D: 3 };
      const dbAnswer = (q.correctAnswer || q.correct_answer || "A").toUpperCase();

      return {
        id: q.id,
        questionText: q.questionText || q.question_text,
        options: [
          q.optionA || q.option_a,
          q.optionB || q.option_b,
          q.optionC || q.option_c,
          q.optionD || q.option_d,
        ],
        correctOption: correctOptionMap[dbAnswer] ?? 0,
        solutionText: q.solution || q.solution_text || "Solution not available.",
        year: q.yearAsked || q.year_asked || 2026,
        imageUrl: q.imageUrl || q.image_url || null,
        isAiGenerated: false,
      };
    });

    // Fill the "Gap" if we have fewer than 15 questions
    if (finalQuiz.length < 15) {
      const gapCount = 15 - finalQuiz.length;
      console.log(`Hive Alert: Generating ${gapCount} AI questions for ${subtopicId}`);

      // Call your aiQuestionService
      const aiQuestions = await generateAiQuestions(
        topicId,
        subtopicId,
        gapCount,
        difficulty
      );

      finalQuiz = [...finalQuiz, ...aiQuestions];
    }

    // Return the perfectly mixed 15-question quiz
    res.status(200).json(finalQuiz);

  } catch (error) {
    console.error("Critical Recommended Path Error:", error);
    res.status(500).json({
      error: "Failed to build your personalized path.",
      details: error.message
    });
  }
};