// @flow

import Agent from './Agent';

export default class OvationAgent extends Agent {

  applauding: boolean = false;
  next: boolean = false;
  threshold: number;

  constructor() {

    super(0, 0);

    this.threshold = 0.1 + 0.8 * Math.random();
  }
};