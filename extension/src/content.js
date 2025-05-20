const { TOGGLE } = require("../src/configs/settings");
const MultipleChoicesAutomation = require("./automations/MultipleChoice");
const IdentificationAutomation = require("./automations/Identification");


// Function to check if the current quiz is an identification quiz.
const isIdentificationQuiz =  document.querySelector(".que select") !== null;
const isUserAnswering = document.querySelector(".qtext") !== null;

if(TOGGLE.AUTOMATION && isUserAnswering){
  isIdentificationQuiz ? IdentificationAutomation() : MultipleChoicesAutomation();
}
