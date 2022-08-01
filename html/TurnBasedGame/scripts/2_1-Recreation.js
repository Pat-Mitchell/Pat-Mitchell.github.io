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

let selections = [
  document.getElementById("selAtk"),
  document.getElementById("selAoa"),
  document.getElementById("selComAtk"),
  document.getElementById("selDefAtk"),
  document.getElementById("selAod"),
  document.getElementById("selDoNothing"),
];

selections.forEach(e => {
  e.addEventListener("mouseover", function() {
    this.firstChild.innerHTML = "&bull;";
  });
  e.addEventListener("mouseout", function() {
    this.firstChild.innerHTML = "&loz;";
  });
});
