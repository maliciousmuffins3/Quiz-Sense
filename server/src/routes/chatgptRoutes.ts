import express, { Request, Response } from "express";
import openai from "../services/openaiClient.js"; // Ensure this is TS-compatible or write a type declaration

const router = express.Router();

const CHATGPT_MODEL = process.env.CHATGPT_MODEL || "gpt-4";
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "1024", 10);
const TEMPERATURE = parseFloat(process.env.TEMPERATURE || "0.2");
const TOP_P = parseFloat(process.env.TOP_P || "0.9");

/**
 * POST /groq/evaluate-mcq
 * Evaluate a single MCQ and return strict JSON with correct letter and choice.
 */
router.post("/evaluate-mcq", async (req: Request, res: Response) => {
  try {
    const userInput = JSON.stringify(req.body, null, 2);

    const messages = [
      {
        role: "system" as const,
        content: `You are an AI API that answers academic multiple-choice questions strictly in JSON format like:
{
  "correct_letter": "c",
  "correct_choice": "The correct answer text"
}
Only return JSON.`,
      },
      {
        role: "user" as const,
        content: userInput,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: CHATGPT_MODEL,
      messages,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      top_p: TOP_P,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (error: any) {
    console.error("ChatGPT Evaluate Error:", error.message || error);
    res.status(500).json({ error: "ChatGPT failed to evaluate MCQ" });
  }
});

/**
 * POST /groq/filter-mcq-batch
 * Parse raw text and extract a list of MCQs.
 */
router.post("/filter-mcq-batch", async (req: Request, res: Response) => {
  try {
    const rawInput: string = req.body.rawText;
    if (!rawInput) {
      return res.status(400).json({ error: "Missing rawText" });
    }

    const messages = [
      {
        role: "system" as const,
        content: `Extract MCQs from the given text and return a JSON array like:
[
  {
    "question": "...",
    "letters": ["a", "b", "c", "d"],
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"]
  }
]
Return JSON only, nothing else.`,
      },
      {
        role: "user" as const,
        content: rawInput,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: CHATGPT_MODEL,
      messages,
      temperature: 0,
      max_tokens: 4096,
      top_p: 1,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");

    let parsed = JSON.parse(content) as {
      question: string;
      choices: string[];
      letters?: string[];
    }[];

    parsed = parsed.map((item) => {
      const nonEmpty = (item.choices || []).filter((c) => c && c.trim());
      const letters = Array.from({ length: nonEmpty.length }, (_, i) =>
        String.fromCharCode(97 + i)
      );
      return { ...item, choices: nonEmpty, letters };
    });

    res.json(parsed);
  } catch (error: any) {
    console.error("ChatGPT Filter Error:", error.message || error);
    res.status(500).json({ error: "ChatGPT failed to filter MCQs" });
  }
});

export default router;
