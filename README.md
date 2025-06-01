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
GROQ_API_KEY=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
MODEL=llama3-8b-8192
FILTER_MODEL=llama3-70b-8192

# Gemini
GEMINI_API_KEY=AIzaSyCrpebpsamyfgdcw9ql1YiBK1DPl0D3EmE
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
node server.js
```
You should see: `Server running at http://localhost:3000`

## Chrome Extension Installation

### Step 1: Prepare Your Extension Files
1. Create a folder for your extension with these files:
   - `manifest.json`
   - `popup.html`
   - `popup.js` 
   - `content.js`
   - `/images` folder with icon files

### Step 2: Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select your extension folder
5. The extension should appear in your extensions list with its icon

### Step 3: Use the Extension
1. Go to the quiz page  
2. Click "Submit" after the automation is done  
