// 2_1_2-Recreation-Setup.js
// Primarily for defining DOM elements are variables.
// Moved into a separate file to cut down on clutter in the main file

let maneuversFieldSet = document.getElementById("maneuversFieldSet");
let maneuversDiv = document.getElementById("maneuversDiv");
let battleLogTxt = document.getElementById("battleLogTxt");
let battleLogFieldSet = document.getElementById("battleLogFieldSet");

let maneuverSelections = [
  document.getElementById("selAtk"),
  document.getElementById("selAoa"),
  document.getElementById("selEvaluate"),
  document.getElementById("selFeint"),
  document.getElementById("selAod"),
  document.getElementById("selDoNothing"),
];

let defenseSelections = [
  document.getElementById("selParry"),
  document.getElementById("selCrsParry"),
  document.getElementById("selSuppParry"),
  document.getElementById("selBlock"),
  document.getElementById("selDodge"),
  document.getElementById("selAcroDodge"),
];

let selectors = document.getElementsByClassName("selection");

for (i = 0; i < selectors.length; i++) {
  selectors[i].addEventListener("mouseover", function() {
    this.firstChild.src = "..\\resources\\selected.png";
  });
  selectors[i].addEventListener("mouseout", function() {
    this.firstChild.src = "..\\resources\\unselected.png";
  });
}
