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
  setBasicMove(bm)  { this.#basicMove = bs;        }
  getBasicLift()    { return this.#basicLift;      }
  setBasicLift(bl)  { this.#basicLift = bl;        }
}

class Player extends Actor {
  constructor() {
    super();
  }
}

class Opponent extends Actor {
  constructor() {
    super();
  }
}

let maneuverSelections = [
  document.getElementById("selAtk"),
  document.getElementById("selAoa"),
  document.getElementById("selComAtk"),
  document.getElementById("selDefAtk"),
  document.getElementById("selAod"),
  document.getElementById("selDoNothing"),
];

let attackSelections = [
  document.getElementById("selReg"),
  document.getElementById("selFeint"),
  document.getElementById("selDecAtk"),
  document.getElementById("selRapStrk"),
  document.getElementById("selDualStrk"),
  document.getElementById("selExtAtk"),
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

let selectors = document.getElementsByClassName("selection");

for (i = 0; i < selectors.length; i++) {
  selectors[i].addEventListener("mouseover", function() {
    this.firstChild.innerHTML = "&bull;";
  });
  selectors[i].addEventListener("mouseout", function() {
    this.firstChild.innerHTML = "&loz;";
  });
}

maneuverSelections.forEach(e => {
  e.addEventListener("click", function() {
    guiSelectionLegend.innerHTML = "Attack Options";
    maneuversDiv.style.display = "none";
    attackOptionsDiv.style.display = "initial";
  });
});

attackSelections.forEach(e => {
  e.addEventListener("click", function() {
    guiSelectionLegend.innerHTML = "Defensive Options";
    attackOptionsDiv.style.display = "none";
    defensiveOptionsDiv.style.display = "initial";
  });
});

defenseSelections.forEach(e => {
  e.addEventListener("click", function() {
    guiSelectionLegend.innerHTML = "Combat Maneuvers";
    maneuversFieldSet.style.display = "none";
    maneuversDiv.style.display = "initial";
  });
});