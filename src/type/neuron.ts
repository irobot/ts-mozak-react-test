type Vector3 = {
  x: number, y: number, z: number
};

type Node = {
  id: number,
  position: Vector3,
  children: Node[],
  parent?: Node
};

type Edge = {
  parent: Node,
  child: Node
};

type Neuron = {
  nodes: Node[],
  edges: Edge[]
};

type ConsensusNode = {
  n: number,
  node_type: number,
  x: number,
  y: number,
  z: number,
  r: number,
  timestamp: string,
  parent?: number
};

type ConsensusNeuron = {
  annotation: {},
  nodes: ConsensusNode[]
};

export {ConsensusNeuron, ConsensusNode, Edge, Neuron, Node, Vector3};