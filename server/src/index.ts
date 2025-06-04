import "dotenv/config"; // ✔ Loads `.env` immediately

import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(bodyParser.json());

// Adjust the import paths if you're using ES modules or need to compile `.ts` files
import groqRoutes from "./routes/groqRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

app.use("/groq", groqRoutes);
app.use("/gemini", geminiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
