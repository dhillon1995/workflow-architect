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

  // Auto-resize: grows with content up to the available panel height, then scrolls inside
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // outerRef is flex:1 — its clientHeight = total available space for textarea + button row
    const maxH = outerRef.current ? outerRef.current.clientHeight - 50 : 800;
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
    <div ref={outerRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
      <div
        style={{
          position: 'relative',
          background: 'var(--glass-floating)',
          backdropFilter: 'var(--glass-blur-floating)',
          WebkitBackdropFilter: 'var(--glass-blur-floating)',
          border: focused
            ? '1px solid rgba(255, 94, 26, 0.50)'
            : '1px solid var(--glass-border)',
          borderTopColor: focused
            ? 'rgba(255, 94, 26, 0.70)'
            : 'var(--glass-border-bright)',
          borderRadius: 'var(--radius-md)',
          boxShadow: focused
            ? 'var(--shadow-inset-top), 0 0 0 1px rgba(255,94,26,0.10), 0 0 18px rgba(255,94,26,0.10)'
            : 'var(--shadow-inset-top)',
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
                fontSize: '13px',
                color: 'var(--text-faint)',
                pointerEvents: 'none',
                lineHeight: 1.6,
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
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.6,
            minHeight: '200px',
            overflowY: 'auto',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
          <kbd>{modLabel}</kbd> + <kbd>Enter</kbd> to generate
        </span>

        <button
          onClick={handleGenerate}
          disabled={value.trim().length < 10 || isRunning}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              Generate
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
