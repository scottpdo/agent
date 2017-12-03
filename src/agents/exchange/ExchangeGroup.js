import React from 'react';
import _ from 'lodash';

import ExchangeAgent from './ExchangeAgent';

export default class ExchangeGroup {
  
  agents: Array<ExchangeAgent> = [];

  add(agent: ExchangeAgent) {
    agent.group = this;
    this.agents.push(agent);
  }

  sort() {
    this.agents = _.sortBy(this.agents, [a => a.wealth]);
  }

  size() {
    return this.agents.length;
  }

  tick() {
    let mean = this.meanWealth();
    this.agents.forEach(agent => {
      agent.desire = mean;
      agent.tick();
    });
  }

  meanWealth(): number {
    return this.agents.map(a => a.wealth).reduce((a, b) => a + b) / this.size();
  }

  render() {

    return this.agents.map((agent, i) => {

      const w:string = agent.wealth.toString();
      const g:string = agent.goods.toString();

      return (
        <div key={"agent-" + i}>
          Wealth: {w}  /  Goods: {g}
        </div>
      );
    });
  }
};