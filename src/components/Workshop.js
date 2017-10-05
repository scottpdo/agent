// @flow

import React, { Component } from 'react';
import WorkshopAgent from '../agents/WorkshopAgent';

import imgUrl from '../img/clover.png';

const img = document.createElement('img');
img.src = imgUrl;

type Props = {};
type State = {
    agents: Array<WorkshopAgent>
};

class Workshop extends Component<Props, State> {

    canvas: HTMLCanvasElement;
    running: boolean;

    drawBackground: Function;
    draw: Function;
    onClick: Function;
    init: Function;

    constructor() {

        super();

        this.state = {
            agents: []
        };

        this.running = true;

        this.init = this.init.bind(this);
        this.onClick = this.onClick.bind(this);
        this.draw = this.draw.bind(this);
        this.drawBackground = this.drawBackground.bind(this);

    }

    componentDidMount() {

        this.canvas = this.refs.canvas;
        this.context = this.canvas.getContext('2d');

        const agents = this.state.agents;
        
        const r = Math.round(Math.max(window.innerWidth, window.innerHeight) / 200);

        while (agents.length < 100) {

            const x = Math.round(Math.random() * window.innerWidth);
            const y = Math.round(Math.random() * window.innerHeight);
            const agent = new WorkshopAgent(x, y, r);
            agent.setContext(this.context);
            
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

                agent.x = Math.round(Math.random() * window.innerWidth);
                agent.y = Math.round(Math.random() * window.innerHeight);

                const data = this.context.getImageData(agent.x, agent.y, 1, 1).data;

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

        const dim = w > h ? h : w;
        const x = w > h ? (w - dim) / 2 : 0;
        const y = w > h ? 0 : (h - dim) / 2;

        this.context.drawImage(img, x, y, dim, dim);
    }

    draw() {

        if (!this.running) return;

        this.drawBackground();

        this.state.agents.forEach(agent => agent.tick());
        this.state.agents.forEach(agent => agent.draw());

        window.requestAnimationFrame(this.draw);
    }
    
    onClick() {
        this.running = !this.running;
        if (this.running) this.draw();
    }

    render() {
        return <canvas ref="canvas" width={window.innerWidth} height={window.innerHeight} />;
    }
}

export default Workshop;