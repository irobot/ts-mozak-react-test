import {applyMiddleware, combineReducers, createStore} from 'redux';
import {neuronReducer} from './reducer/neuron';
import {middleware} from './middleware/neuron';
import thunk from 'redux-thunk';

const reducers = {
  neuron: neuronReducer
};

const store = createStore(
  combineReducers(reducers),
  applyMiddleware(thunk, middleware)
);

export {store};