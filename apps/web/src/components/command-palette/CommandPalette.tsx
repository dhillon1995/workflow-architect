import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Eye, Bug, Trash2, Copy, Link } from 'lucide-react';
import Ticks from '../ui/Ticks.js';

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
    { id: 'mode-visualize', label: 'Switch to Visualise', icon: Eye, action: () => { onSwitchMode('visualize'); onClose(); }, kbd: `${MOD}2` },
    { id: 'mode-debug', label: 'Switch to Debug', icon: Bug, action: () => { onSwitchMode('debug'); onClose(); }, kbd: `${MOD}3` },
    { id: 'clear', label: 'New sheet', description: 'Clear canvas and start fresh', icon: Trash2, action: () => { onClearCanvas(); onClose(); }, kbd: `${MOD}N` },
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
            style={{
              position: 'fixed',
              inset: 0,
              background: 'color-mix(in srgb, var(--paper-deep) 70%, transparent)',
              zIndex: 60,
              backdropFilter: 'blur(3px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: '18vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              background: 'var(--paper)',
              border: '1px solid var(--line-strong)',
              boxShadow: 'var(--shadow-lift)',
              zIndex: 70,
            }}
          >
            <Ticks color="var(--accent-line)" />
            {/* Search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '13px 16px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <Search size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
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
                  fontSize: '11px',
                  color: 'var(--ink)',
                }}
              />
              <kbd>Esc</kbd>
            </div>

            {/* Command list */}
            <div style={{ maxHeight: '280px', overflow: 'auto', padding: '5px' }}>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-faint)',
                  }}
                >
                  No commands match
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  const active = i === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '11px',
                        width: '100%',
                        padding: '9px 12px',
                        background: active ? 'var(--accent-dim)' : 'transparent',
                        border: 'none',
                        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s, border-color 0.1s',
                      }}
                    >
                      <Icon size={12} style={{ color: active ? 'var(--accent)' : 'var(--ink-faint)', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink)' }}>
                        {cmd.label}
                      </span>
                      {cmd.description && (
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', color: 'var(--ink-faint)' }}>
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
