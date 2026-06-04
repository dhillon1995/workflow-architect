import { v4 as uuidv4 } from 'uuid';
import type { IRWorkflow, IRNode, IRTrigger } from '@workflow-architect/shared';
import type { N8nWorkflow, N8nNode } from '@workflow-architect/shared';
import { computeLayout, computeDepths } from './layout.js';

function irParamsToRecord(
  params: Array<{ name: string; value?: unknown }>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of params) {
    out[p.name] = p.value;
  }
  return out;
}

function makeCredentials(
  type: string | undefined,
  name: string | undefined,
): Record<string, { id: string; name: string }> | undefined {
  if (!type || !name) return undefined;
  return { [type]: { id: `cred-${uuidv4().slice(0, 8)}`, name } };
}

function buildTriggerNode(trigger: IRTrigger): { node: N8nNode; id: string } {
  const id = `trigger-${uuidv4().slice(0, 8)}`;
  return {
    id,
    node: {
      id,
      name: trigger.label,
      type: trigger.nodeType,
      typeVersion: 1,
      position: [0, 0], // replaced by dagre
      parameters: irParamsToRecord(trigger.parameters),
      credentials: makeCredentials(trigger.credential?.type, trigger.credential?.displayName),
    },
  };
}

function buildStepNode(step: IRNode): { node: N8nNode; id: string } {
  const id = `step-${uuidv4().slice(0, 8)}`;
  return {
    id,
    node: {
      id,
      name: step.label,
      type: step.nodeType,
      typeVersion: 1,
      position: [0, 0],
      parameters: irParamsToRecord(step.parameters),
      credentials: makeCredentials(step.credential?.type, step.credential?.displayName),
    },
  };
}

export function translateToN8n(ir: IRWorkflow): N8nWorkflow {
  // Build nodes
  const { node: triggerNode, id: triggerId } = buildTriggerNode(ir.trigger);

  const stepMap = new Map<string, { node: N8nNode; id: string }>();
  for (const step of ir.steps) {
    stepMap.set(step.id, buildStepNode(step));
  }

  const allNodes = [triggerNode, ...Array.from(stepMap.values()).map((s) => s.node)];

  // Build layout input
  const layoutNodeIds: { id: string; irId: string }[] = [
    { id: triggerId, irId: 'trigger' },
    ...ir.steps.map((s) => ({ id: stepMap.get(s.id)!.id, irId: s.id })),
  ];

  const irIdToN8nId = new Map<string, string>();
  irIdToN8nId.set('trigger', triggerId);
  for (const step of ir.steps) {
    irIdToN8nId.set(step.id, stepMap.get(step.id)!.id);
  }

  // Build layout edges from dependsOn
  const layoutEdges = ir.steps.flatMap((step) => {
    const targetId = irIdToN8nId.get(step.id)!;
    if (step.dependsOn.length === 0) {
      return [{ source: triggerId, target: targetId }];
    }
    return step.dependsOn
      .map((depIrId) => {
        const sourceId = irIdToN8nId.get(depIrId);
        return sourceId ? { source: sourceId, target: targetId } : null;
      })
      .filter((e): e is { source: string; target: string } => e !== null);
  });

  // Compute positions
  const layoutNodes = layoutNodeIds.map((n) => ({ id: n.id }));
  const positions = computeLayout(layoutNodes, layoutEdges);
  const depths = computeDepths(
    layoutNodeIds.map((n) => n.id),
    layoutEdges,
  );

  // Apply positions and depths to nodes
  for (const node of allNodes) {
    const pos = positions.get(node.id);
    if (pos) {
      node.position = [pos.x, pos.y];
      (node as N8nNode & { depth?: number }).depth = depths.get(node.id) ?? 0;
    }
  }

  // Build n8n connections — keyed by node NAME (not id)
  const n8nIdToName = new Map<string, string>(allNodes.map((n) => [n.id, n.name]));

  const connections: N8nWorkflow['connections'] = {};

  for (const edge of layoutEdges) {
    const sourceName = n8nIdToName.get(edge.source);
    const targetName = n8nIdToName.get(edge.target);
    if (!sourceName || !targetName) continue;

    if (!connections[sourceName]) {
      connections[sourceName] = { main: [[]] };
    }
    const mainConn = connections[sourceName]!['main'];
    if (mainConn && mainConn[0]) {
      mainConn[0].push({ node: targetName, type: 'main', index: 0 });
    }
  }

  return {
    name: ir.name,
    nodes: allNodes,
    connections,
    active: false,
    settings: { executionOrder: 'v1' },
    meta: { templateCredsSetupCompleted: false },
  };
}
