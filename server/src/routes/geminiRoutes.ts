import express, { Request, Response } from "express";
import model from "../services/geminiClient.js"; // Make sure this default export is TS-compatible

const router = express.Router();

/**
 * Utility: Strip Markdown triple backtick formatting and parse JSON
 */
function extractJSON(text: string): any {
  try {
    const stripped = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*?\}/);
      if (match) return JSON.parse(match[0]);

      const arrayMatch = stripped.match(/\[[\s\S]*?\]/);
      if (arrayMatch) return JSON.parse(arrayMatch[0]);
    }

    throw new Error("No valid JSON object found.");
  } catch (err: any) {
    console.error("JSON parsing failed:", err.message);
    throw new Error("Gemini returned invalid or malformed JSON");
  }
}

// POST /gemini/evaluate-mcq
router.post("/evaluate-mcq", async (req: Request, res: Response) => {
  try {
    const userInput = JSON.stringify(req.body, null, 2);
    const prompt = `You are an AI API that answers MCQs in this strict format only:

{
  "correct_letter": "a",
  "correct_choice": "Your Answer Here"
}

Only output strict JSON without markdown code blocks, explanations, or extra text.`;

    const chat = await model.startChat({ history: [] });
    const result = await chat.sendMessage(`${prompt}\n${userInput}`);
    const text = result.response.text();

    const parsed = extractJSON(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Error:", error.message || error);
    res.status(500).json({ error: "Gemini failed to evaluate MCQ" });
  }
});

// POST /gemini/filter-mcq-batch
router.post("/filter-mcq-batch", async (req: Request, res: Response) => {
  try {
    const rawInput: string = req.body.rawText;
    if (!rawInput) {
      return res.status(400).json({ error: "Missing rawText" });
    }

    const prompt = `Extract MCQs from the raw text below and return a JSON array. Format:

[
  { "question": "...", "letters": ["a", "b", "c"], "choices": ["Choice A", "Choice B", "Choice C"] }
]

Only return the raw JSON array with no markdown wrapping.

Text:
"""${rawInput}"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = (extractJSON(text) as any[]).map((item) => {
      const nonEmpty = (item.choices || []).filter((c: string) => c && c.trim());
      const letters = Array.from({ length: nonEmpty.length }, (_, i) =>
        String.fromCharCode(97 + i)
      );
      return { ...item, choices: nonEmpty, letters };
    });

    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Filter Error:", error.message || error);
    res.status(500).json({ error: "Gemini failed to filter MCQs" });
  }
});

export default router;
