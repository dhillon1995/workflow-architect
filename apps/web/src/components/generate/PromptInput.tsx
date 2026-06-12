import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

const EXAMPLES = [
  'When a Typeform is submitted, summarise with Claude and post to #leads in Slack…',
  'Every Monday at 9am, fetch open HubSpot deals and email a digest…',
  'When a Stripe payment succeeds, log it to Airtable and notify #payments…',
  'When a GitHub issue is labelled "bug", create a Linear ticket…',
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isRunning: boolean;
  onSave?: () => void;
}

export default function PromptInput({ onGenerate, isRunning, onSave }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [ghostIndex, setGhostIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGhostIndex((i) => (i + 1) % EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize: grows with content up to the available panel height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxH = outerRef.current ? outerRef.current.clientHeight - 80 : 800;
    el.style.height = Math.max(100, Math.min(el.scrollHeight, maxH)) + 'px';
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  }

  function handleGenerate() {
    const trimmed = value.trim();
    if (trimmed.length < 10 || isRunning) return;
    onGenerate(trimmed);
  }

  const showGhost = value.length === 0 && !isRunning;
  const modLabel = isMac ? '⌘' : 'Ctrl';

  return (
    <div ref={outerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
      <span className="bp-label">Specification — plain English</span>

      <div
        style={{
          position: 'relative',
          background: 'var(--paper-deep)',
          border: focused ? '1px solid var(--accent-line)' : '1px solid var(--line)',
          boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
      >
        <AnimatePresence mode="wait">
          {showGhost && (
            <motion.div
              key={ghostIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                right: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                color: 'var(--ink-faint)',
                pointerEvents: 'none',
                lineHeight: 1.7,
                cursor: 'text',
              }}
              onClick={() => textareaRef.current?.focus()}
            >
              {EXAMPLES[ghostIndex]}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isRunning}
          rows={3}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '12px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            color: 'var(--ink)',
            lineHeight: 1.7,
            minHeight: '180px',
            overflowY: 'auto',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
          <kbd>{modLabel}</kbd> + <kbd>Enter</kbd>
        </span>

        <button
          onClick={handleGenerate}
          disabled={value.trim().length < 10 || isRunning}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 16px',
            fontSize: '10px',
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Drafting…
            </>
          ) : (
            <>
              Draft workflow
              <ArrowRight size={12} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
