const THREE = require('three');

export default class Agent extends THREE.Vector3 {

    constructor(x, y, z = 0) {
        super(x, y, z);
    }

    tick() {
        return this;
    }

    draw(context) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        context.fill();
    }
};