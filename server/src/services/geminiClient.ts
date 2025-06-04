import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const modelId = process.env.GEMINI_MODEL || "gemini-pro";

const genAI = new GoogleGenerativeAI(apiKey);

// Type: GenerativeModel
const model: GenerativeModel = genAI.getGenerativeModel({ model: modelId });

export default model;
