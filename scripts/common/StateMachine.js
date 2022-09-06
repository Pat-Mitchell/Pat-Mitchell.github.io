class StateMachine {
  #owner;
  #currentState = null;
  #previousState = null;
  #globalState = null;
  constructor(owner) {
    this.#owner = owner;
  }
  setCurrentState(s) {this.#currentState = s;}
  setGlobalState(s) {this.#globalState = s;}
  setPreviousState(s) {this.#previousState = s;}

  update() {
    if(this.#globalState != null) this.#globalState.execute(this.#owner);
    if(this.#currentState != null) this.#currentState.execute(this.#owner);
  }
  changeState(newState) {
    this.#previousState = this.#currentState;
    if(this.#currentState != null)
    this.#currentState.exit(this.#owner);
    this.#currentState = newState;
    if(this.#currentState != null)
    this.#currentState.enter(this.#owner);
  }
  revertToPreviousState() {
    this.changeState(this.#previousState);
  }
  handleMessage(msg) {
    if(this.#currentState != null && this.#currentState.onMessage(this.#owner, msg))
      return true;
    if(this.#globalState != null && this.#globalState.onMessage(this.#owner, msg))
      return true;
    return false;
  }

  currentState() {return this.#currentState};
  globalState() {return this.#globalState};
  previousState() {return this.#previousState};
  isInState(s) {return s === this.#currentState};
}

class State {
  constructor() {}
  enter(entity){
    return 0;
  }
  execute(entity){
    return 0;
  }
  exit(entity){
    return 0;
  }
  static getInstance() {
    return this._instance;
  }
  onMessage(ent, telegram) {return 0;}
}

class EntityManager {
  #entityMap = new Map();
  constructor() {
    if(!EntityManager._instance){
      EntityManager._instance = this;
    }
  }
  registerEntity(newEnt) {
    this.#entityMap.set(newEnt.id(), newEnt);
  }
  getEntityById(id) {
    let ent = this.#entityMap.get(id);
    if(ent !== undefined) return ent;
    return null;
  }
  removeEntity(ent) {
    this.#entityMap.delete(ent.id());
  }
  getNamebyID(id) {
    let ent = this.#entityMap.get(id);
    if(ent !== undefined) return ent.name();
    return null;
  }
}

class BaseGameEntity {
  // Private ****************
  #ID = 0;
  #entityType;
  #bTag;
  // this is the next valid ID. Each time an Entity is instantiated
  // this value is incremented
  static #nextValidID = 0;

  constructor(entity_type = -1) {
    this.setID(BaseGameEntity.#nextValidID++);
    this.#entityType = entity_type;
    this.#bTag = false;
  }
  // all entities must implement an update function
  update(dt)           {return 0;}
  handleMessage(msg)   {return 0;}

  id()                 {return this.#ID;}
  setID(id)            {this.#ID = id;}

  isTagged()           {return this.#bTag;}
  tag()                {this.#bTag = true;}
  untag()              {this.#bTag = false;}

  entityType()         {return this.#entityType;}
  setEntityType(t)     {this.#entityType = t;}
}

function assert(condition, message) {
  if(!condition) throw new Error(message || `Assertion failed!`);
}

class MessageDispatcher {
  #priorityQ = new PriorityQ();
  constructor() {
    if(!MessageDispatcher._instance){
      MessageDispatcher._instance = this;
    }
  }
  discharge(pReceiver, message) {
    if(!pReceiver.handleMessage(message)) {
      console.error(`Message not handled`);
    }
  }
  dispatchMessage(delay, sender, receiver, msg, extraInfo = null) { // delay is in ms
    // pReceiver is supposed to be explicitly a pointer since the
    // book is in C++. Thanks to JS, all variables to user-undefined
    // classes are basically pointers.
    let pReceiver = entityMgr.getEntityById(receiver);
    if(pReceiver == null) { console.error(`No receiver w/ ID: ${receiver} found`); return;}

    let message = new Message(0, sender, receiver, msg, extraInfo);

    if(delay <= 0) {
      this.discharge(pReceiver, message);
    }
    else {
      message.dispatchTime = Date.now() + delay; // Current time + delay
      this.#priorityQ.insert(message);
    }
  }
  dispatchDelayedMessage() {
    while(this.#priorityQ.length != 0 &&
          this.#priorityQ[0].dispatchTime < Date.now() &&
          this.#priorityQ[0].dispatchTime > 0) {
            let message = this.#priorityQ[0];
            let pReceiver = entityMgr.getEntityById(message.receiver);
            this.discharge(pReceiver, message);
            this.#priorityQ.shift();
          }
  }
  logPriorityQ() {
    console.log(this.#priorityQ);
  }
}

class PriorityQ extends Array{
  static get [Symbol.species]() { return Array; }
  constructor(){
    super();
  }
  insert(msg){
    if(this.length === 0) {this[0] = msg}
    else {
      for(let i = 0; i <= this.length; i++) {
        if(this[i].dispatchTime > msg.dispatchTime){
          this.splice(i, 0, msg);
          break;
        }
      }
    }
  }
}

class Message {
  #shortestDelay = 250;
  constructor(delay, sender, receiver, msg, extraInfo = null) {
    this.sender = sender;
    this.receiver = receiver;
    this.msg = msg;
    this.extraInfo = extraInfo;
    if(delay <= 0) this.delay = 0;
    else this.dispatchTime = Math.max(delay, this.#shortestDelay);
  }
}
