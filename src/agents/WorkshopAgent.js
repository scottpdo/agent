// @flow

import _ from 'lodash';
import Agent from './Agent';
import Workshop from '../components/Workshop';

const THREE = require('three');

class Direction {

  value: number;

  static TWO_PI = 2 * Math.PI;

  constructor(value: number) {
    this.set(value);
  }
  
  set(value: number) {
    this.value = value;
    this.normalize();
  }

  normalize() {
    this.value = this.value % Direction.TWO_PI;
    if (this.value < 0) this.value += Direction.TWO_PI;
  }

  add(x: number) {
    this.value += x;
    this.normalize();
  }

  sub(x: number) {
    this.add(-x);
  }
}

export default class WorkshopAgent extends Agent {

  r: number;
  dir: Direction;
  speed: number;
  nearIntersection: boolean;
  intention: number; // 0 = straight, 1 = left, 2 = right
  cv: Workshop;

  static Z = new THREE.Vector3(0, 0, 1);
  static intentions = [0, 0, 1, 2];

  static speedSlow = 1;
  static speedMedium = 2;
  static speedFast = 3;

  constructor(x: number, y: number, r: number) {

    super(x, y, 0);
    
    this.r = r;
    this.dir = new Direction(Math.random() * (2 * Math.PI));
    this.speed = WorkshopAgent.speedMedium;
  }

  setCanvasView(cv: Workshop) {
    this.cv = cv;
  }

  next(): THREE.Vector3 {
    return new THREE.Vector3(
      this.x + this.speed * Math.cos(this.dir.value),
      this.y + this.speed * Math.sin(this.dir.value),
      0
    );
  }

  ahead(): THREE.Vector3 {
    return new THREE.Vector3(
      this.x + 5 * this.r * this.speed * Math.cos(this.dir.value),
      this.y + 5 * this.r * this.speed * Math.sin(this.dir.value),
      0
    );
  }

  scanLeft(): THREE.Vector3 {
    const ahead = this.ahead();
    ahead.sub(this);
    ahead.applyAxisAngle(WorkshopAgent.Z, -0.33);
    ahead.add(this);
    return ahead;
  }

  scanRight(): THREE.Vector3 {
    const ahead = this.ahead();
    ahead.sub(this);
    ahead.applyAxisAngle(WorkshopAgent.Z, 0.33);
    ahead.add(this);
    return ahead;
  }

  // Override
  tick() {

    const origin = this.cv.origin;
    const left = this.scanLeft().add(origin);
    const right = this.scanRight().add(origin);

    const context = this.cv.context;
    const leftData = context.getImageData(left.x, left.y, 1, 1).data;
    const leftIsBlack = leftData[0] === 0 && leftData[1] === 0 && leftData[2] === 0;

    const rightData = context.getImageData(right.x, right.y, 1, 1).data;
    const rightIsBlack = rightData[0] === 0 && rightData[1] === 0 && rightData[2] === 0;

    // turn right
    if (leftIsBlack && !rightIsBlack) this.dir.add(0.2);

    // turn left
    if (!leftIsBlack && rightIsBlack) this.dir.sub(0.2);

    // sharp turn
    if (leftIsBlack && rightIsBlack) {
      this.dir.add(Math.PI / 2);
    }

    // collision with other agents
    // TODO
		// this.cv.state.agents.filter(agent => this !== agent).forEach(neighbor => {
		// 	if (this.distanceTo(neighbor) < 1.4 * (this.r + neighbor.r)) {
		// 		const a = this.angleTo(neighbor);
		// 		this.dir.add(-a);
		// 		neighbor.dir.add(a);
		// 	}
		// });

    const next = this.next();

    this.set(next.x, next.y, 0);

    return this;
  }

  // Override
  draw() {
    
    const context = this.cv.context;
    if (context === null) throw new Error("Agent needs a context to draw!");

    const origin = this.cv.origin;
    const dim = this.cv.dim;

    const center = new THREE.Vector3(dim / 2, dim / 2, 0);

    const onStraightAway = (
      (this.x > 0.43 * dim && this.x < 0.57 * dim) ||
      (this.y > 0.43 * dim && this.y < 0.57 * dim)
    );

    const toCenter = center.clone().sub(this).normalize();
    const toNext = this.next().clone().sub(this).normalize();
    const dot = toNext.dot(toCenter);
    const aimedAtCenter = dot > 0;
    const closeToCenter = this.distanceTo(center) < dim / 4;
    
    // approaching intersection, set an intention --
    // - straight = 0
    // - left = 1
    // - right = 2
    if (!this.nearIntersection && closeToCenter) this.intention = _.sample(WorkshopAgent.intentions);

    this.nearIntersection = closeToCenter;

    if (this.nearIntersection) {

      // assume we're approaching the intersection and slow down
      this.speed = WorkshopAgent.speedSlow;

      // slowly turn left
      if (this.intention === 1) {
        this.dir.sub(0.01);
      } else if (this.intention === 2) {
        this.dir.add(0.01);
      }

      // if departing, speed up
      if (!aimedAtCenter) this.speed = WorkshopAgent.speedFast;
    }

    context.fillStyle = 'white';
    
    // angle toward center
    if (!this.nearIntersection && onStraightAway && aimedAtCenter) {
      // HOW TO DO THIS???
      const c = this.clone().sub(center);
      const angle = Math.atan2(c.y, c.x) + Math.PI;
      const ave = (9 * this.dir.value + angle) / 10;
      this.dir.set(ave);
      context.fillStyle = 'blue';
    }

    // context.fillStyle = onStraightAway ? 'white' : 'yellow';
    // if (this.nearIntersection) {
    //   context.fillStyle = 'red';
    //   if (this.intention === 1) {
    //     context.fillStyle = 'green';
    //   } else if (this.intention === 2) {
    //     context.fillStyle = 'blue';
    //   }
    // }
    
    context.beginPath();
    context.arc(
      origin.x + this.x, 
      origin.y + this.y, 
      this.r, 
      0, 
      2 * Math.PI
    );
    context.fill();

    // draw left and right spots

    // context.fillStyle = 'yellow';
    // context.beginPath();
    // context.arc(this.scanLeft().x, this.scanLeft().y, this.r / 3, 0, 2 * Math.PI);
    // context.fill();

    // context.fillStyle = 'red';
    // context.beginPath();
    // context.arc(this.scanRight().x, this.scanRight().y, this.r / 3, 0, 2 * Math.PI);
    // context.fill();
  }
};