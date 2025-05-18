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


async function postWithRetry(
  url,
  data,
  options = {},
  retries = 3,
  delay = 1000
) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      // Prepare the POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Indicating JSON data
          ...options.headers, // Allow custom headers to be passed in options
        },
        body: JSON.stringify(data), // Convert the data to JSON format
        ...options, // Merge additional options like timeouts or custom configurations
      });

      // If the response is OK, parse and return the result as JSON
      if (response.ok) {
        const responseData = await response.json();
        return responseData; // Return the parsed JSON data
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      attempt++;
      console.log(`Attempt ${attempt} failed: ${error.message}`);

      // If we've reached the maximum number of retries, throw the error
      if (attempt >= retries) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }

      // Wait for the specified delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
