import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import CanvasView from './components/CanvasView';
import Workshop from './components/Workshop';

import './App.css';

class Home extends Component {
  render() {
    return (
      <div className="home">
        <h1>Various and Sundry Agent-Based Simulations</h1>
        <Link className="home__link" to="/main">Main</Link>
        <Link className="home__link" to="/workshop">Workshop</Link>
      </div>
    )
  }
};

class App extends Component {
  render() {
    return (
      <div>
        <Route exact path="/" component={Home} />
        <Route path="/main" component={CanvasView} />
        <Route path="/workshop" component={Workshop} />
      </div>
    );
  }
};

export default App;
