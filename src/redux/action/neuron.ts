
import actionCreatorFactory from 'typescript-fsa';
import {ConsensusNeuron} from '../../type/neuron';

const actionCreator = actionCreatorFactory();

export const loadNeuron = actionCreator<number>('app/LOAD_NEURON');
export const neuronLoaded = actionCreator<ConsensusNeuron>('app/NEURON_LOADED');
