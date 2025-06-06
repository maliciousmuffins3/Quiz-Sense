import OpenAI from "openai";

// Validate API key presence
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey });

export default openai;
