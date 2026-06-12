import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * First-visit drafting notes. Two annotation callouts that explain the
 * layout, then melt away — on dismissal or on the user's first action.
 */
interface FirstRunHintsProps {
  visible: boolean;
  onDismiss: () => void;
}

function Note({
  no,
  body,
  style,
  delay,
  onDismiss,
  last,
}: {
  no: string;
  body: string;
  style: React.CSSProperties;
  delay: number;
  onDismiss: () => void;
  last?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        zIndex: 30,
        background: 'var(--paper)',
        border: '1px solid var(--accent-line)',
        boxShadow: 'var(--shadow-float)',
        maxWidth: '250px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          borderBottom: '1px dashed var(--accent-line)',
        }}
      >
        <span className="bp-label bp-label--accent">Note {no}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss hint"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-faint)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
          }}
        >
          <X size={11} />
        </button>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
          {body}
        </p>
        {last && (
          <button
            onClick={onDismiss}
            className="btn-ghost"
            style={{ marginTop: '10px', padding: '5px 10px', fontSize: '8.5px' }}
          >
            Got it
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function FirstRunHints({ visible, onDismiss }: FirstRunHintsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <Note
            no="1"
            body="Three modes share one canvas — Generate drafts from plain English, Visualise renders pasted JSON, Debug repairs broken workflows."
            style={{ top: '64px', left: '50%', transform: 'translateX(-50%)' }}
            delay={0.6}
            onDismiss={onDismiss}
          />
          <Note
            no="2"
            body="Describe your automation in this panel, then press Ctrl+Enter. The drafted workflow lands on the canvas in seconds."
            style={{ top: '300px', right: '360px' }}
            delay={1.1}
            onDismiss={onDismiss}
            last
          />
        </>
      )}
    </AnimatePresence>
  );
}
