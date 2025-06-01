const ACTION = require("../configs/action.js");
const { nextButton, containers } = require("../configs/selector.js");
const { DELAY_RANGE, TOGGLE, loadSettings }  = require("../configs/settings.js");
const delay = require("../utils/delay.js");




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
  loadSettings();
  console.log("%cMultiple Choice Quiz Type Automation", "color: blue;");
  const promises = Array.from(containers).map(handleContainer);
  await Promise.all(promises);

  if (nextButton) {
    console.log("%cClicking next button.", "color: purple;");
    nextButton.click();
  }
};

module.exports = runMultipleChoicesAutomation