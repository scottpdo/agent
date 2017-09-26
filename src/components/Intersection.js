// @flow

import React, { Component } from 'react';
import IntersectionAgent from '../agents/IntersectionAgent';

const THREE = require('three');

type Props = {};
type State = {
    agents: Array<IntersectionAgent>
};

export default class Intersection extends Component<Props, State> {

    state = {
        agents: [],
    };

    componentDidMount() {
        let i = 0;
        for (i = 0; i < 70; i++) {
            const agents = this.state.agents;
            let a = new IntersectionAgent(
                40 + (Math.random() * window.innerWidth - 40), 
                40 + (Math.random() * window.innerHeight - 40),
            );
            agents.push(a);
            this.setState({ agents });
        }
    
        this.tick(0);
    }

    tick(t: number) {
        
        const context = this.refs.canvas.getContext('2d');
		context.fillStyle = 'black';
		context.fillRect(0, 0, window.innerWidth, window.innerHeight);

		this.state.agents.forEach(agent => {
			agent.tick().draw(context);
		});

		window.requestAnimationFrame(this.tick.bind(this, t + 1));
    }

    render() {

		const width = window.innerWidth;
		const height = window.innerHeight;

		return <canvas ref="canvas" width={width} height={height} />;
    }
};