const postWithRetry = require("../src/utils/postRetry");

const ACTION = {
  GET_AI_RESPONSE: "get_response",
  FILTER_TEXT: "filter_text"
};

const backendURL = "http://localhost:3000";

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.action == ACTION.GET_AI_RESPONSE) {
    const contents = req.contents;
    for (const [key, value] of Object.entries(contents)) {
      console.log(`${key}: ${value}`);
    }
    postWithRetry(`${backendURL}/evaluate-mcq`, contents)
      .then((data) => {
        console.log("Data received:", data); // Handle the response data
        res({data})
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  return true;
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.action === ACTION.FILTER_TEXT) {
    const raw = req.contents;
    postWithRetry(`${backendURL}/filter-mcq-batch`, {rawText: raw})
      .then((data) => {
        console.log("Data received:", data);
        res({ data });
      })
      .catch((error) => {
        console.error("Error:", error);
        res({ error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});


