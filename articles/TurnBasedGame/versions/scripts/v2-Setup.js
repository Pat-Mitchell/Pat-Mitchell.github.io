// 2_1_2-Recreation-Setup.js
// Primarily for defining DOM elements are variables.
// Moved into a separate file to cut down on clutter in the main file

let maneuversFieldSet = document.getElementById("maneuversFieldSet");
let maneuversDiv = document.getElementById("maneuversDiv");
let defensiveOptionsDiv = document.getElementById("defensiveOptionsDiv");
let battleLogTxt = document.getElementById("battleLogTxt");
let battleLogFieldSet = document.getElementById("battleLogFieldSet");
let opponentHealthBar = document.getElementById("opponentHealthBar");
let playerHealthBar = document.getElementById("playerHealthBar");
let opponentHealthPoints = document.getElementById("opponentHealthPoints");
let playerHealthPoints = document.getElementById("playerHealthPoints");

let maneuverSelections = [
  document.getElementById("selAtk"),
  document.getElementById("selDoNothing"),
  document.getElementById("selParry"),
  document.getElementById("selBlock"),
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
