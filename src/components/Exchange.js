// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import ExchangeAgent from '../agents/exchange/ExchangeAgent';
import ExchangeGroup from '../agents/exchange/ExchangeGroup';

import '../css/Exchange.css';

type Props = {};
type State = {
  size: number,
  t: number
};

export default class Exchange extends Component<Props, State> {

  group: ExchangeGroup = new ExchangeGroup();
  tick: Function;

  constructor() {

    super();

    const size = 100;

    for (let i = 0; i < size; i++) {

      const agent = new ExchangeAgent();

      agent.wealth = _.random(0, 100);
      agent.goods = _.random(0, 100);

      this.group.add(agent);
    }

    this.group.sort();

    this.state = {
      size: this.group.size(),
      t: 0
    };

    this.tick = this.tick.bind(this);
  }

  tick() {
    this.group.tick();
    this.setState({ t: this.state.t + 1 });
  }

  render() {

    const agents = this.group.render();

    return (
      <div>
        <h1>Exchange System</h1>
        <div># of agents: {this.state.size}</div>
        <div>mean wealth: {this.group.meanWealth()}</div>
        <pre>{agents}</pre>

        <button className="tick-button" onClick={this.tick}>Tick</button>
      </div>
    );
  }
};