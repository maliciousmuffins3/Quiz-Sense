import express, { Request, Response } from "express";
import groq from "../services/groqClient.js"; // You may need to add type support for this client

const router = express.Router();

const MODEL = process.env.MODEL!;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "1024", 10);
const TEMPERATURE = parseFloat(process.env.TEMPERATURE || "0.2");
const TOP_P = parseFloat(process.env.TOP_P || "0.9");
const FILTER_MODEL = process.env.FILTER_MODEL || "llama3-70b-8192";

interface McqRequest {
  question: string;
  choices: string[];
  letters: string[];
}

interface McqResponse {
  correct_letter: string;
  correct_choice: string;
}

interface McqBatchItem {
  question: string;
  choices: string[];
  letters?: string[];
}

router.post("/evaluate-mcq", async (req: Request, res: Response) => {
  try {
    const userInput = JSON.stringify(req.body, null, 2);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI API that answers academic multiple-choice questions strictly in JSON format...`,
        },
        {
          role: "user",
          content:
            '{ "question": "What does HTML stand for?", "choices": [...], "letters": [...] }',
        },
        {
          role: "assistant",
          content:
            '{ "correct_letter": "b", "correct_choice": "Hyper Text Markup Language" }',
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      model: MODEL,
      temperature: TEMPERATURE,
      max_completion_tokens: MAX_TOKENS,
      top_p: TOP_P,
      stream: false,
    });

    const resultText = chatCompletion.choices[0].message.content;
    const parsed: McqResponse = JSON.parse(resultText);
    res.json(parsed);
  } catch (error: any) {
    console.error("GROQ Error:", error.message || error);
    res.status(500).json({ error: "GROQ failed to evaluate MCQ" });
  }
});

router.post("/filter-mcq-batch", async (req: Request, res: Response) => {
  try {
    const rawInput: string = req.body.rawText;
    if (!rawInput) {
      return res.status(400).json({ error: "Missing rawText" });
    }

    const prompt = `You are a JSON parser...`;

    const chatCompletion = await groq.chat.completions.create({
      model: FILTER_MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: rawInput },
      ],
      temperature: 0,
      max_tokens: 8000,
      top_p: 1,
    });

    const responseText = chatCompletion.choices[0].message.content;
    const parsed: McqBatchItem[] = JSON.parse(responseText);

    const cleaned = parsed.map((item) => {
      const nonEmpty = (item.choices || []).filter((c) => c && c.trim());
      const letters = Array.from(
        { length: nonEmpty.length },
        (_, i) => String.fromCharCode(97 + i) // 'a', 'b', 'c', ...
      );
      return { ...item, choices: nonEmpty, letters };
    });

    res.json(cleaned);
  } catch (error: any) {
    console.error("GROQ Filter Error:", error.message || error);
    res.status(500).json({ error: "GROQ failed to filter MCQs" });
  }
});

export default router;
