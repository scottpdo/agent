import React, { Component } from 'react';

let activeIndex = 0;
let highlight = false;

const distance = (a, b) => {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	return Math.sqrt(dx * dx + dy * dy);
};

const angle = (a, b) => {
	return Math.atan2(b.y - a.y, b.x - a.x);
};

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

class Point {
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }
}

class PointSlopeLine {
  
  constructor(point, slope) {
    this.point = point;
    this.slope = slope;
  }
  
  closest(point) {
    
    const c = distance(this.point, point);
    const theta = this.slope - angle(this.point, point);
    const d = c * Math.cos(theta);
    
    const b = new Point(
      this.point.x + d * Math.cos(this.slope),
      this.point.y + d * Math.sin(this.slope)
    );
    
    return b;
  }
}

class Agent extends Point {

	constructor(x, y, cv) {

    super(x, y);
    
		this.r = 10;
		this.cv = cv;
		this.state = cv.state;
    this.color = 'white';

    this.n1 = null;
    this.n2 = null;
    
    this.setNeighbors();

		this.dir = 2 * Math.PI * Math.random(); // angle in radians
		this.vel = 1;
	}
  
  index() {
    return this.state.agents.indexOf(this);
  }
  
  setNeighbors() {
    
    let agents = this.state.agents.filter(agent => this !== agent);
    if (agents.length < 2) return;
    
    this.n1 = random(agents);
    
    // don't use n1 twice
    agents = agents.filter(agent => this.n1 !== agent);
    
    this.n2 = random(agents);
  }

	tick() {

		// update position based on direction and velocity
		this.x += this.vel * Math.cos(this.dir);
		this.y += this.vel * Math.sin(this.dir);
    
    if (this.n1 == null && this.n2 == null) this.setNeighbors();
    if (this.n1 == null && this.n2 == null) return;
    
    const a = angle(this.n1, this.n2) + Math.PI / 2;
    const mid = { x: (this.n1.x + this.n2.x) / 2, y: (this.n1.y + this.n2.y) / 2 };
    const l = new PointSlopeLine(mid, a);
    const c = l.closest(this);
    const d = distance(this, c);
    
    this.dir = angle(this, c);
    
    if (d > 300) {
      this.vel = 1.25;
    } else if (d > 200) {
      this.vel = 1;
    } else if (d > 100) {
      this.vel = 0.75;
    } else {
      this.vel = 0.5; 
    }

		// collision with other agents
		this.state.agents.filter(agent => this !== agent).forEach(neighbor => {
			if (distance(this, neighbor) < 1.4 * (this.r + neighbor.r)) {
				const a = angle(this, neighbor);
				this.dir = -a;
				neighbor.dir = a;
			}
		});

		// bounce?
		if (this.x - 2 * this.r < 0 ) this.dir = 0;
    if (this.x + 2 * this.r > window.innerWidth) this.dir = Math.PI;

		if (this.y - 2 * this.r < 0) this.dir = Math.PI / 2;
    if (this.y + 2 * this.r > window.innerHeight) this.dir = 3 * Math.PI / 2;

		return this;
	}

	draw(context) {
    
    if (highlight && this.index() === activeIndex % (this.state.agents.length - 1)) {
      
      this.color = 'yellow';
      this.n1.color = 'blue';
      this.n2.color = 'blue';
      
      // dotted
      const a = angle(this.n1, this.n2) + Math.PI / 2;
      const mid = { x: (this.n1.x + this.n2.x) / 2, y: (this.n1.y + this.n2.y) / 2 };
      // const l = new PointSlopeLine(mid, a);
      // const c = l.closest(this);
      
      context.strokeStyle = 'white';
      context.lineWidth = 2;
      context.setLineDash([5, 10]);
      
      context.beginPath();
      context.moveTo(mid.x - 2000 * Math.cos(a), mid.y - 2000 * Math.sin(a));
      context.lineTo(mid.x + 2000 * Math.cos(a), mid.y + 2000 * Math.sin(a));
      context.stroke();
    }
    
    context.fillStyle = this.color;
    
		context.beginPath();
    // context.moveTo(this.x + this.r * Math.cos(this.dir), this.y);
    // context.lineTo(this.x, this.y + this.r * Math.sin(this.dir));
    // context.lineTo(this.x, this.y - this.r * Math.sin(this.dir));
		context.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		context.fill();
	}
}

export default class CanvasView extends Component {

	constructor() {
		super();

		this.state = {
      running: true,
			agents: []
		};

		this.tick = this.tick.bind(this);
	}

	componentDidMount() {

    for (let i = 0; i < 70; i++) {
      const agents = this.state.agents;
			let a = new Agent(
        40 + (Math.random() * window.innerWidth - 40), 
        40 + (Math.random() * window.innerHeight - 40), 
        this
      );

      agents.push(a);
      
			this.state = { 
        running: true,
        agents 
      };
    }

		this.tick(0);

		window.addEventListener('keyup', e => {
  
		  // reset all agents' color
		  this.state.agents.forEach(agent => {
		    agent.color = 'white';
		  });
		  
		  // space bar
		  if (e.keyCode === 32) highlight = !highlight;
		  
		  // = sign
		  if (e.keyCode === 187) activeIndex++;
		  
		  // - sign
		  if (e.keyCode === 189) {
		    activeIndex--;
		    if (activeIndex < 0) activeIndex += this.state.agents.length - 1;
		  }
		});
  }
  
  componentWillUnmount() {
    this.setState({ 
      running: false,
      agents: [] 
    });
  }

	tick(t) {

    if (!this.state.running || !this.refs.canvas) return;

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