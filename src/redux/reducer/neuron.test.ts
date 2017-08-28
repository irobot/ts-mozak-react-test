import {neuronLoadedReducer, NeuronState} from './neuron';
import {ConsensusNode} from '../../type/neuron';
import {Geometry} from 'three';

const makeEmptyState = (): NeuronState => ({
  neuron: { nodes: [], edges: [] },
  branches: [],
  geometry: { segments: new Geometry() }
});

const makeConsensusNode = (id: number, parent?: number): ConsensusNode => ({
  n: id, node_type: 3, x: 0, y: 0, z: 0, r: 1, timestamp: '123456789012', parent
});

const makeConsensusNeuron = (nodes: ConsensusNode[]) => ({
  annotation: {}, nodes
});

const makeConsensusNeuron1 = () => makeConsensusNeuron([
  makeConsensusNode(1),
  makeConsensusNode(2, 1),
  makeConsensusNode(3, 1),
  makeConsensusNode(4, 3)
]);

test('should convert consensus neuron to neuron', () => {
  const {neuron} = neuronLoadedReducer(makeEmptyState(), makeConsensusNeuron1());
  expect(neuron.nodes.length).toBe(4);
  expect(neuron.edges.length).toBe(3);
});
