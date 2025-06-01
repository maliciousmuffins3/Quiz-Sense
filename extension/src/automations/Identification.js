const ACTION = require("../configs/action.js");
const { nextButton } = require("../configs/selector.js");
const { DELAY_RANGE, TOGGLE, loadSettings }  = require("../configs/settings.js");
const delay = require("../utils/delay.js");



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
            console.error(
              "Error processing response in extractInfo:",
              responseError
            );
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
                      Math.floor(
                        Math.random() * (DELAY_RANGE.MAX - DELAY_RANGE.MIN + 1)
                      ) + DELAY_RANGE.MIN;
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
                      const optionText = select.options[i].textContent
                        .trim()
                        .toLowerCase();
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

                    if (
                      !matched &&
                      correctLetter &&
                      info.letters &&
                      info.choices
                    ) {
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

                    if (
                      (matched && select.value && select.value !== "") ||
                      attempts >= maxAttempts
                    ) {
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
                    console.error(
                      "Error during tryFill in handleIdentification:",
                      tryFillError
                    );
                    resolve();
                  }
                };

                tryFill();
              } catch (responseError) {
                console.error(
                  "Error processing response in handleIdentification:",
                  responseError
                );
                resolve();
              }
            }
          );
        } catch (sendError) {
          console.error(
            "Error sending message in handleIdentification:",
            sendError
          );
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
  loadSettings();
  console.log("%cIdentification Quiz Type Automation", "color: blue;");
  await handleIdentification();

  if (nextButton) {
    console.log("%cClicking next button.", "color: purple;");
    nextButton.click();
  }
};

module.exports = runIdentificationAutomation;
