import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import { Question } from "../types/quiz.types";

export const fetchQuizQuestions = async (params: {
  examName: string;
  topicId: string | null;
  subtopicId: string | null;
}): Promise<Question[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const response = await axios.get(`${API_URL}/api/questions/quiz`, {
    params: { ...params, limit: 15 },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });

  return response.data.map((q: any, i: number) => ({
    id: q.id,
    number: i + 1,
    text: q.questionText,
    year: q.year || 0,
    conditions: q.conditions || [],
    imageUrl: q.imageUrl || null,
    options: q.options || [],
    solution: q.solution || q.solutionText,
    correctOption: q.correctOption,
  }));
};