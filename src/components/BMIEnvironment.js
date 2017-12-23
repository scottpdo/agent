// @flow

import React, { Component } from 'react';
import PD from 'probability-distributions';
import queryString from 'query-string';

import BMIAgent from '../agents/BMIAgent';
import WattsStrogatz from '../agents/WattsStrogatz';
import Graph from './structures/Graph';

type Props = {};
type State = {
  i: number
};

let query = queryString.parse(window.location.search);
let meanDegree = +(query.degree);
let rewiringProbability = +(query.rewire);
let satisficingRadius = +(query.satisfice);

/**
 * Environment that contains the graph, calls the tick function,
 * and does the visualization and output.
 */
export default class BMIEnvironment extends Component<Props, State> {

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawInterval: number;
  graph: Graph = new Graph();
  COUNT: number = 100;
  WIDTH: number = 600;
  HEIGHT: number = 600;
  title: string = "BMI";

  // shape and rate parameters for gamma distribution
  shape: number = 3;
  rate: number = 0.25;

  // get mean degree, rewiring probability, and satisficing radius from
  // URL parameters if they are present, otherwise manually set values here
  meanDegree: number = !isNaN(meanDegree) ? meanDegree : 4;
  rewiringProbability: number = !isNaN(rewiringProbability) ? rewiringProbability : 0.1;
  satisficingRadius: number = !isNaN(satisficingRadius) ? satisficingRadius : 0.4;

  draw: Function;
  stats: Function;
  tick: Function;
  
  constructor() {

    super();

    this.state = { i: 0 };

    /**
     * Generate a list of COUNT gamma-distributed values
     * with the given shape and rate values. Then, for each of those values,
     * add a new agent to the graph with the given satisficing radius and a
     * BMI of 15 + the random value.
     */
    PD.rgamma(this.COUNT, this.shape, this.rate)
      .forEach(BMI => {
        const agent = new BMIAgent(this.satisficingRadius);
        agent.BMI = 15 + BMI;
        this.graph.addNode(agent);
      });
    
    /**
     * Perform Watts-Strogatz rewiring on the graph with the given
     * mean degree and rewiring probability.
     */
    WattsStrogatz(this.graph, this.meanDegree, this.rewiringProbability);

    // bind methods to the context of this component
    this.draw = this.draw.bind(this);
    this.stats = this.stats.bind(this);
    this.tick = this.tick.bind(this);
  }

  /**
   * Bind canvas and context, and draw chart lines (updated on tick).
   * Also start ticking.
   */
  componentDidMount() {

    document.title = this.title;

    this.canvas = this.refs.canvas;
    this.context = this.canvas.getContext('2d');

    this.draw();

    // draw lines on chart
    const chart = this.refs.chart.getContext('2d');
    
    chart.globalAlpha = 1;
    chart.setLineDash([5, 15]);
    chart.lineWidth = 0.5;
    
    /**
     * draw dashed lines on the chart for BMI values
     */
    for (let i = 5; i < 60; i += 5) {

      chart.beginPath();
      chart.moveTo(0, this.chartY(i));
      chart.lineTo(chart.canvas.width, this.chartY(i));
      chart.closePath();
      chart.stroke();

      chart.font = '16px Helvetica';
      chart.fillText(i.toString(), 2, this.chartY(i) + 6);
    }

    /**
     * draw x-axis for time parameter
     */
    for (let i = 10; i < 250; i += 10) {
      chart.setLineDash([]);
      chart.beginPath();
      chart.moveTo(i, chart.canvas.height);
      chart.lineTo(i, chart.canvas.height - (i % 50 === 0 ? 20 : 10));
      chart.closePath();
      chart.stroke();

      chart.font = '12px Helvetica';
      chart.textAlign = 'center';
      if (i % 50 === 0) chart.fillText(i.toString(), i, chart.canvas.height - 25);
    }

    // go go go
    this.drawInterval = setInterval(this.tick, 50);
  }

  componentWillUnmount() {
    clearInterval(this.drawInterval);
  }

  // Helper function to draw y value on chart
  chartY(y: number): number {
    const chart = this.refs.chart.getContext('2d');
    return chart.canvas.height - Math.round(10 * y);
  }

  // update graph visualization and chart
  draw() {
    // alias
    const context = this.context;

    context.fillStyle = 'yellow';
    context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    this.graph.forEach(node => node.drawEdges(context));
    this.graph.forEach(node => node.draw(context));

    // draw chart
    const chart = this.refs.chart.getContext('2d');
    this.graph.forEach(node => {
      
      chart.globalAlpha = 0.25;
      chart.fillRect(this.state.i, this.chartY(node.BMI), 1, 1);
    });
  }

  /**
   * Environment tick -- updates internal `i` (time),
   * and ticks each agent according to a random order (graph.forEachRand)
   */
  tick() {

    this.graph.forEachRand(node => node.tick());

    this.draw();
    this.setState({ i: this.state.i + 1 });
  }

  // Output environment constants, as well as 
  // max, mean, and min BMIs among the agents.
  stats() {

    let maxBMI  = -Infinity;
    let meanBMI = 0;
    let minBMI  = Infinity;

    this.graph.forEach(node => {

      if (node.BMI > maxBMI) maxBMI = node.BMI;
      if (node.BMI < minBMI) minBMI = node.BMI;

      meanBMI += node.BMI;
    });

    meanBMI /= this.graph.size();

    return (
      <div>
        <div>meanDegree: {this.meanDegree}</div>
        <div>rewiringProbability: {this.rewiringProbability}</div>
        <div>satisficingRadius: {this.satisficingRadius}</div>
        <br />
        <div>max  BMI: {maxBMI}</div>
        <div>mean BMI: {meanBMI}</div>
        <div>min  BMI: {minBMI}</div>
      </div>
    )
  }

  render() {

    const canvasStyle = { float: 'left', marginRight: 20 };

    return (
      <div>
        <canvas ref="canvas" width={this.WIDTH} height={this.HEIGHT} style={canvasStyle} />
        <canvas ref="chart" width="225" height="600" style={canvasStyle} />
        <pre>{this.stats()}</pre>
      </div>
    );
  }
};