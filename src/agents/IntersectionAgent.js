// @flow

import _ from 'lodash';
import * as THREE from 'three';
import Agent from './Agent';

import Intersection from '../components/Intersection';
import Direction from './Direction';

export default class IntersectionAgent extends Agent {

  r: number;
  dir: Direction;
  speed: number;
  nearIntersection: boolean;
  intention: number; // 0 = straight, 1 = left, 2 = right
  cv: Intersection;

  static Z = new THREE.Vector3(0, 0, 1);
  static intentions = [0, 0, 1, 2];

  constructor(x: number, y: number, r: number) {

    super(x, y, 0);
    
    this.r = r;
    this.dir = new Direction(Math.random() * (2 * Math.PI));
    this.speed = 0;
  }

  setCanvasView(cv: Intersection) {
    this.cv = cv;
    this.speed = this.defaultSpeed();
  }

  defaultSpeed(): number {
    if (_.isNil(this.cv)) throw new Error("Must have an Intersection to know the speed limit!");
    return this.cv.speedLimit / 3;
  }

  speedUp() {
    // this.speed = this.cv.speedLimit;
  }

  slowDown() {
    // this.speed = this.defaultSpeed() / 2;
  }

  next(factor:number = this.speed): THREE.Vector3 {
    return new THREE.Vector3(
      this.x + factor * Math.cos(this.dir.value),
      this.y + factor * Math.sin(this.dir.value),
      0
    );
  }

  ahead(): THREE.Vector3 {
    return new THREE.Vector3(
      this.x + 5 * this.r * Math.cos(this.dir.value),
      this.y + 5 * this.r * Math.sin(this.dir.value),
      0
    );
  }

  scanLeft(): THREE.Vector3 {
    const ahead = this.ahead();
    ahead.sub(this);
    ahead.applyAxisAngle(IntersectionAgent.Z, -0.33);
    ahead.add(this);
    return ahead;
  }

  scanRight(): THREE.Vector3 {
    const ahead = this.ahead();
    ahead.sub(this);
    ahead.applyAxisAngle(IntersectionAgent.Z, 0.33);
    ahead.add(this);
    return ahead;
  }

  // Override
  tick() {

    // left/right in *screen* coordinates (to get pixel data)
    const left = this.scanLeft();
    const right = this.scanRight();

    const context = this.cv.context;
    const leftData = context.getImageData(left.x, left.y, 1, 1).data;
    const leftIsBlack = leftData[0] === 0 && leftData[1] === 0 && leftData[2] === 0;

    const rightData = context.getImageData(right.x, right.y, 1, 1).data;
    const rightIsBlack = rightData[0] === 0 && rightData[1] === 0 && rightData[2] === 0;

    // reset speed
    this.speed = this.defaultSpeed();

    // turn right
    if (leftIsBlack && !rightIsBlack) this.dir.add(0.2);

    // turn left
    if (!leftIsBlack && rightIsBlack) this.dir.sub(0.2);

    // if about to run off the road, make a sharp turn
    if (leftIsBlack && rightIsBlack) this.dir.add(Math.PI / 2);

    let step = new THREE.Vector3();

    // collision detection
		this.cv.state.agents.filter(agent => this !== agent).forEach(neighbor => {
      
      // step away from
      if (this.distanceTo(neighbor) < 1.4 * (this.r + neighbor.r)) {
        const away = this.clone().sub(neighbor);
        away.multiplyScalar(0.1);
        step.add(away);
      }
    });

    // finally, set the new position
    const next = this.next().clone().add(step);
    this.set(next.x, next.y, 0);

    return this;
  }

  // Override
  draw() {
    
    const context = this.cv.context;

    context.save();

    context.fillStyle = 'white';
    
    context.beginPath();

    let a = this.next(2 * this.r);
    context.moveTo(a.x, a.y);

    a = this.next(1.2 * this.r);

    a.sub(this);
    a.applyAxisAngle(IntersectionAgent.Z, 3 * Math.PI / 4);
    a.add(this);

    context.lineTo(a.x, a.y);

    a.sub(this);
    a.applyAxisAngle(IntersectionAgent.Z, -1.5 * Math.PI);
    a.add(this);

    context.lineTo(a.x, a.y);

    context.fill();

    // context.fillStyle = 'red';
    // context.beginPath();
    // context.arc(
    //   this.x, 
    //   this.y, 
    //   this.r / 2, 
    //   0, 
    //   2 * Math.PI
    // );
    // context.fill();

    // draw ahead circle
    // context.globalAlpha = 0.4;
    // context.beginPath();
    // context.fillStyle = 'yellow';
    // const ahead = this.ahead();
    // context.arc(
    //   ahead.x,
    //   ahead.y,
    //   1.4 * 2 * this.r,
    //   0, 2 * Math.PI
    // );
    // context.fill();

    // draw left and right spots

    // context.fillStyle = 'yellow';
    // context.beginPath();
    // context.arc(this.scanLeft().x, this.scanLeft().y, this.r / 3, 0, 2 * Math.PI);
    // context.fill();

    // context.fillStyle = 'red';
    // context.beginPath();
    // context.arc(this.scanRight().x, this.scanRight().y, this.r / 3, 0, 2 * Math.PI);
    // context.fill();

    context.restore();
  }
};