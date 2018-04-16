// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import IntersectionControls from './IntersectionControls';
import IntersectionAgent from '../agents/IntersectionAgent';

import imgUrl from '../img/clover.png';

const img = document.createElement('img');
img.src = imgUrl;

const THREE = require('three');

type Props = {};
type State = {
    agents: Array<IntersectionAgent>;
    drawingPath: boolean;
    i: number;
};

class Intersection extends Component<Props, State> {

    backgroundBuffer: HTMLCanvasElement = document.createElement('canvas');
    canvas: HTMLCanvasElement;
    hasDrawn: boolean = false;
    running: boolean;
    dim: number;
    speedLimit: number = 5;
    title: string = "Intersection";

    drawBackground: Function;
    draw: Function;
    onClick: Function;
    toggleRunning: Function;
    init: Function;
    controls: Object;

    static capacity = 5;

    constructor() {

        super();

        this.state = {
            agents: [],
            beginPath: false,
            drawingPath: false,
            i: 0
        };

        this.running = true;

        this.controls = {
            addAgents: this.addAgents,
            toggleRunning: this.toggleRunning
        };

        this.backgroundBuffer.width = window.innerWidth;
        this.backgroundBuffer.height = window.innerHeight;
    }

    componentDidMount() {

        document.title = this.title;

        this.canvas = this.refs.canvas;
        this.context = this.canvas.getContext('2d');

        this.init();

        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mousemove', this.onMove);
    }

    init = () => {
        this.draw();
    }

    addAgents = () => {

        if (!this.hasDrawn) return;

        const agents = [];
        const r = Math.round(Math.max(window.innerWidth, window.innerHeight) / 200);

        for (let i = 0; i < Intersection.capacity; i++) {
        
            const agent = new IntersectionAgent(0, 0, r);
            agent.setCanvasView(this);

            let isBlack;

            do {

                agent.x = Math.round(Math.random() * window.innerWidth);
                agent.y = Math.round(Math.random() * window.innerHeight);

                const data = this.backgroundBuffer.getContext('2d').getImageData(agent.x, agent.y, 1, 1).data;
                isBlack = data[0] === 0 && data[1] === 0 && data[2] === 0;

            } while (isBlack);
            
            agents.push(agent);
        }

        this.setState({
            agents: this.state.agents.concat(agents)
        });
    }

    drawBackground = () => {

        const w = window.innerWidth;
        const h = window.innerHeight;

        this.context.clearRect(0, 0, w, h);

        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, w, h);

        this.context.drawImage(this.backgroundBuffer, 0, 0);
    }

    draw = () => {

        if (!this.running) return;

        this.drawBackground();

        this.state.agents.forEach(agent => agent.tick());
        this.state.agents.forEach(agent => agent.draw());

        window.requestAnimationFrame(this.draw);
    }

    toggleRunning = () => {
        this.running = !this.running;
        if (this.running) this.draw();
        this.setState({ i: this.state.i + 1 });
    }

    drawPath = () => {
        this.setState({
            drawingPath: true
        });
    }
    
    onMouseDown = () => {
        this.setState({
            drawingPath: true
        });
    }

    onMouseUp = () => {
        this.setState({
            drawingPath: false
        });
    }

    onMove = (e) => {

        if (!this.state.drawingPath) return;
        
        const context = this.backgroundBuffer.getContext('2d');
        context.fillStyle = 'gray';
        context.beginPath();
        context.arc(e.x, e.y, 60, 0, 2 * Math.PI);
        context.fill();

        this.hasDrawn = true;
    }

    render() {
        return (
            <div style={{overflow: 'hidden'}}>
                <canvas ref="canvas" width={window.innerWidth} height={window.innerHeight} />
                <IntersectionControls controls={this.controls} running={this.running} />
            </div>
        );
    }
}

export default Intersection;