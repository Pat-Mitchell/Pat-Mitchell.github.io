// controller.js
// Requires DoublyLinkedList.js

class Keyboard {
  #m_keysPressed = [];
  #m_keyHistory = new DoublyLinkedList();
  #m_maxKeyHist = 10;
  constructor() {
    document.addEventListener('keydown', (event) => {
      if(!this.#m_keysPressed[event.key]) {
        this.#m_keysPressed[event.key] = [true, 0];
        this.#f_histInsert([event.key, Date.now()]);
      }
      event.preventDefault();
    }, true);

    document.addEventListener('keyup', (event) => {
      delete this.#m_keysPressed[event.key];
      event.preventDefault();
    });
  }

  isPressed(k)            {return this.#m_keysPressed[k]}
  keysPressed()           {return this.#m_keysPressed}
  timeHeld(k)             {if(!this.#m_keysPressed[k]) return 0; return this.#m_keysPressed[k][1];}

  getKeyHist()            {return this.#m_keyHistory;}
  setKeyHistMax(v)        {this.#m_maxKeyHist = v;}

  update()                {for (const e in this.#m_keysPressed) {this.#m_keysPressed[e][1]++;}}

  #f_histInsert(k) {
    this.#m_keyHistory.insert(k);
    if(this.#m_keyHistory.length > this.#m_maxKeyHist)
      this.#m_keyHistory.remove();
  }
}
