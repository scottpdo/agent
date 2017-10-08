import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import SystemsGame from './components/SystemsGame';
import SocietyView from './components/SocietyView';
import Intersection from './components/Intersection';

import './App.css';

class Home extends Component {
  render() {
    return (
      <div className="home">
        <h1>Various and Sundry Agent-Based Simulations</h1>
        <Link className="home__link" to="/sysgame">Systems Game</Link>
        <Link className="home__link" to="/society">Society (of Families)</Link>
        <Link className="home__link" to="/intersection">Intersection</Link>
      </div>
    )
  }
};

class App extends Component {
  render() {
    return (
      <div>
        <Route exact path="/" component={Home} />
        <Route path="/sysgame" component={SystemsGame} />
        <Route path="/society" component={SocietyView} />
        <Route path="/intersection" component={Intersection} />
      </div>
    );
  }
};

export default App;
