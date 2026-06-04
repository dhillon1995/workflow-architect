import { motion } from 'framer-motion';
import { Workflow } from 'lucide-react';

export default function EmptyState() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-2)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Workflow
            size={22}
            strokeWidth={1.5}
            style={{ color: 'var(--color-text-faint)' }}
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-faint)',
            letterSpacing: '-0.01em',
          }}
        >
          Describe a workflow to get started
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--color-text-faint)',
            opacity: 0.6,
          }}
        >
          or paste n8n JSON in Visualize mode
        </p>
      </div>
    </motion.div>
  );
}
