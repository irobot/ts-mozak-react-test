import * as React from 'react';
import {connect} from 'react-redux';
import {returntypeof} from 'react-redux-typescript';
import './App.css';
import Viewer from '../viewer/Viewer';
import {loadNeuron} from '../../redux/action/neuron';
import {State} from '../../redux/state';

const logo = require('../../logo.svg');

const mapStateToProps = ({ neuron }: State) => ({ neuron });
const dispatchToProps = {
  loadNeuron
};

const stateProps = returntypeof(mapStateToProps);
type AppProps = typeof stateProps & typeof dispatchToProps;

const App: React.StatelessComponent<AppProps> = ({loadNeuron}) => {
  return (
    <div className="App container">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
        <button onClick={e => loadNeuron(70)}>Load 70</button>
        <button onClick={e => loadNeuron(827)}>Load 827</button>
        <button onClick={e => loadNeuron(2933)}>Load 2933</button>
      </div>
      <Viewer name="Hi"/>
    </div>
  );
};

export default connect(mapStateToProps, dispatchToProps)(App);
