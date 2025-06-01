const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create model instance
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-pro",
});

module.exports = model;
