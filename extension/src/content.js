const { TOGGLE } = require("../src/configs/settings");
const MultipleChoicesAutomation = require("./automations/MultipleChoice");
const IdentificationAutomation = require("./automations/Identification");


// Function to check if the current quiz is an identification quiz.
const isIdentificationQuiz = () => document.querySelector(".que select") !== null;

if(TOGGLE.AUTOMATION){
  isIdentificationQuiz() ? IdentificationAutomation() : MultipleChoicesAutomation();
}
