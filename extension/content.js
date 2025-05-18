// Define action types for communication with the background script.
const ACTION = {
  GET_AI_RESPONSE: "get_response",
  FILTER_TEXT: "filter_text"
};

const DELAY_RANGE = {
  MIN: 1300,
  MAX: 1800
}

const TOGGLE = {
  AUTOMATION: true,
}

chrome.storage.sync.get(["minDelay", "maxDelay", "automationEnabled"], (data) => {
    DELAY_RANGE.MIN = data.minDelay ?? 1300;
    DELAY_RANGE.MAX = data.maxDelay ?? 1800;
    TOGGLE.AUTOMATION = data.automationEnabled ?? false;
});

// Select all containers for quiz questions and the next button.
const containers = document.querySelectorAll(".formulation.clearfix");
const nextButton = document.querySelector("#mod_quiz-next-nav");

// Asynchronous function to introduce a delay.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to extract content (question, letters, choices) from a question container.
const getContent = (Elements) => {
  const Content = {
    question: Elements.questionElements?.innerText.trim(),
    letters: [],
    choices: [],
  };

  // Extract letter options if they exist.
  if (Elements.letters) {
    Elements.letters.forEach((element) => {
      const str = element.innerText;
      const character = str.replace(/\./g, "").trim().toLowerCase();
      Content.letters.push(character);
    });
  }

  // Extract choice text if they exist.
  if (Elements.choices) {
    Elements.choices.forEach((element) => {
      const text = element.innerText.trim();
      Content.choices.push(text);
    });
  }

  return Content;
};

// Function to fill in the correct answer for multiple-choice questions.
const fillUp = (radioButtons, data) => {
  // If no data is provided, exit.
  if (!data) return false;

  // Extract the correct letter and calculate its index.
  const correctL = data.correct_letter?.toUpperCase();
  const index = correctL?.charCodeAt(0) - "A".charCodeAt(0);

  // Click the correct radio button if it exists and the index is valid.
  if (radioButtons && index >= 0) {
    radioButtons[index]?.click();
  }

  // Return true if any radio button is checked.
  return Array.from(radioButtons).some((button) => button.checked);
};

// Asynchronous function to handle a single multiple-choice question container.
const handleContainer = (container) => {
  return new Promise((resolve) => {
    try {
      const Elements = {
        questionElements: container.querySelector(".qtext"),
        letters: container.querySelectorAll(".answernumber"),
        choices: container.querySelectorAll(".flex-fill.ml-1"),
        radioButtons: container.querySelectorAll('input[type="radio"]'),
      };

      if (!Elements.questionElements) return resolve();

      const contents = getContent(Elements);

      chrome.runtime.sendMessage(
        { action: ACTION.GET_AI_RESPONSE, contents },
        (response) => {
          try {
            const data = response?.data || {};
            let attempts = 0;
            const maxAttempts = 10;

            const tryFill = async () => {
              try {
                const randomDelay =
                  Math.floor(Math.random() * (DELAY_RANGE.MAX - DELAY_RANGE.MIN + 1)) + DELAY_RANGE.MIN;
                console.log(
                  `%cWaiting ${randomDelay} milliseconds before clicking next...`,
                  "color: orange;"
                );
                await delay(randomDelay);
                const filled = fillUp(Elements.radioButtons, data);
                if (filled || attempts >= maxAttempts) {
                  return resolve();
                }
                attempts++;
                setTimeout(tryFill, 100);
              } catch (fillError) {
                console.error("Error during tryFill in handleContainer:", fillError);
                resolve();
              }
            };

            tryFill();
          } catch (responseError) {
            console.error("Error processing response in handleContainer:", responseError);
            resolve();
          }
        }
      );
    } catch (outerError) {
      console.error("Error in handleContainer:", outerError);
      resolve();
    }
  });
};

// Asynchronous function to run the automation for multiple-choice quizzes.
const runMultipleChoicesAutomation = async () => {
  console.log("%cMultiple Choice Quiz Type Automation", "color: blue;");
  const promises = Array.from(containers).map(handleContainer);
  await Promise.all(promises);

  if (nextButton) {
    console.log("%cClicking next button.", "color: purple;");
    nextButton.click();
  }
};

// Function to extract information from identification quiz questions (dropdowns).
function extractInfo() {
  return new Promise((resolve) => {
    try {
      const dataToExtract = document.querySelector(".qtext");
      if (!dataToExtract) return resolve([]);
      console.log(dataToExtract.innerText.trim());
      chrome.runtime.sendMessage(
        {
          action: ACTION.FILTER_TEXT,
          contents: dataToExtract.innerText,
        },
        (response) => {
          try {
            const infoBundle = response?.data || [];
            resolve(infoBundle);
          } catch (responseError) {
            console.error("Error processing response in extractInfo:", responseError);
            resolve([]);
          }
        }
      );
    } catch (outerError) {
      console.error("Error in extractInfo:", outerError);
      resolve([]);
    }
  });
}

async function handleIdentification() {
  console.log("%cStarting handleIdentification...", "color: limegreen;");
  try {
    const infoBundle = await extractInfo();
    console.log("%cExtracted infoBundle:", "color: lightblue;", infoBundle);

    const selectElements = document.querySelectorAll("select");

    for (const [index, info] of infoBundle.entries()) {
      const Content = {
        question: info.question,
        letters: info.letters,
        choices: info.choices,
      };

      console.log("%cProcessing infoBundle item:", "color: yellow;", Content);

      await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(
            { action: ACTION.GET_AI_RESPONSE, contents: Content },
            (response) => {
              try {
                const data = response?.data || {};
                const correctChoice = data.correct_choice?.trim().toLowerCase();
                const correctLetter = data.correct_letter?.trim().toLowerCase();
                let attempts = 0;
                const maxAttempts = 10;

                const tryFill = async () => {
                  try {
                    const randomDelay =
                      Math.floor(Math.random() * (DELAY_RANGE.MAX - DELAY_RANGE.MIN + 1)) + DELAY_RANGE.MIN;
                    console.log(
                      `%cWaiting ${randomDelay} ms before attempting to fill...`,
                      "color: orange;"
                    );
                    await delay(randomDelay);

                    const select = selectElements[index];
                    if (!select) {
                      console.warn(
                        `%cSelect element not found at index ${index}.`,
                        "color: red;"
                      );
                      return resolve();
                    }

                    let matched = false;

                    for (let i = 0; i < select.options.length; i++) {
                      const optionText = select.options[i].textContent.trim().toLowerCase();
                      if (optionText.includes(correctChoice)) {
                        select.selectedIndex = i;
                        matched = true;
                        console.log(
                          `%cSelected by choice: ${correctChoice}`,
                          "color: lightgreen;"
                        );
                        break;
                      }
                    }

                    if (!matched && correctLetter && info.letters && info.choices) {
                      const idx = info.letters.findIndex(
                        (l) => l.trim().toLowerCase() === correctLetter
                      );
                      if (idx !== -1 && idx < select.options.length) {
                        select.selectedIndex = idx;
                        matched = true;
                        console.log(
                          `%cFallback selected by letter: ${correctLetter}`,
                          "color: deepskyblue;"
                        );
                      }
                    }

                    if ((matched && select.value && select.value !== "") || attempts >= maxAttempts) {
                      if (!select.value || select.value === "") {
                        console.warn(
                          `%cWarning: select at index ${index} has no valid value even after ${attempts} attempts`,
                          "color: red;"
                        );
                      }
                      return resolve();
                    }

                    attempts++;
                    setTimeout(tryFill, 100);
                  } catch (tryFillError) {
                    console.error("Error during tryFill in handleIdentification:", tryFillError);
                    resolve();
                  }
                };

                tryFill();
              } catch (responseError) {
                console.error("Error processing response in handleIdentification:", responseError);
                resolve();
              }
            }
          );
        } catch (sendError) {
          console.error("Error sending message in handleIdentification:", sendError);
          resolve();
        }
      });

      console.log("%cFinished processing item.", "color: limegreen;");
    }
  } catch (outerError) {
    console.error("Error in handleIdentification:", outerError);
  }
}

// Asynchronous function to run the automation for identification quizzes.
const runIdentificationAutomation = async () => {
  console.log("%cIdentification Quiz Type Automation", "color: blue;");
  await handleIdentification();

  if (nextButton) {
    console.log("%cClicking next button.", "color: purple;");
    nextButton.click();
  }
};

// Function to check if the current quiz is an identification quiz.
function isIdentificationQuiz() {
  return document.querySelector(".que select") !== null;
}

// Determine the quiz type and run the appropriate automation.
if(TOGGLE.AUTOMATION){
  if (isIdentificationQuiz()) {
  runIdentificationAutomation();
} else {
  runMultipleChoicesAutomation();
}
}
