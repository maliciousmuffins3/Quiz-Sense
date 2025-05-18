# QuizSense Chrome Extension Setup Guide

## Server Setup

### Prerequisites
- Node.js installed
- A Groq API key

### Step 1: Install Required Packages
```bash
npm install express body-parser cors dotenv groq-sdk
```

### Step 2: Create .env File
Create a file named `.env` in your project directory with:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
MODEL=llama3-70b-8192
MAX_TOKENS=1024
TEMPERATURE=1
TOP_P=1
FILTER_MODEL=llama3-70b-8192
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
