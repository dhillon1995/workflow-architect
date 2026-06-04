import dagre from '@dagrejs/dagre';

export interface LayoutNode {
  id: string;
  width?: number;
  height?: number;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

export interface Position {
  x: number;
  y: number;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const H_SEP = 80;
const V_SEP = 48;

export function computeLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
): Map<string, Position> {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'LR',
    nodesep: V_SEP,
    ranksep: H_SEP,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.width ?? NODE_WIDTH,
      height: node.height ?? NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const positions = new Map<string, Position>();
  for (const node of nodes) {
    const { x, y } = g.node(node.id);
    if (x !== undefined && y !== undefined) {
      positions.set(node.id, { x: Math.round(x), y: Math.round(y) });
    }
  }

  return positions;
}

/** Compute topological depth for each node (trigger = 0). Used for stagger animation. */
export function computeDepths(
  nodeIds: string[],
  edges: LayoutEdge[],
): Map<string, number> {
  const depths = new Map<string, number>();
  const inEdges = new Map<string, string[]>();

  for (const id of nodeIds) {
    inEdges.set(id, []);
  }
  for (const e of edges) {
    inEdges.get(e.target)?.push(e.source);
  }

  const queue = nodeIds.filter((id) => (inEdges.get(id)?.length ?? 0) === 0);
  for (const id of queue) depths.set(id, 0);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const depth = depths.get(id) ?? 0;
    for (const e of edges) {
      if (e.source === id) {
        const prev = depths.get(e.target) ?? -1;
        if (depth + 1 > prev) {
          depths.set(e.target, depth + 1);
          queue.push(e.target);
        }
      }
    }
  }

  return depths;
}
