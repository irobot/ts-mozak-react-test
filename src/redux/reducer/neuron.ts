import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {neuronLoaded} from '../action/neuron';
import {Neuron, Node, ConsensusNeuron, Edge, Vector3} from '../../type/neuron';
import {Geometry} from 'three';

export interface NeuronState {
  neuron: Neuron;
  branches: Node[][];
  geometry: { segments: Geometry };
}

const INITIAL_NEURON_STATE: NeuronState = {
  neuron: { nodes: [], edges: [] },
  branches: [],
  geometry: { segments: new Geometry() }
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
  const branches = selectBranches(nodes);
  return { ...state, neuron: { nodes, edges }, branches};
};

const getLeafNodes = (nodes): Node[] => nodes.filter(node => node.children.length === 0);

/**
 * Chop this tree into a number of non-branching segments.
 * @param {Node} first The root of the tree we're processing
 * @param {Node} parentBranch Non-null if first's parent is a branching node,
 *               that is, a node with more than one children.
 * @returns {Node[][]} Array of segments. A segment is an array of nodes.
 */
export const selectBranches = (nodes: Node[]): Node[][] => {
  const nodeMap = new Map<number, Node>();

  // We need all the nodes in the forest, but we only have the roots.
  nodes.forEach(node => nodeMap.set(node.id, node));

  // Get all leaf nodes. These will be the starting nodes
  // for the resulting individual segments.
  const leafNodes = getLeafNodes(nodes);
  const branches: Node[][] = [];

  // Traverse the tree starting from a leaf branch.
  // Keep track o a counter each time we go through a branch node.
  const countPassedThrough = new Map<number, number>();
  const visitCount = (node: Node) => countPassedThrough.get(node.id) || 0;
  const visitsLeft = (node: Node) => node.children.length - visitCount(node);

  while (leafNodes.length > 0) {
      const branch: Node[] = [];
      let node = leafNodes.shift();

      // Subtracting the number of visits from the total number of child nodes
      // gives us the number of child _branches_ not yet added to branches[].
      // If that number is < 2, we can incorporate an otherwise branch node
      // into a flat segment (branch), as all of its child branches have already
      // been processed.
      while (node && (visitsLeft(node) < 2)) {
          branch.push(node);
          // tslint:disable-next-line
          node = node.parent && nodeMap.get(node.parent.id);
      }

      if (node && (visitsLeft(node) > 1)) {
          // Reached a branch, but there are still unexplored
          // descendents.
          // Add node to current segment and update visit counter.
          branch.push(node);
          countPassedThrough.set(node.id, visitCount(node) + 1);
      }

      // Minimum of two nodes, so we can form at least one edge.
      if (branch.length > 1) {
          branches.push(branch);
      }
  }
  return branches;
};

export const neuronReducer =
  reducerWithInitialState(INITIAL_NEURON_STATE)
    .case(neuronLoaded, neuronLoadedReducer)
    .build();
