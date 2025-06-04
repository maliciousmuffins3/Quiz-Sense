import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set in environment variables.");
}

const groq = new Groq({ apiKey });

export default groq;
