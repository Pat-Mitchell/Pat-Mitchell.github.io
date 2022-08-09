// 2_1_1-Recreation-Actors.js
// js file to house the actor classes
// Cuts down the clutter in the main js file

class Actor extends BaseGameEntity{
  #stateMachine = new StateMachine(this);
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
  constructor()          { super();                                         }
  getST()                { return this.#strength;                           }
  setST(st)              { this.#strength = st;                             }
  getDX()                { return this.#dexterity;                          }
  setDX(dx)              { this.#dexterity = dx;                            }
  getIQ()                { return this.#intelligence;                       }
  setIQ(iq)              { this.#intelligence = iq;                         }
  getHT()                { return this.#health;                             }
  setHT(ht)              { this.#health = ht;                               }
  getHP()                { return this.#hitPoints;                          }
  setHP(hp)              { this.#hitPoints = hp;                            }
  getCurrentHP()         { return this.#currentHP;                          }
  setCurrentHP(hp)       { this.#currentHP = hp;                            }
  getWill()              { return this.#will;                               }
  setWill(will)          { this.#will = will;                               }
  getPer()               { return this.#perception;                         }
  setPer(per)            { this.#perception = per;                          }
  getFP()                { return this.#fatiguePoints;                      }
  setFP(fp)              { this.#fatiguePoints = fp;                        }
  getCurrentFP()         { return this.#currentFP;                          }
  setCurrentFP(fp)       { this.#currentFP = fp;                            }
  getBasicSpeed()        { return this.#basicSpeed                          }
  setBasicSpeed(bs)      { this.#basicSpeed = bs;                           }
  getBasicMove()         { return this.#basicMove                           }
  setBasicMove(bm)       { this.#basicMove = bm;                            }
  getBasicLift()         { return this.#basicLift;                          }
  setBasicLift(bl)       { this.#basicLift = bl;                            }
  getName()              { return this.#name;                               }
  setName(nm)            { this.#name = nm                                  }
  getStateMachine()      { return this.#stateMachine;                       }
  update()               { this.#stateMachine.update();                     }
  changeState(newState)  { this.#stateMachine.changeState(newState);        }
  getFSM()               { return this.#stateMachine;                       }
  name()                 { return this.#name;                               }
  handleMessage(msg)  	 { return this.#stateMachine.handleMessage(msg);    }
}

class Player extends Actor {
  #evaluateBonus = 0 // Bonus from evaluating in combat
  #skillSword = 3;
  #skillBlock = 2;
  #skillDodge = 1;
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
    this.getStateMachine().setCurrentState();
    this.getStateMachine().setGlobalState();
  }
  incEvaluate()   { this.#evaluateBonus++;      }
  getEvaluate()   { return this.#evaluateBonus; }
  resetEvaluate() { this.#evaluateBonus = 0;    }
}

class Opponent extends Actor {
  #skillUnarmed = 3;
  #skillBlock = 1;
  #skillDodge = 0;
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
    this.setName("Bear");
  }
}

class MenuMngr extends BaseGameEntity {
  #stateMachine = new StateMachine(this);
  #messageQueue = [];
  #ElementToWriteTo;
  constructor(e) {
    super();
    this.#ElementToWriteTo = e;
    this.#stateMachine.setCurrentState(null);
    this.#stateMachine.setGlobalState(new MenuMngrGlobalState());
  }
  getStateMachine()      { return this.#stateMachine;                       }
  update()               { this.#stateMachine.update();                     }
  changeState(newState)  { this.#stateMachine.changeState(newState);        }
  getFSM()               { return this.#stateMachine;                       }
  handleMessage(msg)  	 { return this.#stateMachine.handleMessage(msg);    }
  getMessageQueue()      { return this.#messageQueue;                       }
  getTarget()            { return this.#ElementToWriteTo;                   }
}

class PlayerAttackMenu extends State {
  constructor() {
    super();
    if(!PlayerAttackMenu._instance) {
      PlayerAttackMenu._instance = this;
    }
  }
  enter(menu) {
    maneuversFieldSet.style.visibility = "visible";
    maneuversDiv.style.visibility = "visible";
  }
  execute(menu) {}
  exit(menu) {
    maneuversFieldSet.style.visibility = "hidden";
    maneuversDiv.style.visibility = "hidden";
  }
  onMessage(menu, msg) { return false; }
}

class WriteToLog extends State {
  constructor() {
    super();
    if(!WriteToLog._instance) {
      WriteToLog._instance = this;
    }
  }
  enter(menu) {
    maneuversFieldSet.style.visibility = "hidden";
    maneuversDiv.style.visibility = "hidden";
  }
  execute(menu) {
    menu.getTarget().innerHTML = menu.getMessageQueue().shift();
  }
  exit(menu) {}
  onMessage(menu, msg) {
    switch(msg.msg) {
      case "msg_write":
        menu.getMessageQueue().push(msg.extraInfo);
        return true;
    }
    return false; }
}

class MenuMngrGlobalState extends State {
  constructor() {
    super();
    if(!MenuMngrGlobalState._instance) {
      MenuMngrGlobalState._instance = this;
    }
  }
  enter(menu)   {}
  execute(menu) {}
  exit(menu)    {}
  onMessage(menu, msg) {
    switch(msg.msg) {
      case "msg_selectionMade":
        menu.changeState(new WriteToLog());
        dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_write", msg.extraInfo);
        return true;
    }
    return false;
  }
}
