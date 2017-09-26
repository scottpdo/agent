import Agent from './Agent';

export default class IntersectionAgent extends Agent {

  constructor(x, y, z = 0) {
    super(x, y, z);
    this.dir = Math.random() > 0.5 ? 1 : -1;
  }

  // Override
  tick() {
    this.y += this.dir;
    return this;
  }
};