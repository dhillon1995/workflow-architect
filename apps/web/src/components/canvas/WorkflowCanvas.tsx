import { useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode.js';
import CustomEdge from './CustomEdge.js';
import EmptyState from './EmptyState.js';
import { parseWorkflow } from '../../lib/parse-workflow.js';

const nodeTypes = { workflowNode: CustomNode };
const edgeTypes = { workflowEdge: CustomEdge };

interface WorkflowCanvasProps {
  workflow: Record<string, unknown> | null;
  onNodeClick?: (nodeId: string) => void;
  onExample?: (prompt: string) => void;
}

function CanvasInner({ workflow, onNodeClick, onExample }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  const prevWorkflowRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (workflow === prevWorkflowRef.current) return;
    prevWorkflowRef.current = workflow;

    if (!workflow) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: rfNodes, edges: rfEdges } = parseWorkflow(workflow);
    setNodes(rfNodes as Node[]);
    setEdges(rfEdges);

    // Fit view after layout settles
    setTimeout(() => {
      void fitView({ padding: 0.15, duration: 400 });
    }, 100);
  }, [workflow, setNodes, setEdges, fitView]);

  const isEmpty = nodes.length === 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable
        nodesConnectable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--paper-deep)' }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={70}
          color="var(--grid-major)"
          id="major"
        />
        <Background
          variant={BackgroundVariant.Lines}
          gap={14}
          color="var(--grid-minor)"
          id="minor"
        />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
      {isEmpty && <EmptyState onExample={onExample} />}
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return <CanvasInner {...props} />;
}
