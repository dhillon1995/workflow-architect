import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { WorkflowNodeData } from '../../lib/parse-workflow.js';

const CustomNode = memo(function CustomNode({
  data,
  selected,
}: NodeProps & { data: WorkflowNodeData }) {
  const Icon = data.icon;
  const categoryClass = `is-${data.nodeCategory}`;

  return (
    <motion.div
      className={`wf-node ${categoryClass}${selected ? ' selected' : ''}`}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: data.animationDelay,
        duration: 0.28,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: data.isTrigger ? 0 : 1 }}
      />

      <div className="wf-node__icon">
        <Icon size={14} strokeWidth={2} />
      </div>

      <div className="wf-node__content">
        <div className="wf-node__label" title={data.label}>
          {data.label}
        </div>
        {data.preview && (
          <div className="wf-node__preview" title={data.preview}>
            {data.preview}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </motion.div>
  );
});

export default CustomNode;
