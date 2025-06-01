const { DELAY_RANGE, TOGGLE, loadSettings }  = require("../src/configs/settings");
const MultipleChoicesAutomation = require("./automations/MultipleChoice");
const IdentificationAutomation = require("./automations/Identification");


loadSettings().then(() => {
  console.log("%cMin Delay:%c " + DELAY_RANGE.MIN, "color: green;", "color: white;");
  console.log("%cAutomation Enabled:%c " + TOGGLE.AUTOMATION, "color: green;", "color: white;");
});

// Function to check if the current quiz is an identification quiz.
const isIdentificationQuiz =  document.querySelector(".que select") !== null;
const isUserAnswering = document.querySelector(".qtext") !== null;

if(TOGGLE.AUTOMATION && isUserAnswering){
  isIdentificationQuiz ? IdentificationAutomation() : MultipleChoicesAutomation();
}
