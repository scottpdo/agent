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
    agents: Array<IntersectionAgent>,
    i: number
};

class Intersection extends Component<Props, State> {

    canvas: HTMLCanvasElement;
    running: boolean;
    origin: THREE.Vector3;
    dim: number;
    speedLimit: number;
    title: string = "Intersection";

    drawBackground: Function;
    draw: Function;
    onClick: Function;
    toggleRunning: Function;
    init: Function;
    controls: Object;

    static capacity = 50;

    constructor() {

        super();

        this.state = {
            agents: [],
            i: 0
        };

        this.running = true;

        this.init = this.init.bind(this);
        this.onClick = this.onClick.bind(this);
        this.toggleRunning = this.toggleRunning.bind(this);
        this.draw = this.draw.bind(this);
        this.drawBackground = this.drawBackground.bind(this);

        this.controls = {
            toggleRunning: this.toggleRunning
        };
    }

    componentDidMount() {

        document.title = this.title;

        this.canvas = this.refs.canvas;
        this.context = this.canvas.getContext('2d');

        const agents = this.state.agents;
        
        const r = Math.round(Math.max(window.innerWidth, window.innerHeight) / 200);

        while (agents.length < Intersection.capacity) {

            const agent = new IntersectionAgent(0, 0, r);
            agent.setCanvasView(this);
            
            agents.push(agent);
        }

        this.setState({ agents }, this.init);

        this.canvas.addEventListener('click', this.onClick);
    }

    init() {

        // wait for image to load
        if (!img.complete) return window.setTimeout(this.init, 10);

        this.drawBackground();
        
        // coerce all agents onto the clover
        this.state.agents.forEach((agent) => {
            
            const data = this.context.getImageData(agent.x, agent.y, 1, 1).data;
            let isBlack = data[0] === 0 && data[1] === 0 && data[2] === 0;

            while (isBlack) {

                agent.x = Math.round(Math.random() * this.dim);
                agent.y = Math.round(Math.random() * this.dim);

                const data = this.context.getImageData(this.origin.x + agent.x, this.origin.y + agent.y, 1, 1).data;

                isBlack = data[0] === 0 && data[1] === 0 && data[2] === 0;
            }
        });

        this.draw();
    }

    drawBackground() {

        const w = window.innerWidth;
        const h = window.innerHeight;

        this.context.clearRect(0, 0, w, h);

        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, w, h);

        this.dim = w > h ? h : w;
        const x = w > h ? (w - this.dim) / 2 : 0;
        const y = w > h ? 0 : (h - this.dim) / 2;

        this.speedLimit = this.dim * 0.006;

        if (_.isNil(this.origin)) this.origin = new THREE.Vector3(x, y, 0);

        this.context.drawImage(img, x, y, this.dim, this.dim);
    }

    draw() {

        if (!this.running) return;

        this.drawBackground();

        this.state.agents.forEach(agent => agent.tick());
        this.state.agents.forEach(agent => agent.draw());

        window.requestAnimationFrame(this.draw);
    }

    toggleRunning() {
        this.running = !this.running;
        if (this.running) this.draw();
        this.setState({ i: this.state.i + 1 });
    }
    
    onClick() {
    }

    render() {
        return (
            <div>
                <canvas ref="canvas" width={window.innerWidth} height={window.innerHeight} />
                <IntersectionControls controls={this.controls} running={this.running} />
            </div>
        );
    }
}

export default Intersection;