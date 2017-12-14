// @flow

import React, { Component } from 'react';

import OvationAgent from '../agents/OvationAgent';

type Props = {};
type State = {
  agents: Array<OvationAgent>
};

export default class Ovation extends Component<Props, State> {
  
  init: Function;
  percentApplaudingUpToRow: Function;
  performance: number = 0.2 + 0.6 * Math.random();
  showAgentInfo: Function;
  tick: Function;

  static AUDIENCE:number = 100;
  static COLS: number = 10;

  static seat = (n: number) => {
    return {
      row: Math.floor(n / Ovation.COLS),
      col: n % Ovation.COLS
    };
  };

  constructor() {

    super();

    this.state = {
      agents: []
    };

    this.init = this.init.bind(this);
    this.percentApplaudingUpToRow = this.percentApplaudingUpToRow.bind(this);
    this.showAgentInfo = this.showAgentInfo.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {

    this.init();

    window.addEventListener('click', this.tick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.tick);
  }

  init() {
    // possibly reset
    const agents = [];

    for (let i = 0; i < Ovation.AUDIENCE; i++) {
      
      const agent = new OvationAgent();

      agent.applauding = this.performance >= agent.threshold;
      agent.seat = Ovation.seat(i);

      agents.push(agent);
    }

    this.setState({ agents });
  }

  percentApplaudingUpToRow(row: number): number {
    
    const size = (row + 1) * Ovation.COLS;
    let output = 0;

    this.state.agents
      .filter((agent, i) => Ovation.seat(i).row <= row)
      .forEach((agent, i) => {
        output += agent.applauding ? 1 : 0;
      });
    
    output /= size;

    return output;
  }

  tick() {

    const agents = this.state.agents.map((agent, i) => {

      agent.next = this.percentApplaudingUpToRow(Ovation.seat(i).row) > agent.threshold;

      return agent;
    });

    agents.forEach(agent => agent.applauding = agent.next);

    this.setState({ agents });
  }

  showAgentInfo(agent: OvationAgent) {
    this.refs.agentInfo.innerHTML = 
      "agent threshold: " + agent.threshold.toString();
  }

  render() {

    const style = {
      display: 'block',
      margin: '0 auto'
    };

    const agents = this.state.agents.map((agent, i) => {

      const cx = agent.seat.col * 25 + 20;
      const cy = agent.seat.row * 25 + 20;
      const fill = agent.applauding ? 'hotpink' : 'white';

      return <circle 
        onMouseOver={this.showAgentInfo.bind(this, agent)}
        cx={cx}
        cy={cy}
        key={"agent-" + i.toString()} 
        r="10" 
        stroke="black" 
        fill={fill} />;
    });

    return (
      <div>
        <svg width="500" height="500" style={style}>
          <rect width="500" height="500" fill="#e4e4e4" />
          {agents}
        </svg>
        <button onClick={this.init}>Reset (random)</button>
        <pre ref="agentInfo"></pre>
      </div>
    );
  }
}