import React, { Component } from 'react';
import { Route, Link, Switch } from 'react-router-dom';

import SystemsGame from './components/SystemsGame';
import SocietyView from './components/SocietyView';
import Intersection from './components/Intersection';
import Ovation from './components/Ovation';
import BMIEnvironment from './components/BMIEnvironment';
import CivilEnvironment from './components/CivilEnvironment';

import './App.css';

class Home extends Component {

  title: string = "Agents by Scott"

  componentDidMount() {
    document.title = this.title;
  }

  render() {
    return (
      <div className="home">
        <h1>Various and Sundry Agent-Based Simulations</h1>
        <Link className="home__link" to="/sysgame">Systems Game</Link>
        <Link className="home__link" to="/society">Society (of Families)</Link>
        <Link className="home__link" to="/intersection">Intersection</Link>
        <Link className="home__link" to="/bmi">BMI</Link>
        <Link className="home__link" to="/civil">Civil</Link>
      </div>
    )
  }
};

class NotFound extends Component {
  render() {
    return <div><h1>404 - Back to <Link to="/">main</Link></h1></div>;
  }
}

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/sysgame" component={SystemsGame} />
        <Route path="/society" component={SocietyView} />
        <Route path="/intersection" component={Intersection} />
        <Route path="/ovation" component={Ovation} />
        <Route path="/bmi" component={BMIEnvironment} />
        <Route path="/civil" component={CivilEnvironment} />
        <Route path="*" component={NotFound} />
      </Switch>
    );
  }
};

export default App;
