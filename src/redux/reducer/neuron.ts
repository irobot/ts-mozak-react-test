import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {neuronLoaded} from '../action/neuron';
import {Neuron, Node, ConsensusNeuron, Edge, Vector3} from '../../type/neuron';

export interface NeuronState {
  neuron: Neuron;
}

const INITIAL_NEURON_STATE: NeuronState = {
  neuron: { nodes: [], edges: [] }
};

function convertFromConsensusNeuron(consensusNeuron: ConsensusNeuron): { nodes: Node[], edges: Edge[] } {
  const edges: Edge[] = [];
  const nodes: Node[] = [];
  const nodeMap = new Map<number, Node>();
  consensusNeuron.nodes.forEach(consensusNode => {
    const {x, y, z, n: id} = consensusNode;
    const position: Vector3 = { x, y, z };
    const node: Node = { id, position };
    nodeMap.set(id, node);
    nodes.push(node);
  });
  consensusNeuron.nodes.forEach(consensusNode => {
    const parentNodeId = consensusNode.parent;
    if (!parentNodeId) {
      return;
    }
    const child = nodeMap.get(consensusNode.n);
    const parent = nodeMap.get(parentNodeId);
    if (child && parent) {
      const edge: Edge = { parent, child };
      edges.push(edge);
    }
  });
  return { nodes, edges };
}

const neuronLoadedHandler = (state: NeuronState, consensusNeuron: ConsensusNeuron): NeuronState => {
  const {nodes, edges} = convertFromConsensusNeuron(consensusNeuron);
  return { ...state, nodes, edges };
};

export const neuronReducer =
  reducerWithInitialState(INITIAL_NEURON_STATE)
    .case(neuronLoaded, neuronLoadedHandler)
    .build();
