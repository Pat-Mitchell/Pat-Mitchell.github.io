class Actor {
  #strength      // abbrv: ST
  #dexterity     // abbrv: DX
  #intelligence  // abbrv: IQ
  #health        // abbrv: HT
  #hitPoints     // normally equivalent to ST (±2 points per ±1 HP)
  #currentHP
  #will          // normally equivalent to IQ (±5 points per ±1 Will)
  #perception    // normally equivalent to IQ (±5 points per ±1 Perception)
  #fatiguePoints // normally equivalent to HT (±3 points per ±1 FP)
  #currentFP
  #basicSpeed    // normally (HT+DX)/4 (±5 points per ±0.25 Speed)
  #basicMove     // normally Basic Speed less all fractions (±5 points per ±1 yard/second)
  #basicLift     // normally ST*ST / 5
  #name
  constructor() {}
  getST()           { return this.#strength;       }
  setST(st)         { this.#strength = st;         }
  getDX()           { return this.#dexterity;      }
  setDX(dx)         { this.#dexterity = dx;        }
  getIQ()           { return this.#intelligence;   }
  setIQ(iq)         { this.#intelligence = iq;     }
  getHT()           { return this.#health;         }
  setHT(ht)         { this.#health = ht;           }
  getHP()           { return this.#hitPoints;      }
  setHP(hp)         { this.#hitPoints = hp;        }
  getCurrentHP()    { return this.#currentHP;      }
  setCurrentHP(hp)  { this.#currentHP = hp;        }
  getWill()         { return this.#will;           }
  setWill(will)     { this.#will = will;           }
  getPer()          { return this.#perception;     }
  setPer(per)       { this.#perception = per;      }
  getFP()           { return this.#fatiguePoints;  }
  setFP(fp)         { this.#fatiguePoints = fp;    }
  getCurrentFP()    { return this.#currentFP;      }
  setCurrentFP(fp)  { this.#currentFP = fp;        }
  getBasicSpeed()   { return this.#basicSpeed      }
  setBasicSpeed(bs) { this.#basicSpeed = bs;       }
  getBasicMove()    { return this.#basicMove       }
  setBasicMove(bm)  { this.#basicMove = bm;        }
  getBasicLift()    { return this.#basicLift;      }
  setBasicLift(bl)  { this.#basicLift = bl;        }
  getName()         { return this.#name;           }
  setName(nm)       { this.#name = nm              }
}

class Player extends Actor {
  #evaluateBonus = 0 // Bonus from evaluating in combat
  constructor() {
    super();
    this.setST(14);
    this.setDX(11);
    this.setIQ(9);
    this.setHT(11);
    this.setHP(this.getST());
    this.setCurrentHP(this.getHP());
    this.setWill(this.getIQ());
    this.setPer(this.getIQ());
    this.setFP(this.getHT());
    this.setCurrentFP(this.getFP());
    this.setBasicSpeed((this.getHT() + this.getDX()) * 0.25);
    this.setBasicMove(Math.floor(this.getBasicSpeed()));
    this.setBasicLift(this.getST() * this.getST() / 5);
    this.setName("Knight");
  }
  incEvaluate()   { this.#evaluateBonus++;      }
  getEvaluate()   { return this.#evaluateBonus; }
  resetEvaluate() { this.#evaluateBonus = 0;         }

  turn(maneuverChoice) {
    nextTurn = true;
    switch(maneuverChoice) {
      case "Attack":
        this.attack();
        break;
      case "All-Out Attack":
        break;
      case "Evaluate":
        this.evaluate();
        break;
      case "Feint":
        break;
      case "All-Out Defense":
        break;
      case "Do Nothing":
        break;
      default:
        console.error(`Something happened`);
    }
  }

  attack() {
    // Make a weapon skill check
    let dice = [Math.floor(Math.random() * 6 + 1), Math.floor(Math.random() * 6 + 1), Math.floor(Math.random() * 6 + 1)]
    let skillRoll = dice[0]+dice[1]+dice[2]-this.getEvaluate();
    let txt = `${this.getName()} rolled a ${skillRoll}!`;
    if(skillRoll <= 4) txt += `<br>A critical hit!`;
    else if(skillRoll >= 17) txt += `<br>And it missed!`;
    battleLogTxt.innerHTML = txt;
    this.resetEvaluate();
  }

  evaluate() {
    // Give +1 skill for a damaging move on next turn only
    // can stack up to 3 before forced attack
    if(this.getEvaluate() < 3) {
      this.incEvaluate();
      battleLogTxt.innerHTML = `
        ${this.getName()} decided to evaluate the opponent.<br>
        Current bonus is ${this.getEvaluate()}`;
    }
    else this.attack();
  }

}

class Opponent extends Actor {
  constructor() {
    super();
    this.setST(10);
    this.setDX(10);
    this.setIQ(4);
    this.setHT(18);
    this.setHP(this.getST());
    this.setCurrentHP(this.getHP());
    this.setWill(this.getIQ());
    this.setPer(this.getIQ());
    this.setFP(this.getHT());
    this.setCurrentFP(this.getFP());
    this.setBasicSpeed((this.getHT() + this.getDX()) * 0.25);
    this.setBasicMove(Math.floor(this.getBasicSpeed()));
    this.setBasicLift(this.getST() * this.getST() / 5);
  }
}

let knight = new Player();
let bear = new Opponent();

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

let maneuversFieldSet = document.getElementById("maneuversFieldSet");
let maneuversDiv = document.getElementById("maneuversDiv");
let guiSelectionLegend = document.getElementById("guiSelectionLegend");
let battleLogTxt = document.getElementById("battleLogTxt");
let battleLogFieldSet = document.getElementById("battleLogFieldSet");

let selectors = document.getElementsByClassName("selection");

for (i = 0; i < selectors.length; i++) {
  selectors[i].addEventListener("mouseover", function() {
    this.firstChild.src = "..\\resources\\selected.png";
  });
  selectors[i].addEventListener("mouseout", function() {
    this.firstChild.src = "..\\resources\\unselected.png";
  });
}

let selectedManeuvers = [];
let nextTurn = false;

maneuverSelections.forEach(e => {
  e.addEventListener("click", function() {
    guiSelectionLegend.innerHTML = "Attack Options";
    maneuversFieldSet.style.visibility = "hidden";
    maneuversDiv.style.visibility = "hidden";
    knight.turn(e.innerHTML.split('>')[1]);
  });
});

defenseSelections.forEach(e => {
  e.addEventListener("click", function() {
    guiSelectionLegend.innerHTML = "Combat Maneuvers";
    defensiveOptionsDiv.style.visibility = "hidden";
    maneuversFieldSet.style.visibility = "hidden";
    selectedManeuvers.push(e.innerHTML.split('>')[1]);
    turn(selectedManeuvers);
  });
});

battleLogFieldSet.addEventListener("click", function() {
  if(nextTurn) {
    selectedManeuvers = [];
    maneuversFieldSet.style.visibility = "visible";
    maneuversDiv.style.visibility = "visible";
    nextTurn = false;
  }
});
