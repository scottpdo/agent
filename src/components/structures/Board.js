// @flow

import Agent from '../../agents/Agent';

export default class Board {

  agents: (?Agent)[] = [];
  width: number;
  height: number;

  static NullAgent = class NullAgent {};

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  addAgent(agent: ?Agent) {
    
    const lastIndex = this.agents.length;

    this.agents.push(agent);
    if (!(agent instanceof Agent)) return;

    agent.x = lastIndex % this.width;
    agent.y = (lastIndex / this.height) | 0;
    agent.board = this;
  }

  get(i: number): Agent {

    if (i < 0 || i > this.agents.length) {
      throw new Error("tried to get index out of bounds");
    }

    return this.agents[i];
  }

  indexOf(agent: Agent): number {
    return this.agents.indexOf(agent);
  }

  isNorthEdge(index: number): boolean {
    return index - this.width < 0;
  }

  isSouthEdge(index: number): boolean {
    return index + this.width >= this.agents.length;
  }

  isEastEdge(index: number): boolean {
    return (index + 1) % this.width === 0;
  }

  isWestEdge(index: number): boolean {
    return index % this.width === 0;
  }

  neighbors(agent: Agent): (?Agent)[] {
    
    let output = [];
    const idx = this.indexOf(agent);
    if (idx < 0) return output;

    // N, S, E, W
    if (!this.isNorthEdge(idx)) output.push(this.get(idx - this.width));
    if (!this.isSouthEdge(idx)) output.push(this.get(idx + this.width));
    if (!this.isWestEdge(idx)) output.push(this.get(idx - 1));
    if (!this.isEastEdge(idx)) output.push(this.get(idx + 1));

    return output;
  }

  // TODO
  neighborsAll(agent: Agent): (?Agent)[] {
    
    let output = this.neighbors(agent);
    const idx = this.indexOf(agent);

    // NE, NW, SE, SW
    if (!this.isNorthEdge(idx) && !this.isEastEdge(idx)) output.push(this.get(idx - this.width + 1));
    if (!this.isNorthEdge(idx) && !this.isWestEdge(idx)) output.push(this.get(idx - this.width - 1));
    if (!this.isSouthEdge(idx) && !this.isEastEdge(idx)) output.push(this.get(idx + this.width + 1));
    if (!this.isSouthEdge(idx) && !this.isWestEdge(idx)) output.push(this.get(idx + this.width - 1));

    return output;
  }

  forEachAll(cb: Function) {
    this.agents.forEach(cb);
  }

  forEach(cb: Function) {
    this.agents.filter(agent => agent instanceof Agent).forEach(cb);
  }

  forEachCivilian(cb: Function) { 
    this.agents.filter(agent => {
      return agent instanceof Agent && agent.type === 'civilian';
    }).forEach(cb);
  }

  forEachCop(cb: Function) {
    this.agents.filter(agent => {
      return agent instanceof Agent && agent.type === 'cop';
    }).forEach(cb);
  }

  swap(agent1: Agent, agent2: Agent) {
    const i = this.indexOf(agent1);
    const j = this.indexOf(agent2);
    this.agents[i] = agent2;
    this.agents[j] = agent1;
  }
}