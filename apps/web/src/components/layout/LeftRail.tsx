import { useState, useCallback, useEffect, useRef } from 'react';
import { Clock, Trash2, History, Plus, GripVertical } from 'lucide-react';
import type { HistoryEntry } from '../../hooks/useWorkflowHistory.js';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 300;

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
  const [newHovered, setNewHovered] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragState = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });


  // Apply global cursor + selection lock while dragging
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

  const showTooltip = handleHovered && !isDragging;
  const handleActive = handleHovered || isDragging;

  return (
    <div
      className="glass-surface"
      style={{
        width: `${width}px`,
        flexShrink: 0,
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        // No transition on width — instant feedback during drag
      }}
    >
      {/* History header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '14px 14px 10px',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            background: 'var(--glass-floating)',
            border: '1px solid var(--glass-border)',
            borderTopColor: 'var(--glass-border-bright)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-inset-top)',
          }}
        >
          <History size={11} style={{ color: 'var(--text-muted)' }} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '-0.01em',
          }}
        >
          History
        </span>
      </div>

      {/* New Workflow button */}
      <div style={{ padding: '8px 8px 4px' }}>
        <button
          onClick={onNewWorkflow}
          onMouseEnter={() => setNewHovered(true)}
          onMouseLeave={() => setNewHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            background: newHovered ? '#ff5e1a' : 'var(--glass-floating)',
            border: `1px solid ${newHovered ? '#ff5e1a' : 'var(--glass-border)'}`,
            borderTopColor: newHovered ? '#ff7a3d' : 'var(--glass-border-bright)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
            boxShadow: 'var(--shadow-inset-top)',
            gap: '6px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus
              size={12}
              style={{ color: newHovered ? '#ffffff' : 'var(--text-muted)', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
                color: newHovered ? '#ffffff' : 'var(--text-muted)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              New Workflow
            </span>
          </span>
          <kbd
            style={{
              opacity: newHovered ? 1 : 0,
              transition: 'opacity 0.15s',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: newHovered ? '#ffd5c2' : 'rgba(255, 94, 26, 0.80)',
              background: newHovered ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 94, 26, 0.10)',
              border: `1px solid ${newHovered ? 'rgba(255,255,255,0.30)' : 'rgba(255,94,26,0.25)'}`,
              borderRadius: '4px',
              padding: '1px 5px',
            }}
          >
            {MOD}N
          </kbd>
        </button>
      </div>

      {/* History list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {history.length === 0 ? (
          <div
            style={{
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--glass-floating)',
                border: '1px solid var(--glass-border)',
                borderTopColor: 'var(--glass-border-bright)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                boxShadow: 'var(--shadow-inset-top)',
              }}
            >
              <Clock size={16} style={{ color: 'var(--text-faint)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: 'var(--text-faint)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              No workflows yet
            </span>
          </div>
        ) : (
          history.map((entry) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              onSelect={onHistorySelect}
              onDelete={onHistoryDelete}
            />
          ))
        )}
      </div>

      {/* ─── Resize handle ──────────────────────────────────────────
          Sits on the right border. Faint grip dots in resting state;
          expands + glows orange on hover; shows tooltip label.
          ─────────────────────────────────────────────────────────── */}
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: handleActive ? '14px' : '6px',
          cursor: 'col-resize',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDragging
            ? 'rgba(255, 94, 26, 0.20)'
            : handleHovered
              ? 'rgba(255, 94, 26, 0.10)'
              : 'transparent',
          transition: 'width 0.18s ease, background 0.15s ease',
        }}
      >
        <GripVertical
          size={12}
          style={{
            color: isDragging
              ? '#ff5e1a'
              : handleHovered
                ? 'rgba(255, 94, 26, 0.80)'
                : 'rgba(255, 255, 255, 0.20)',
            transition: 'color 0.15s, opacity 0.15s',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* "Drag to resize" tooltip — sibling of handle, inside LeftRail */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            right: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 30,
            background: 'rgba(14, 10, 16, 0.96)',
            border: '1px solid rgba(255, 94, 26, 0.40)',
            borderTopColor: 'rgba(255, 94, 26, 0.60)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: 'var(--shadow-float)',
            whiteSpace: 'nowrap',
            animation: 'tooltipFadeIn 0.12s ease',
          }}
        >
          <GripVertical size={10} style={{ color: 'rgba(255, 94, 26, 0.60)', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--tint-peach)',
              letterSpacing: '-0.01em',
            }}
          >
            Drag to resize
          </span>
        </div>
      )}
    </div>
  );
}

interface HistoryItemProps {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function HistoryItem({ entry, onSelect, onDelete }: HistoryItemProps) {
  const [rowHovered, setRowHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px',
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'background 0.12s',
        marginBottom: '2px',
        background: rowHovered ? 'var(--glass-floating)' : 'transparent',
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
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '2px',
            letterSpacing: '-0.01em',
          }}
        >
          {entry.workflowName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-faint)' }}>
          <Clock size={9} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px' }}>
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
          background: deleteHovered ? 'rgba(248, 113, 113, 0.12)' : 'none',
          border: 'none',
          cursor: 'pointer',
          color: deleteHovered ? 'var(--color-danger)' : 'var(--text-faint)',
          padding: '2px',
          flexShrink: 0,
          opacity: rowHovered ? 1 : 0,
          transition: 'opacity 0.12s, color 0.12s, background 0.12s',
          borderRadius: 'var(--radius-xs)',
        }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
