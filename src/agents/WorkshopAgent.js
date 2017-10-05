// @flow

import Agent from './Agent';

export default class WorkshopAgent extends Agent {

  r: number;
  dir: number;
  speed: number;
  context: CanvasRenderingContext2D;

  constructor(x: number, y: number, r: number) {

    super(x, y, 0);
    
    this.r = r;
    this.dir = Math.random() * (2 * Math.PI);
    this.speed = 2;
  }

  setContext(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  // Override
  tick() {

    const next = {
      x: this.x + this.speed * Math.cos(this.dir),
      y: this.y + this.speed * Math.sin(this.dir),
    };

    const data = this.context.getImageData(next.x, next.y, 1, 1).data;
    const isBlack = data[0] === 0 && data[1] === 0 && data[2] === 0;

    if (isBlack) {
      // redirect
      this.dir += Math.PI;
    }

    this.set(next.x, next.y, 0);

    return this;
  }

  // Override
  draw() {
    
    const context = this.context;
    if (context === null) throw new Error("Agent needs a context to draw!");

    context.fillStyle = 'white';
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    context.fill();
  }
};