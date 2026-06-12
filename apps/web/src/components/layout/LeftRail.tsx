import { useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, Plus, GripVertical, FileText } from 'lucide-react';
import type { HistoryEntry } from '../../hooks/useWorkflowHistory.js';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 264;

interface LeftRailProps {
  history: HistoryEntry[];
  onHistorySelect: (entry: HistoryEntry) => void;
  onHistoryDelete: (id: string) => void;
  onNewWorkflow: () => void;
}

export default function LeftRail({
  history,
  onHistorySelect,
  onHistoryDelete,
  onNewWorkflow,
}: LeftRailProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragState = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - dragState.current.startX;
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragState.current.startWidth + delta)));
      };

      const onUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [width],
  );

  const handleActive = handleHovered || isDragging;

  return (
    <div
      style={{
        width: `${width}px`,
        flexShrink: 0,
        background: 'var(--panel)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Register header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 14px 11px',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}
      >
        <span className="bp-label bp-label--bright">Drawing register</span>
        <span className="bp-label" style={{ fontSize: '8px' }}>
          {history.length > 0 ? String(history.length).padStart(2, '0') : '—'}
        </span>
      </div>

      {/* New sheet button */}
      <div style={{ padding: '10px 10px 6px' }}>
        <button
          onClick={onNewWorkflow}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 10px',
            fontSize: '9px',
            gap: '6px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Plus size={11} style={{ flexShrink: 0 }} />
            New sheet
          </span>
          <kbd style={{ fontSize: '8px' }}>{MOD}N</kbd>
        </button>
      </div>

      {/* History list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 8px' }}>
        {history.length === 0 ? (
          <div
            style={{
              padding: '20px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                border: '1px dashed var(--line-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={14} style={{ color: 'var(--ink-faint)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8.5px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                textAlign: 'center',
                lineHeight: 1.7,
              }}
            >
              No sheets filed yet
            </span>
          </div>
        ) : (
          history.map((entry, i) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              index={history.length - i}
              onSelect={onHistorySelect}
              onDelete={onHistoryDelete}
            />
          ))
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        title="Drag to resize"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: handleActive ? '12px' : '6px',
          cursor: 'col-resize',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDragging
            ? 'var(--accent-dim)'
            : handleHovered
              ? 'var(--accent-dim)'
              : 'transparent',
          transition: 'width 0.18s ease, background 0.15s ease',
        }}
      >
        <GripVertical
          size={11}
          style={{
            color: handleActive ? 'var(--accent)' : 'var(--ink-faint)',
            opacity: handleActive ? 1 : 0.4,
            transition: 'color 0.15s, opacity 0.15s',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

interface HistoryItemProps {
  entry: HistoryEntry;
  index: number;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function HistoryItem({ entry, index, onSelect, onDelete }: HistoryItemProps) {
  const [rowHovered, setRowHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px',
        padding: '7px 8px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        marginBottom: '3px',
        background: rowHovered ? 'var(--panel-2)' : 'transparent',
        borderLeft: rowHovered ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => {
        setRowHovered(false);
        setDeleteHovered(false);
      }}
    >
      <button
        onClick={() => onSelect(entry)}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          padding: 0,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '3px',
            letterSpacing: '-0.01em',
          }}
        >
          {entry.workflowName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', color: 'var(--accent)', letterSpacing: '0.1em' }}>
            WA-{String(index).padStart(3, '0')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', color: 'var(--ink-faint)' }}>
            {new Date(entry.timestamp).toLocaleDateString()}
          </span>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        title="Delete workflow"
        aria-label={`Delete ${entry.workflowName}`}
        onMouseEnter={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
        style={{
          background: deleteHovered ? 'var(--danger-dim)' : 'none',
          border: 'none',
          cursor: 'pointer',
          color: deleteHovered ? 'var(--danger)' : 'var(--ink-faint)',
          padding: '3px',
          flexShrink: 0,
          opacity: rowHovered ? 1 : 0,
          transition: 'opacity 0.12s, color 0.12s, background 0.12s',
        }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
