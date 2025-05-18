require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 1024;
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 1;
const TOP_P = parseFloat(process.env.TOP_P) || 1;
const FILTER_MODEL = process.env.FILTER_MODEL || "llama3-70b-8192";

// ✅ Enable CORS
app.use(cors());

// JSON parser middleware
app.use(bodyParser.json());

app.post("/evaluate-mcq", async (req, res) => {
  try {
    const userInput = JSON.stringify(req.body, null, 2);

    console.log("================= Evaluate Request ===================");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI API that answers academic multiple-choice questions strictly in JSON format. Your task is to select the most likely correct answer based on available knowledge, even if the question is ambiguous. Do NOT explain your reasoning. Use this strict format:

{
  "correct_letter": "b",
  "correct_choice": "Integrated relational data warehouse architecture"
}

Rules:
- Do NOT include explanations or rephrase the question.
- Always choose the best possible answer. Do not return null values.
- Only return a raw JSON object in the exact format above.`,
        },
        {
          role: "user",
          content:
            '{\n  "question": "What does HTML stand for?",\n  "choices": ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "High Text Machine Language"],\n  "letters": ["a", "b", "c", "d"]\n}',
        },
        {
          role: "assistant",
          content:
            '{\n "correct_letter": "b",\n "correct_choice": "Hyper Text Markup Language"\n}',
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
    console.log("Content: " + userInput);
    const resultText = chatCompletion.choices[0].message.content;
    const parsed = JSON.parse(resultText);
    console.log("AI Response: " + resultText);
    res.json(parsed);
  } catch (error) {
    console.error("Error handling request:", error.message || error);
    res.status(500).json({ error: "Failed to evaluate MCQ" });
  }
});

app.post("/filter-mcq-batch", async (req, res) => {
  try {
    const rawInput = req.body.rawText;
    if (!rawInput) {
      return res.status(400).json({ error: "Missing rawText in request body" });
    }

    console.log("================= Filter Request ===================");
    // Stricter prompt to enforce proper JSON format
    const prompt = `You are a JSON generator. Your task is to extract multiple-choice questions from the input and return them in valid JSON format only.

Each question should follow this schema:
{
  "question": "STRING",
  "letters": ["a", "b", "c", "d"...],
  "choices": ["choice A", "choice B", "choice C", "choice D"...]
}

Return ONLY a valid JSON array of such objects. Do NOT include any extra explanation, markdown, or comments.
REMEMBER just filter the text don't add anything

Input:
"""${rawInput}"""
`;

    const chatCompletion = await groq.chat.completions.create({
      model: FILTER_MODEL,
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content:
            "Question: Instructions: Identify what is being described in the following statements by selecting the correct answer from the given options.\n\n\nBlank 1 Question 1\n \nDot Plot\nHistogram\nStem-and-Leaf Display\nData Visualization\nData Analytics\n It is the ability to understand and analyze the information contained in application software systems.  \n\nBlank 2 Question 1\n \nDot Plot\nHistogram\nStem-and-Leaf Display\nData Visualization\nData Analytics\n  It is a data plot that uses part of a data value as the stem to form groups or classes and part of the data value as the leaf. \n\nBlank 3 Question 1\n \nDot Plot\nHistogram\nStem-and-Leaf Display\nData Visualization\nData Analytics\n  It is the presentation of data in a pictorial or graphical format.\n\nBlank 4 Question 1\n \nDot Plot\nHistogram\nStem-and-Leaf Display\nData Visualization\nData Analytics\n  It is a plot that displays a dot for each value in a data set along a number line.\n\nBlank 5 Question 1\n \nDot Plot\nHistogram\nStem-and-Leaf Display\nData Visualization\nData Analytics\n  It is a graphical display of a frequency or a relative frequency distribution that uses classes and vertical bars (rectangles) of various heights to represent the frequencies.\n\n",
        },
        {
          role: "assistant",
          content:
            '[\n  {\n    "question": "Identify what is being described in the following statements by selecting the correct answer from the given options.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Data Visualization", "Data Analytics", "It is the ability to understand and analyze the information contained in application software systems.", "It is a plot that displays a dot for each value in a data set along a number line.", "It is a graphical display of a frequency or a relative frequency distribution that uses classes and vertical bars (rectangles) of various heights to represent the frequencies."]\n  },\n  {\n    "question": "It is the ability to understand and analyze the information contained in application software systems.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Data Visualization", "Data Analytics", "It is the ability to understand and analyze the information contained in application software systems.", "Data Plot", "Data Display"]\n  },\n  {\n    "question": "It is a data plot that uses part of a data value as the stem to form groups or classes and part of the data value as the leaf.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Histogram", "Dot Plot", "Stem-and-Leaf Display", "Data Visualization", "Data Analytics"]\n  },\n  {\n    "question": "It is the presentation of data in a pictorial or graphical format.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Data Visualization", "Data Analytics", "It is the presentation of data in a pictorial or graphical format.", "Data Plot", "Data Display"]\n  },\n  {\n    "question": "It is a plot that displays a dot for each value in a data set along a number line.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Data Visualization", "Data Analytics", "It is a plot that displays a dot for each value in a data set along a number line.", "Histogram", "Stem-and-Leaf Display"]\n  },\n  {\n    "question": "It is a graphical display of a frequency or a relative frequency distribution that uses classes and vertical bars (rectangles) of various heights to represent the frequencies.",\n    "letters": ["a", "b", "c", "d", "e"],\n    "choices": ["Data Visualization", "Data Analytics", "It is a graphical display of a frequency or a relative frequency distribution that uses classes and vertical bars (rectangles) of various heights to represent the frequencies.", "Dot Plot", "Stem-and-Leaf Display"]\n  }\n]',
        },
        { role: "user", content: rawInput },
      ],
      temperature: 0,
      max_tokens: 8000, // increased to prevent truncation
      top_p: 1,
    });

    const responseText = chatCompletion.choices[0].message.content;
    console.log("AI Response:\n", responseText);

    let parsedArray;
    try {
      // Attempt to parse the response directly
      parsedArray = JSON.parse(responseText);
    } catch (err) {
      console.warn("Initial JSON parse failed. Attempting to recover...");

      // Try to recover valid JSON array using regex
      const jsonMatch = responseText.match(/\[\s*{[\s\S]*?}\s*]/);
      if (jsonMatch) {
        try {
          parsedArray = JSON.parse(jsonMatch[0]);
        } catch (innerErr) {
          console.error("Recovered JSON also invalid:", innerErr.message);
          return res
            .status(500)
            .json({ error: "Failed to parse recovered JSON." });
        }
      } else {
        console.error("No valid JSON array found in AI response.");
        return res
          .status(500)
          .json({ error: "AI response does not contain valid JSON." });
      }
    }

    // Validate structure
    if (
      !Array.isArray(parsedArray) ||
      parsedArray.length === 0 ||
      !parsedArray[0].question
    ) {
      throw new Error("AI response does not contain a valid question array.");
    }

    // === CLEAN UP: Remove blank choices and reset letters dynamically ===
    parsedArray = parsedArray.map((item) => {
      // Validate choices is an array, fallback to empty array if not
      const choices = Array.isArray(item.choices) ? item.choices : [];

      // Remove empty or whitespace-only choices
      const nonEmptyChoices = choices.filter(
        (choice) => typeof choice === "string" && choice.trim() !== ""
      );

      // Generate letters a, b, c, ... based on count of non-empty choices
      const letters = Array.from(
        { length: nonEmptyChoices.length },
        (_, i) => String.fromCharCode(97 + i) // 'a' = 97
      );

      return {
        ...item,
        choices: nonEmptyChoices,
        letters,
      };
    });

    return res.json(parsedArray);
  } catch (error) {
    console.error("Error filtering MCQ batch:", error.message || error);
    return res.status(500).json({ error: "Failed to filter MCQ batch" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
