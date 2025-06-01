require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
const groqRoutes = require("./routes/groqRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

app.use("/groq", groqRoutes);
app.use("/gemini", geminiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
