# QuizSense Chrome Extension Setup Guide

## Server Setup

### Prerequisites
- Node.js installed
- A Groq API key

### Step 1: Install Required Packages
```bash
npm install express body-parser cors dotenv groq-sdk @google/generative-ai openai
```

### Step 2: Create .env File
Create a file named `.env` in your project directory with:
```
PORT=3000

# Groq
GROQ_API_KEY=your_groq_key
MODEL=llama3-8b-8192
FILTER_MODEL=llama3-70b-8192

# Gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemma-3-27b-it

# ChatGPT
OPENAI_API_KEY=your_openai_key
CHATGPT_MODEL=gpt-4

# # Optional Shared Config
# MAX_TOKENS=1024
# TEMPERATURE=0.2
# TOP_P=0.9

```

### Step 3: Start the Server
```bash
node index.js
```
You should see: `Server running at http://localhost:3000`

## Chrome Extension Installation

### Step 1: Prepare Your Extension Files

This section provides installation instructions for the Quiz-Sense extension.
It guides users to:
1. Download the zip file from the repository.
2. Extract the contents to a folder of their choice.
3. Ensure the extracted folder contains the following essential files:
   - manifest.json (the extension manifest file)
   - popup.html
   - popup.js
   - content.js
   - an /images directory with icon files
The presence of manifest.json is required for Chrome extensions to function properly.

### Step 2: Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select your extension folder
5. The extension should appear in your extensions list with its icon

### Step 3: Use the Extension
1. Go to the quiz page  
2. Click "Submit" after the automation is done  
