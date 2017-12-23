// @flow

import * as THREE from 'three';
import Agent from './Agent';
import Graph from '../components/structures/Graph';

export default class ObesityAgent extends Agent {

  BMI: number;
  satisficingRadius: number;

  constructor(satisficingRadius: number) {
    
    super(0, 0);

    this.satisficingRadius = satisficingRadius;

  }

  /**
   * Get coordinates of the `center` of this node (where to plot it).
   * @param {*} canvas 
   */
  center(canvas: HTMLCanvasElement): THREE.Vector2 {

    if (!(this.graph instanceof Graph)) {
      console.warn("Tried to get center of node with no graph!");
      return new THREE.Vector2();
    }

    const graph = this.graph;
    const w = canvas.width;
    const h = canvas.height;
    const i = graph.indexOf(this);
    const r = Math.min(w, h) / 2 - (i % 2 === 0 ? 20 : 40);

    const x = w / 2 + r * Math.cos(2 * Math.PI * i / graph.size());
    const y = h / 2 + r * Math.sin(2 * Math.PI * i / graph.size());

    return new THREE.Vector2(x, y);
  }

  /**
   * Draw edges between the center of this node and its neighbors.
   * @param {*} context 
   */
  drawEdges(context: CanvasRenderingContext2D) {

    const graph = this.graph;
    if (!(graph instanceof Graph)) return;

    const c = this.center(context.canvas);
    
    context.globalAlpha = 0.25;
    context.fillStyle = 'black';

    graph.neighbors(this).forEach(neighbor => {
      
      const nc = neighbor.center(context.canvas);

      context.beginPath();
      context.moveTo(c.x, c.y);
      context.lineTo(nc.x, nc.y);
      context.stroke();
      context.closePath();
    });
  }

  /**
   * Draw this node on the canvas, with radius corresponding to BMI.
   * @param {*} context 
   */
  draw(context: CanvasRenderingContext2D) {
      
    const c = this.center(context.canvas);
    const val = (Math.round((this.BMI - 15) * 255)).toString();

    context.globalAlpha = 1;
    context.fillStyle = 'rgb(' + [val, val, val].join(',') + ')';

    context.beginPath();
    context.arc(c.x, c.y, Math.floor(this.BMI / 4), 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
  }

  /**
   * Called from BMIEnvironment. It would be possible to separate this into
   * two separate functions, one that *calculated* the next state, and one that
   * actually stepped toward it.
   */
  tick(): ObesityAgent {

    // if no graph, nothing to do
    const graph = this.graph;
    if (!(graph instanceof Graph)) return this;

    // Get neighbors. If there are none (so lonely!), nothing to do.
    const neighbors = graph.neighbors(this);
    if (neighbors.length === 0) return this;

    // Get the mean BMI of this node's neighbors.
    const meanBMI = neighbors.map(a => a.BMI).reduce((a, b) => a + b) / neighbors.length;

    // Get the difference (and absolute difference) of this node's BMI
    // and the mean of its neighbors.
    const diff = meanBMI - this.BMI;
    const absDiff = Math.abs(diff);

    // If the absolute difference is greater than this node's satisficing radius,
    // adjust this node's BMI by 0.1 or by the absolute difference 
    // (whichever is smaller) toward the mean.
    if (absDiff > this.satisficingRadius) {
      const amt = Math.min(absDiff, 0.1);
      this.BMI += amt * (meanBMI - this.BMI > 0 ? 1 : -1);
    }

    // Allow chaining for convenience.
    return this;
  }
};