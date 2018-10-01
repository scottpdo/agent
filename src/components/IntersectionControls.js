// @flow

import React, { Component } from 'react';

let style = {
  background: 'rgba(255, 255, 255, 0.5)',
  cursor: 'move',
  position: 'absolute',
  padding: 15,
  top: 0,
  left: 0
};

type Props = {
  controls: {
    addAgents: Function,
    setBrushSize: Function,
    toggleRunning: Function
  },
  running: boolean
};

type State = {
  x: number,
  y: number
};

export default class IntersectionControls extends Component<Props, State> {

  constructor() {

    super();
    
    this.state = {
      x: 0,
      y: 0
    };
  }

  render() {

    style.top = this.state.x;
    style.left = this.state.y;

    return (
      <div style={style} ref="container">
        <button onClick={this.props.controls.toggleRunning}>
          {this.props.running ? "Pause" : "Play"}
        </button>
        <button onClick={this.props.controls.addAgents}>
          Add Agents
        </button><br />
        <label>Brush size</label>
        <input type="range" min={5} max={100} onChange={this.props.controls.setBrushSize} defaultValue={40} />
      </div>
    );
  }
};