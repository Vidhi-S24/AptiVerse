export interface Question {
  id?: string;
  examId: string;
  yearAsked: number | "";
  topicId: string;
  subtopicId: string;
  questionText: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  solution: string;
}

export type TopicDataMap = {
  [topicName: string]: string[];
};

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  score: number;
}