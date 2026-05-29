import { Type } from "@google/genai";
import { geminiClient } from "../lib/gemini.js";
import { v4 as uuidv4 } from "uuid";

// SIMPLIFIED: Just cleans up "Step X:" prefixes but leaves \n and $math$ perfectly intact
export const formatToKaTeX = (rawText) => {
  if (!rawText) return "";
  return rawText.replace(/Step\s*\d+:?\s*/gi, "").trim();
};

const aiQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description:
              "The question content. Write math expressions wrapped in single dollar signs ($math$). Write English prose normally. NEVER use \\text{} or backslash-escape characters.",
          },
          optionA: { type: Type.STRING, 
            description: "Option A. Wrap math in $ delimiters (e.g., '$x^{a}$')."
          },
          optionB: { type: Type.STRING, 
            description: "Option B. Wrap math in $ delimiters (e.g., '$x^{b}$')."
          },
          optionC: { type: Type.STRING, 
            description: "Option C. Wrap math in $ delimiters (e.g., '$x^{c}$')."
          },
          optionD: { type: Type.STRING, 
            description: "Option D. Wrap math in $ delimiters (e.g., '$x^{d}$')."
          },
          correctAnswer: {
            type: Type.STRING,
            enum: ["A", "B", "C", "D"],
          },
          solution: {
            type: Type.STRING,
            description:
              "Step-by-step solution. Write all math wrapped in single dollar signs ($math$). Use exactly one plain line break (\\n) to separate each logical derivation step.",
          },
          difficultyScore: { type: Type.NUMBER },
        },
        required: [
          "questionText",
          "optionA",
          "optionB",
          "optionC",
          "optionD",
          "correctAnswer",
          "solution",
        ],
      },
    },
  },
  required: ["questions"],
};

export async function generateAiQuestions(
  topicId,
  subtopicId,
  count,
  difficulty,
) {
  const difficultyLabel =
    difficulty > 7
      ? "GATE/CAT/Olympiad level (High Complexity)"
      : difficulty > 4
        ? "High School/University Entrance level"
        : "Standard Competitive level";

  const prompt = `
### ROLE
Expert Professor & Competitive Exam Paper Setter (GATE, CAT, Mathematical Olympiads).

### TASK
Generate ${count} unique ADVANCED aptitude questions.
Topic: ${topicId}
Subtopic: ${subtopicId}
Target Difficulty: ${difficulty}/10 (${difficultyLabel})

### MATHEMATICAL TYPESETTING RULES
1. **Wrappers**: Wrap every single mathematical symbol, variable, or equation in single dollar signs ($...$).
    - CORRECT: "Find the value of $x$."
    - INCORRECT: "Find the value of x."
2. **Standard LaTeX**: Use standard LaTeX for complex structures inside the dollar signs: $\\frac{a}{b}$, $x^{n}$, $\\sqrt{x}$.
3. **Options**: Every single option (A, B, C, D) MUST be wrapped in dollar signs if it contains any variables, numbers, or mathematical symbols.

### STRUCTURAL FORMATTING (CRITICAL)
1. **Flow**: Write English prose and math on the same line if they belong to the same sentence. 
    - CORRECT: "First, calculate the square root of $1225$ to get $35$."
2. **Line Breaks**: Use a **single newline (\\n)** ONLY when you want to start a brand new logical step or a new line in the solution. 
3. **No Decorative Breaks**: Never use symbols like "~", "\\\\", or "::" to separate text from math. Just use a normal space.
4. **Punctuation**: Place periods, colons, and commas OUTSIDE of the math delimiters if they end a sentence or clause.
    - CORRECT: "...the value is $x$. Next step..."

### EXAMPLE SOLUTION FORMAT
solution: "First, convert the logarithmic equation to exponential form:
$x + 3 = 2^{4}$
Simplify the exponent and solve for $x$:
$x + 3 = 16$
$x = 13$
Finally, calculate the required value of $x^{2}$:
$13^{2} = 169$"
`;

  try {
    const result = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: aiQuestionSchema,
      },
    });

    const parsed = JSON.parse(result.text);

    return parsed.questions.map((q) => ({
      ...q,
      questionText: formatToKaTeX(q.questionText),
      solution: formatToKaTeX(q.solution),
      id: uuidv4(),
      topicId,
      subtopicId,
      isAiGenerated: true,
      yearAsked: new Date().getFullYear(),
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correctOption: { A: 0, B: 1, C: 2, D: 3 }[q.correctAnswer] ?? 0,
    }));
  } catch (error) {
    console.error("AI Question Generation Failed:", error);
    return [];
  }
}
