import {Middleware} from 'redux';
import {loadNeuron, neuronLoaded} from '../action/neuron';

const middleware: Middleware =
  ({ getState, dispatch }) => next => action => {

    // Call the next dispatch method in the middleware chain.
    let returnValue = next(action);
    const isLoadAction = (action.type === loadNeuron.type);
    // Only send state changes to be saved if this is not
    // the time at which we initialize the state.
    if (isLoadAction) {
      fetch('/data/inputs/batch_484645000_484645000_1502892188269/recon_uid_70.json')
        .then(response => response.json())
        .then(json => dispatch(neuronLoaded(json)));
    }

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };

export {middleware};
