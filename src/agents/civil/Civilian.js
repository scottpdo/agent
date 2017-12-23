// @flow

import Agent from '../Agent';

// const format = (x: number): string => {
//   return (Math.round(x * 100) / 100).toString();
// }

export default class Civilian extends Agent {

  active: boolean = false;
  arrested: boolean = false;
  hardship: number = Math.random();
  legitimacy: number;
  riskAversion: number = Math.random();

  constructor(legitimacy: number) {

    super(0, 0);
    
    this.legitimacy = legitimacy;
    this.type = 'civilian';
  }

  grievance(): number {
    return this.hardship * (1 - this.legitimacy);
  }

  arrestProbability(): number {

    const k = 2.302585; // TODO: set this somewhere else...

    const visible = this.visibleAgents();
    let cops = 0;
    let actives = 1; // count self

    for (let i = 0; i < visible.length; i++) {
      if (visible[i].type === 'cop') {
        cops++;
      } else if (visible[i].active) {
        actives++;
      }
    }

    const copsToActives = cops / actives;
    const result = 1 - Math.pow(Math.E, -k * copsToActives);

    return result;
  }

  visibleAgents(): Array<Agent> {
    if (!this.board) return [];
    // $FlowFixMe
    return this.board.neighborsAll(this).filter(n => n instanceof Agent);
  }

  netRisk(): number {
    return this.riskAversion * this.arrestProbability();
  }

  tick(): Civilian {
    const threshold = 0.0;
    this.active = this.grievance() - this.netRisk() > threshold;
    if (this.arrested) this.active = false;
    return this;
  }

  draw(context: CanvasRenderingContext2D, i: number) {

    const canvas = context.canvas;
    const board = this.board;
    if (!board) return;

    const w = canvas.width;
    const h = canvas.height;
    
    let x = i % this.board.width;
    x *= w / board.width; 
    x += 0.5 * w / board.width;
    
    let y = (i / this.board.width) | 0;
    y *= h / board.height;
    y += 0.5 * h / board.height;

    const r = 10;

    context.fillStyle = this.active ? 'red' : 'black';
    if (this.arrested) context.fillStyle = 'gray';
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.closePath();
    context.fill();

    // context.fillStyle = 'black';
    // context.textAlign = 'center';
    // context.fillText(format(this.grievance() - this.netRisk()), x, y + 20);
  }
};