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
  getSkillSword() { return this.#skillSword;    }
  getSkillBlock() { return this.#skillBlock;    }
  getSkillDodge() { return this.#skillDodge;    }
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
  getSkillUnarmed() { return this.#skillUnarmed;  }
  getSkillBlock()   { return this.#skillBlock;    }
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

class PlayerDefendMenu extends State {
  constructor() {
    super();
    if(!PlayerDefendMenu._instance) {
      PlayerDefendMenu._instance = this;
    }
  }
  enter(menu) {
    maneuversFieldSet.style.visibility = "visible";
    defensiveOptionsDiv.style.visibility = "visible";
  }
  execute(menu) {}
  exit(menu) {
    maneuversFieldSet.style.visibility = "hidden";
    defensiveOptionsDiv.style.visibility = "hidden";
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
    if(menu.getMessageQueue().length != 0)
      menu.getTarget().innerHTML = menu.getMessageQueue().shift();
    else {
      dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_doneWithQueue");
    }
  }
  exit(menu) {}
  onMessage(menu, msg) {
    switch(msg.msg) {
      case "msg_write":
        menu.getMessageQueue().push(msg.extraInfo);
        return true;
      case "msg_endOfFight":
        maneuversFieldSet.style.visibility = "hidden";
        defensiveOptionsDiv.style.visibility = "hidden";
        maneuversDiv.style.visibility = "hidden";
        let winnerMessage = `
          ${msg.extraInfo} wins!<br>
          <a href="2_0-Recreation.html">click here to go back!</a>
          `
        menu.getMessageQueue().push(winnerMessage);
        menu.getFSM().update();
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
        switch(msg.extraInfo) {
          case "Attack":
            let damage = 0;
            let txtToWrite = "The player chose to attack!";
            let skillCheck = entityMgr.getEntityById(msg.sender).getDX() + entityMgr.getEntityById(msg.sender).getSkillSword();
            let diceRoll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if     (diceRoll >= 17)         txtToWrite += "<br>It automatically misses!";
            else if(diceRoll >= skillCheck) txtToWrite += "<br>It misses!";
            else if(diceRoll <= 4) {
              txtToWrite += "<br>It automatically hits!";
              damage = (skillCheck - diceRoll);
            }
            else if(diceRoll < skillCheck) {
              damage = (skillCheck - diceRoll);
              txtToWrite += `<br>The target must defend a potential ${damage} points of damage!`;
            }
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_write", txtToWrite);
            if(damage == 0) break;
            txtToWrite = "The bear chooses to block!"
            skillCheck = entityMgr.getEntityById(2).getDX() + entityMgr.getEntityById(2).getSkillBlock();
            diceRoll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if     (diceRoll >= 17)         txtToWrite += "<br>It automatically fails!";
            else if(diceRoll >= skillCheck) {
              txtToWrite += "<br>It fails!";
              txtToWrite += `<br>${damage} points of damage sustained!`;
            }
            else if(diceRoll <= 4) {
              txtToWrite += "<br>It automatically blocks!";
              damage = 0;
            }
            else if(diceRoll < skillCheck) {
              damage = damage - (skillCheck - diceRoll);
              if(damage <= 0) {
                txtToWrite += "<br>All damage blocked!";
                damage = 0;
              }
              else {
                txtToWrite += `<br>${damage} points of damage sustained!`;
              }
            }
            entityMgr.getEntityById(opponentID).setCurrentHP(entityMgr.getEntityById(opponentID).getCurrentHP() - damage);
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_write", txtToWrite);
            break;
          case "Parry":
            let damageToPlayer = 0;
            let txtParry = "The bear swipes at you!";
            let skillCheckBear = entityMgr.getEntityById(opponentID).getST() + entityMgr.getEntityById(opponentID).getSkillUnarmed();
            let diceRoll1 = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if     (diceRoll1 >= 17)             txtParry += "<br>It automatically misses!";
            else if(diceRoll1 >= skillCheckBear) txtParry += "<br>It misses!";
            else if(diceRoll1 <= 4) {
              txtParry += "<br>It automatically hits!";
              damageToPlayer = (skillCheckBear - diceRoll1);
            }
            else if(diceRoll1 < skillCheckBear) {
              damageToPlayer = (skillCheckBear - diceRoll1);
              txtParry += `<br>You must defend a potential ${damageToPlayer} points of damage!`;
            }
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_write", txtParry);
            if(damageToPlayer == 0) break;
            txtParry = "You chose to parry!"
            skillCheckBear = entityMgr.getEntityById(1).getDX() + entityMgr.getEntityById(1).getSkillBlock();
            diceRoll1 = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if     (diceRoll1 >= 17)         txtParry += "<br>It automatically fails!";
            else if(diceRoll1 >= skillCheckBear) {
              txtParry += "<br>It fails!";
              txtParry += `<br>${damageToPlayer} points of damage sustained!`;
            }
            else if(diceRoll1 <= 4) {
              txtParry += "<br>It automatically parries!";
              damageToPlayer = 0;
            }
            else if(diceRoll1 < skillCheckBear) {
              damageToPlayer = damageToPlayer - (skillCheckBear - diceRoll1);
              if(damageToPlayer <= 0) {
                txtParry += "<br>All damage parried!";
                damageToPlayer = 0;
              }
              else {
                txtParry += `<br>${damageToPlayer} points of damage sustained!`;
              }
            }
            entityMgr.getEntityById(playerID).setCurrentHP(entityMgr.getEntityById(playerID).getCurrentHP() - damageToPlayer);
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_write", txtParry);
            break;
        }
        return true;
      case "msg_doneWithQueue":
        if(menu.getFSM().previousState() instanceof PlayerAttackMenu) {
          if(entityMgr.getEntityById(opponentID).getCurrentHP() <= 0) {
            opponentHealthPoints.innerHTML = `0/${entityMgr.getEntityById(opponentID).getHP()}`;
            opponentHealthBar.style.width = `0%`;
            menu.changeState(new WriteToLog());
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_endOfFight", "Player");
          }
          else {
            menu.getTarget().innerHTML = "Bear is attacking!";
            opponentHealthPoints.innerHTML = `${entityMgr.getEntityById(opponentID).getCurrentHP()}/${entityMgr.getEntityById(opponentID).getHP()}`;
            opponentHealthBar.style.width = `${entityMgr.getEntityById(opponentID).getCurrentHP() / entityMgr.getEntityById(opponentID).getHP() * 100 + 1}%`;
            menu.changeState(new PlayerDefendMenu());
          }
        }
        if(menu.getFSM().previousState() instanceof PlayerDefendMenu) {
          if(entityMgr.getEntityById(playerID).getCurrentHP() <= 0) {
            playerHealthPoints.innerHTML = `0/${entityMgr.getEntityById(playerID).getHP()}`;
            playerHealthBar.style.width = `0%`;
            menu.changeState(new WriteToLog());
            dispatch.dispatchMessage(menu.id(), menu.id(), 0, "msg_endOfFight", "Bear");
          }
          else {
            menu.getTarget().innerHTML = "";
            playerHealthPoints.innerHTML = `${entityMgr.getEntityById(playerID).getCurrentHP()}/${entityMgr.getEntityById(playerID).getHP()}`;
            playerHealthBar.style.width = `${entityMgr.getEntityById(playerID).getCurrentHP() / entityMgr.getEntityById(playerID).getHP() * 100 + 1}%`;
            menu.changeState(new PlayerAttackMenu());
          }
        }
        return true;
    }
    return false;
  }
}
