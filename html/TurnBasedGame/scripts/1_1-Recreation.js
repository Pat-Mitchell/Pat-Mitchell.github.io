let playerHpElement = document.getElementById("playerHp");      // Text looks like: hp: 35/35
let opponentHpElement = document.getElementById("opponentHp");   // Text looks like: hp: 35/35
let playerLogElement = document.getElementById("playerLog");     // Text looks like: Player hit bear and dealt 4 damage!
let opponentLogElement = document.getElementById("opponentLog"); // Text looks like: Bear bit player for 7 damage!
let resultDiv = document.getElementById("resultDiv");

let playerHp = 35;
let opponentHp = 25;

function turn(action) {
  if(playerHp <= 0 || opponentHp <= 0) return;
  let opponentDamage = Math.floor(Math.random() * 5) + 2;
  opponentLogElement.innerHTML = `Bear bit player for ${opponentDamage} damage`;
  switch(action){
    case "attack":
      let playerDamage = Math.floor(Math.random() * 7) + 3;
      playerLogElement.innerHTML = `Player hit bear and dealt ${playerDamage} damage`;
      playerHp -= opponentDamage;
      opponentHp -= playerDamage;
      break;
    case "defend":
      let playerBlocked = Math.floor(Math.random() * 3) + 2;
      playerLogElement.innerHTML = `Player blocked bear ${playerBlocked} damage`;
      playerHp -= opponentDamage - playerBlocked <= 0 ? 0 : opponentDamage - playerBlocked;
      break;
    case "nothing":
      playerLogElement.innerHTML = `Player just stood there`
      playerHp -= opponentDamage;
      break;
    default:
      console.error("Invalid input");
  }
  playerHpElement.innerHTML = `hp: ${playerHp}/35`
  opponentHpElement.innerHTML = `hp: ${opponentHp}/25`
  if(playerHp <= 0) {
    playerLogElement.innerHTML += ` and falls dead`
    resultDiv.innerHTML = `
      <h1>YOU LOST!!!</h1>
      <p><a href="1_0-Recreation.html">click here to go back</a></p>`;
    resultDiv.style.border = "1px solid #000";
  }
  if(opponentHp <= 0) {
    opponentLogElement.innerHTML += ` and falls dead`;
    resultDiv.innerHTML = `
      <h1>YOU WON!!!</h1>
      <p><a href="1_0-Recreation.html">click here to go back</a></p>`;
    resultDiv.style.border = "1px solid #000";
  }
}
