import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { getNodeIcon, isTrigger, getNodeCategory, type NodeCategory } from './n8n-icons.js';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string;
  preview: string;
  icon: ReturnType<typeof getNodeIcon>;
  isTrigger: boolean;
  nodeCategory: NodeCategory;
  animationDelay: number;
  depth: number;
}

function getPreview(parameters: Record<string, unknown>): string {
  const skip = new Set(['options', 'resource', 'operation']);
  for (const [key, val] of Object.entries(parameters)) {
    if (skip.has(key)) continue;
    if (typeof val === 'string' && val.length > 0) {
      return val.length > 40 ? val.slice(0, 38) + '…' : val;
    }
  }
  const ops = parameters['operation'];
  const res = parameters['resource'];
  if (ops || res) return `${res ?? ''}${res && ops ? ' → ' : ''}${ops ?? ''}`;
  return '';
}

/** Compute topological depth of each node using the connections map. */
function computeDepths(
  nodeNames: string[],
  connections: Record<string, { main?: unknown[][] }>,
): Map<string, number> {
  const depths = new Map<string, number>();
  // Find roots: nodes with no incoming connections
  const hasIncoming = new Set<string>();

  for (const portArr of Object.values(connections)) {
    for (const port of portArr.main ?? []) {
      for (const conn of port as Array<{ node: string }>) {
        hasIncoming.add(conn.node);
      }
    }
  }

  const roots = nodeNames.filter((n) => !hasIncoming.has(n));
  for (const r of roots) depths.set(r, 0);

  const queue = [...roots];
  while (queue.length > 0) {
    const name = queue.shift()!;
    const depth = depths.get(name) ?? 0;
    const conn = connections[name];
    if (!conn?.main) continue;
    for (const port of conn.main) {
      for (const target of port as Array<{ node: string }>) {
        const prev = depths.get(target.node) ?? -1;
        if (depth + 1 > prev) {
          depths.set(target.node, depth + 1);
          queue.push(target.node);
        }
      }
    }
  }

  return depths;
}

export interface ParsedWorkflow {
  nodes: RFNode<WorkflowNodeData>[];
  edges: RFEdge[];
}

export function parseWorkflow(raw: Record<string, unknown>): ParsedWorkflow {
  const nodes = raw['nodes'] as Array<{
    id: string;
    name: string;
    type: string;
    position: [number, number];
    parameters?: Record<string, unknown>;
  }>;

  const connections = (raw['connections'] as Record<string, { main?: unknown[][] }>) ?? {};

  if (!Array.isArray(nodes)) return { nodes: [], edges: [] };

  const nodeNames = nodes.map((n) => n.name);
  const depths = computeDepths(nodeNames, connections);
  const STAGGER = 0.12; // seconds per depth level

  const rfNodes: RFNode<WorkflowNodeData>[] = nodes.map((n) => {
    const depth = depths.get(n.name) ?? 0;
    return {
      id: n.id,
      type: 'workflowNode',
      position: { x: n.position[0], y: n.position[1] },
      data: {
        label: n.name,
        nodeType: n.type,
        preview: getPreview(n.parameters ?? {}),
        icon: getNodeIcon(n.type),
        isTrigger: isTrigger(n.type),
        nodeCategory: getNodeCategory(n.type),
        animationDelay: depth * STAGGER,
        depth,
      },
    };
  });

  const nameToId = new Map(nodes.map((n) => [n.name, n.id]));

  const rfEdges: RFEdge[] = [];
  let edgeIdx = 0;

  for (const [sourceName, connMap] of Object.entries(connections)) {
    const sourceId = nameToId.get(sourceName);
    if (!sourceId) continue;

    for (const portConns of connMap.main ?? []) {
      for (const conn of portConns as Array<{ node: string }>) {
        const targetId = nameToId.get(conn.node);
        if (!targetId) continue;
        rfEdges.push({
          id: `e-${edgeIdx++}`,
          source: sourceId,
          target: targetId,
          type: 'workflowEdge',
        });
      }
    }
  }

  return { nodes: rfNodes, edges: rfEdges };
}
