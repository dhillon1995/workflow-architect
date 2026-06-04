import { memo, useEffect, useState } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

const CustomEdge = memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const [flowVisible, setFlowVisible] = useState(false);

  useEffect(() => {
    // Reveal the animated flow layer shortly after mount
    const t = setTimeout(() => setFlowVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <g id={id}>
      {/* Base dashed line */}
      <path
        d={edgePath}
        className={`wf-edge${selected ? ' active' : ''}`}
      />
      {/* Animated flow overlay */}
      <path
        d={edgePath}
        className={`wf-edge-flow${flowVisible ? ' visible' : ''}`}
      />
    </g>
  );
});

export default CustomEdge;
