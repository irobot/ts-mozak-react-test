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
    const node: Node = { id, position, children: [] };
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
      child.parent = parent;
      const edge: Edge = { parent, child };
      edges.push(edge);
      parent.children.push(child);
    }
  });
  return { nodes, edges };
}

export const neuronLoadedReducer = (state: NeuronState, consensusNeuron: ConsensusNeuron): NeuronState => {
  const {nodes, edges} = convertFromConsensusNeuron(consensusNeuron);
  return { ...state, neuron: { nodes, edges }};
};

const getLeafNodes = nodes => nodes.filter(node => node.children === 0);

export const selectBranches = (nodes: Node[]) => {
  const leafNodes = getLeafNodes(nodes);
  const branches: Node[][] = [];

  // Traverse the tree starting from a leaf branch.
  // Increment a counter each time we go through a branch node.
  const countPassedThrough = new Map<number, number>();

  while (leafNodes.length > 0) {
    const branch: Node[] = [];
    let node = leafNodes.shift();

    // This is a leaf node, so we could not have visited that node before
    let nodeVisitedCount = 0;
    // Subtracting the number of visits from the total number of child nodes
    // gives us the number of child _branches_ not yet added to branches[].
    // If that number is < 2, we can incorporate an otherwise branch node
    // into a flat segment (branch), as all of its child branches have already
    // been processed.
    while ((node.children.length - nodeVisitedCount) < 2) {
      branch.push(node);
      if (node.parent) {
        node = node.parent;
        nodeVisitedCount = countPassedThrough.get(node.id) || 0;
        if (node.children.length > 1) {
          countPassedThrough.set(node.id, nodeVisitedCount + 1);
        }
      } else {
        break;
      }
    }
    if (branch.length) {
      branches.push(branch);
    }
  }
  return branches;
};

export const neuronReducer =
  reducerWithInitialState(INITIAL_NEURON_STATE)
    .case(neuronLoaded, neuronLoadedReducer)
    .build();
