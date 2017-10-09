import _ from 'lodash';

import React, { Component } from 'react';
import '../css/Society.css';

import Society from '../agents/society/groups/Society';

class SocietyView extends Component {

  constructor() {

    super();

    const year = 2017;
    const startPopulation = 140;

    this.state = {
      society: new Society(year, startPopulation),
      year,
      log: [],
      showDead: false,
      families: [],
      running: false
    };

    this.increment = this.increment.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.draw = this.draw.bind(this);
    this.toggleDead = this.toggleDead.bind(this);
  }

  increment(speed = 60) {

    const year = this.state.year + 1;

    this.state.society.increment(year);

    this.setState({ 
      year
    });
    
    if (this.state.running && this.state.society.year < 2217) {
      window.setTimeout(this.increment.bind(this, speed), speed);
    }
  }

  start() {
    this.setState({
      running: true
    }, this.increment);
  }

  stop() {
    this.setState({
      running: false
    });
  }

  showHistory(citizen) {
    
    let log = [];
    
    citizen.history.forEach((event) => {
      log.push(event.info(citizen));
    });

    log = _.sortBy(log, [(event) => event.year]);

    log = _.concat(
      citizen.fullName() + 
        " (" + citizen.birthYear + "-" + 
        (citizen.alive ? "today" : citizen.deathYear) + 
        ")",
      log
    );

    this.setState({ log });
  }

  toggleDead() {
    this.setState({ showDead: !this.state.showDead });
  }

  draw() {

    const canvas = this.canvas;
    const context = this.context;
    if (_.isNil(canvas) || _.isNil(context)) return;

    let citizens = this.state.society.citizens;

    let height = 2 * citizens.filter(citizen => citizen.alive).length;
    const width = 2;
    let x = 2 * (this.state.society.year - 2017);
    // let y = 0;
    
    citizens = _.sortBy(citizens, [(citizen) => citizen.birthYear]);

    context.fillStyle = '#333';
    context.fillRect(x, 300 - height, width, height);
  }

  componentDidMount() {
    this.canvas = this.refs.timeline;
    this.context = this.canvas.getContext('2d');
    this.canvas.width = 500;
    this.canvas.height = 300;
    this.draw();
  }

  render() {

    const citizens = this.state.society.citizens;

    // const names = _.map(citizens, renderCitizen);
    // const elders = _.compact(_.map(citizens, renderElder)).join(', ');

    let meanAge = 0;
    let alive = citizens.filter(citizen => citizen.alive);
    alive.forEach(citizen => meanAge += citizen.age);
    meanAge = Math.round(meanAge / alive.length);

    let families = this.state.society.families;
    families = _.sortBy(families, [fam => -fam.size]);
    families = _.filter(families, fam => fam.size > 0);
    families = families.map(family => family.info());
    families = _.slice(families, 0, 5).join("\n- ");

    this.draw();

    return (
      <div className="container">
        <i>Year: {this.state.year}</i>
        <div>
          <button className="button" onClick={this.state.running ? this.stop : this.start}>
            {this.state.running ? "Stop" : "Start"}
          </button>
          <button className="button" onClick={this.toggleDead}>
            {this.state.showDead ? "Hide Dead" : "Show Dead"}
          </button>
        </div>
        <div className="population">
          <canvas ref="timeline" />
        </div>
        <div className="info">
          <pre>
          Population:     {alive.length}<br />
          Mean Age:       {meanAge}<br />
          Oldest Citizen: {_.last(alive).age}<br />
          Largest Families:<br />- {families}
          <br /><br />
          {this.state.log.join("\n")}
          </pre>
        </div>
      </div>
    );
  }
}

export default SocietyView;
