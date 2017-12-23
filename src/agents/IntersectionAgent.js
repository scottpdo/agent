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

    const origin = this.cv.origin;
    const dim = this.cv.dim;
    const center = new THREE.Vector3(dim / 2, dim / 2, 0);

    // various vectors and values...
    const toCenter = center.clone().sub(this).normalize();
    const toNext = this.next().clone().sub(this).normalize();
    const dot = toNext.dot(toCenter);
    const aimedAtCenter = dot > 0;
    const closeToCenter = this.distanceTo(center) < dim / 4;

    const onStraightAway = (
      (this.x > 0.43 * dim && this.x < 0.57 * dim) ||
      (this.y > 0.43 * dim && this.y < 0.57 * dim)
    );

    // left/right in *screen* coordinates (to get pixel data)
    const left = this.scanLeft().add(origin);
    const right = this.scanRight().add(origin);

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

    // if approaching intersection, set an intention --
    // - straight = 0
    // - left = 1
    // - right = 2
    if (!this.nearIntersection && closeToCenter) this.intention = _.sample(IntersectionAgent.intentions);
    
    this.nearIntersection = closeToCenter;

    if (this.nearIntersection) {

      // assume we're approaching the intersection and slow down
      this.slowDown();

      // slowly turn left
      if (this.intention === 1) {
        this.dir.sub(0.01);
      } else if (this.intention === 2) {
        this.dir.add(0.01);
      }
    }

    // if departing, speed up
    if (!aimedAtCenter || !this.nearIntersection) this.speedUp();

    // if not near the intersection but aimed toward it
    // and on a straightaway, veer toward the center
    if (!this.nearIntersection && onStraightAway && aimedAtCenter) {
      const c = this.clone().sub(center);
      const angle = Math.atan2(c.y, c.x) + Math.PI;
      const ave = (9 * this.dir.value + angle) / 10;
      this.dir.set(ave);
    }

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
    const origin = this.cv.origin;

    context.save();

    context.fillStyle = 'white';
    
    context.beginPath();

    let a = this.next(2 * this.r);
    context.moveTo(origin.x + a.x, origin.y + a.y);

    a = this.next(1.2 * this.r);

    a.sub(this);
    a.applyAxisAngle(IntersectionAgent.Z, 3 * Math.PI / 4);
    a.add(this);

    context.lineTo(origin.x + a.x, origin.y + a.y);

    a.sub(this);
    a.applyAxisAngle(IntersectionAgent.Z, -1.5 * Math.PI);
    a.add(this);

    context.lineTo(origin.x + a.x, origin.y + a.y);

    context.fill();

    // context.fillStyle = 'red';
    // context.beginPath();
    // context.arc(
    //   origin.x + this.x, 
    //   origin.y + this.y, 
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
    //   origin.x + ahead.x,
    //   origin.y + ahead.y,
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