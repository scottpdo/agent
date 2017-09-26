// @flow

import Agent from './Agent';

export default class IntersectionAgent extends Agent {

  constructor(x: number, y: number, z: number = 0) {
    super(x, y, z);
    this.dir = Math.random() > 0.5 ? 1 : -1;
  }

  // Override
  tick() {
    this.y += this.dir;
    return this;
  }
};