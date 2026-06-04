import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Eye, Bug, Trash2, Copy, Link } from 'lucide-react';

type Mode = 'generate' | 'visualize' | 'debug';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  action: () => void;
  kbd?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: (mode: Mode) => void;
  onClearCanvas: () => void;
  onCopyJson: () => void;
  onOpenConnect: () => void;
  currentMode: Mode;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

export default function CommandPalette({
  isOpen,
  onClose,
  onSwitchMode,
  onClearCanvas,
  onCopyJson,
  onOpenConnect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'mode-generate', label: 'Switch to Generate', icon: Zap, action: () => { onSwitchMode('generate'); onClose(); }, kbd: `${MOD}1` },
    { id: 'mode-visualize', label: 'Switch to Visualize', icon: Eye, action: () => { onSwitchMode('visualize'); onClose(); }, kbd: `${MOD}2` },
    { id: 'mode-debug', label: 'Switch to Debug', icon: Bug, action: () => { onSwitchMode('debug'); onClose(); }, kbd: `${MOD}3` },
    { id: 'clear', label: 'New workflow', description: 'Clear canvas and start fresh', icon: Trash2, action: () => { onClearCanvas(); onClose(); }, kbd: `${MOD}N` },
    { id: 'copy', label: 'Copy workflow JSON', description: 'Copy current workflow to clipboard', icon: Copy, action: () => { onCopyJson(); onClose(); } },
    { id: 'connect', label: 'Connect n8n instance', description: 'Deploy directly to n8n', icon: Link, action: () => { onOpenConnect(); onClose(); } },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 60, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: '20vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              background: 'var(--glass-elevated)',
              backdropFilter: 'var(--glass-blur-elevated)',
              WebkitBackdropFilter: 'var(--glass-blur-elevated)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-inset-top), var(--shadow-lift)',
              zIndex: 70,
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--glass-border)',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text)',
                }}
              />
              <kbd>Esc</kbd>
            </div>

            {/* Command list */}
            <div style={{ maxHeight: '280px', overflow: 'auto', padding: '4px' }}>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-faint)',
                  }}
                >
                  No commands match
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '9px 12px',
                        background: i === selectedIndex ? 'var(--glass-floating)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                    >
                      <Icon size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text)' }}>
                        {cmd.label}
                      </span>
                      {cmd.description && (
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-faint)' }}>
                          {cmd.description}
                        </span>
                      )}
                      {cmd.kbd && <kbd>{cmd.kbd}</kbd>}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
