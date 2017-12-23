// @flow

import React, { Component } from 'react';
import _ from 'lodash';

import Board from './structures/Board';
import Agent from '../agents/Agent';
import Civilian from '../agents/civil/Civilian';
import Cop from '../agents/civil/Cop';

type Props = {};
type State = {};

export default class CivilEnvironment extends Component<Props, State> {

  agents: Array<Agent> = [];
  board: Board = new Board(30, 30);
  draw: Function;
  drawInterval: number;

  title: string = "Modeling civil violence";
  legitimacy: number = 0.9;
  
  percentFull: number = 0.6;
  percentCops: number = 0.2;

  HEIGHT: number = 600;
  WIDTH: number = 600;

  constructor() {
    
    super();

    this.state = {};

    this.draw = this.draw.bind(this);
  }

  componentDidMount() {

    document.title = this.title;

    const w = this.board.width;
    const h = this.board.height;

    let indices = _.times(w * h - 1, _.add.bind(1));
    let emptyIndices = [];
    let copIndices = [];

    while (emptyIndices.length < Math.round((1 - this.percentFull) * w * h)) {
      const idx = _.sample(indices);
      emptyIndices.push(idx);
      indices = indices.filter(i => i !== idx);
    }

    while (copIndices.length < Math.round(this.percentFull * this.percentCops * w * h)) {
      const idx = _.sample(indices);
      copIndices.push(idx);
      indices = indices.filter(i => i !== idx);
    }

    for (let i = 0; i < Math.round(w * h); i++) {

      let agent;

      if (copIndices.indexOf(i) >= 0) {
        agent = new Cop();
      } else if (emptyIndices.indexOf(i) >= 0) {
        agent = new Board.NullAgent();
      } else {
        agent = new Civilian(this.legitimacy);
      }

      this.board.addAgent(agent);
    }

    this.draw();

    this.drawInterval = setInterval(() => {
      
      this.board.forEachCivilian(agent => agent.tick());
      
      this.board.forEachCop(cop => {
        this.board.neighborsAll(cop).filter(agent => agent instanceof Agent && agent.active).forEach(agent => {
          // $FlowFixMe
          agent.active = false; agent.arrested = true;
        });
      });

      this.board.forEach(agent => {
        
        if (agent.arrested) return;
        if (Math.random() < 0.5) return;

        const randNeighbor = _.sample(this.board.neighbors(agent));
        if (randNeighbor instanceof Board.NullAgent) this.board.swap(agent, randNeighbor);
      });

      this.draw();

    }, 200);
    
  }

  componentWillUnmount() {
    clearInterval(this.drawInterval);
  }

  draw() {

    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    this.board.forEachAll((agent, i) => {
      if (agent instanceof Board.NullAgent) return;
      agent.draw(context, i);
    });

  }

  render() {
    return <canvas ref="canvas" width={this.WIDTH} height={this.HEIGHT} />;
  }
}