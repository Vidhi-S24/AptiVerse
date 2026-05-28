// query.ts
// export const getRadarData = async (userId: string) => {
//   const attempts = await prisma.questionAttempt.findMany({
//     where: { userId },
//     take: 50, // "Rolling window" for fresh data
//     orderBy: { createdAt: 'desc' },
//     include: {
//       question: {
//         select: {
//           topicId: true, // This is your string like "Algebra"
//         }
//       }
//     }
//   });

//   // Transform data for the Radar Chart
//   const stats: = {};

//   attempts.forEach((att) => {
//     const topic = att.question.topicId;
//     if (!stats[topic]) stats[topic] = { correct: 0, total: 0 };
    
//     stats[topic].total += 1;
//     if (att.isCorrect) stats[topic].correct += 1;
//   });

//   // Format for Frontend (e.g., Chart.js)
//   return Object.keys(stats).map(topic => ({
//     topic,
//     percentage: Math.round((stats[topic].correct / stats[topic].total) * 100)
//   }));
// };


// export const getRadarData = async (userId) => {
//   const attempts = await prisma.questionAttempt.findMany({
//     where: { userId },
//     take: 50, // "Rolling window" for fresh data
//     orderBy: { createdAt: 'desc' },
//     include: {
//       question: {
//         select: {
//           topicId: true, // This is your string like "Algebra"
//         },
//       },
//     },
//   });

//   // Transform data for the Radar Chart
//   const stats = {};

//   attempts.forEach((att) => {
//     const topic = att.question.topicId;

//     if (!stats[topic]) {
//       stats[topic] = { correct: 0, total: 0 };
//     }

//     stats[topic].total += 1;

//     if (att.isCorrect) {
//       stats[topic].correct += 1;
//     }
//   });

//   // Format for Frontend (e.g., Chart.js)
//   return Object.keys(stats).map((topic) => ({
//     topic,
//     percentage: Math.round(
//       (stats[topic].correct / stats[topic].total) * 100
//     ),
//   }));
// };