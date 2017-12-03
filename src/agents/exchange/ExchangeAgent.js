// @flow

import _ from 'lodash';

import Agent from '../Agent';
import ExchangeGroup from './ExchangeGroup';

export default class ExchangeAgent extends Agent {

  goods: number = 0;
  wealth: number = 0;
  group: ExchangeGroup; 

  constructor() {
    super(0, 0);
  }

  // @Override
  tick(): ExchangeAgent {
    const d = this.desire;

    // TODO
    if (!_.isNil(this.group)) {
      const market = this.group.filter(a => a !== this);
    }

    return this;
  }

  buy(quantity: number, rate: number) {
    this.goods += quantity;
    this.wealth -= (quantity * rate);
  }

  sell(quantity: number, rate: number) {
    this.goods -= quantity;
    this.wealth += (quantity * rate);
  }
};