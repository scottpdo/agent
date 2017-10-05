import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import CanvasView from './components/CanvasView';
import Intersection from './components/Intersection';
import Workshop from './components/Workshop';

import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <Route path="/main" component={CanvasView} />
        <Route path="/intersection" component={Intersection} />
        <Route path="/workshop" component={Workshop} />
      </div>
    );
  }
}

export default App;
