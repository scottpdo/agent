// @flow

import Agent from '../Agent';

export default class Cop extends Agent {

  constructor() {
    super(0, 0);
    this.type = 'cop';
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

    context.fillStyle = 'rgb(100, 100, 255)';
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  }
}