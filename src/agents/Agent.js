// @flow

import * as THREE from 'three';

export default class Agent extends THREE.Vector3 {

    constructor(x: number, y: number, z:number = 0) {
        super(x, y, z);
    }

    tick(): Agent {
        return this;
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        context.fill();
    }
};