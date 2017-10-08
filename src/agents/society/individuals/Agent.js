/**
 *	Base class
 */
export default class Agent {
  
    constructor() {
      
      this.age = 0;
      this.alive = true;
      this.history = [];
  
    }
  
    record(event) {
  
      // the dead tell no tales
      if (!this.alive) return;
      
      this.history.push(event);
    }
  
    getEvent(year, type, target) {
      for (let event of this.history) {
        if (event.year === year && event.type === type && event.target === target) {
          return event;
        }
      }
      return null;
    }
  }