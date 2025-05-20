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

module.exports = postWithRetry;