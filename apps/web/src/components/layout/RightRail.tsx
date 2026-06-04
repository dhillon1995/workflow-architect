import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Loader2, GripVertical } from 'lucide-react';
import type { WorkflowDiagnosis } from '@workflow-architect/shared';
import PromptInput from '../generate/PromptInput.js';
import JsonPasteInput from '../visualize/JsonPasteInput.js';
import DebugInputs from '../debug/DebugInputs.js';
import DiagnosisPanel from '../debug/DiagnosisPanel.js';
import DiffView from '../debug/DiffView.js';

type Mode = 'generate' | 'visualize' | 'debug';

interface RightRailProps {
  mode: Mode;
  isGenerating: boolean;
  generateProgress: string;
  generateSummary: string;
  generateWarnings: string[];
  generateError: string | null;
  onGenerate: (prompt: string) => void;
  onSaveToHistory: () => void;
  onVisualize: (workflow: Record<string, unknown>) => void;
  isDebugging: boolean;
  debugProgress: string;
  debugDiagnosis: WorkflowDiagnosis | null;
  debugOriginal: Record<string, unknown> | null;
  debugFixed: Record<string, unknown> | null;
  debugError: string | null;
  onDiagnose: (workflow: Record<string, unknown>, error: string) => void;
  onApplyFix: (fixed: Record<string, unknown>) => void;
  onDeployFix?: (fixed: Record<string, unknown>) => void;
  canDeploy: boolean;
}

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const COLLAPSED_WIDTH = 44;

export default function RightRail({
  mode,
  isGenerating,
  generateProgress,
  generateSummary,
  generateWarnings,
  generateError,
  onGenerate,
  onSaveToHistory,
  onVisualize,
  isDebugging,
  debugProgress,
  debugDiagnosis,
  debugOriginal,
  debugFixed,
  debugError,
  onDiagnose,
  onApplyFix,
  onDeployFix,
  canDeploy,
}: RightRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragState = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });

  // Global cursor lock during drag
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

  // Right rail: dragging LEFT widens, dragging RIGHT narrows (inverted from LeftRail)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - dragState.current.startX;
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragState.current.startWidth - delta)));
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
  const showTooltip = handleHovered && !isDragging && !collapsed;

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>

      {/* ── Resize handle — left edge, only when expanded ── */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHandleHovered(true)}
          onMouseLeave={() => setHandleHovered(false)}
          style={{
            position: 'absolute',
            left: 0,
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
              transition: 'color 0.15s',
              flexShrink: 0,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* ── "Drag to resize" tooltip — floats to the right of handle, inside rail ── */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            left: '18px',
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

      {/* ── Rail panel ── */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_WIDTH : width }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="glass-surface"
        style={{
          overflow: 'hidden',
          borderLeft: '1px solid var(--glass-border)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Inner container always at expanded width so content doesn't reflow */}
        <div
          style={{
            width: `${width}px`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Collapse / expand button row — always rendered, clips to 44px when collapsed ── */}
          <div
            style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 10px',
              borderBottom: '1px solid var(--glass-border)',
              flexShrink: 0,
            }}
          >
            <CollapseButton
              collapsed={collapsed}
              onClick={() => setCollapsed((c) => !c)}
            />
            {/* Label only visible when expanded — clips away in 44px strip */}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {mode === 'generate' ? 'Generate' : mode === 'visualize' ? 'Visualize' : 'Debug'}
            </span>
          </div>

          {/* ── Panel content — unmounted when collapsed ── */}
          {!collapsed && (
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: 0,
                }}
              >
                {mode === 'generate' && (
                  <>
                    <PromptInput
                      onGenerate={onGenerate}
                      isRunning={isGenerating}
                      onSave={onSaveToHistory}
                    />

                    {/* Status messages — pinned below the expanding textarea */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {isGenerating && generateProgress && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--tint-peach)',
                          }}
                        >
                          <Loader2 size={12} className="animate-spin" />
                          {generateProgress}
                        </div>
                      )}

                      {generateSummary && !isGenerating && (
                        <div
                          className="glass-floating"
                          style={{
                            border: '1px solid var(--glass-border)',
                            borderTopColor: 'var(--glass-border-bright)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 12px',
                            boxShadow: 'var(--shadow-inset-top)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-success)', fontWeight: 600 }}>
                              Generated
                            </span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {generateSummary}
                          </p>
                        </div>
                      )}

                      {generateWarnings.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {generateWarnings.map((w, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                color: 'var(--color-warning)',
                                lineHeight: 1.4,
                              }}
                            >
                              <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: '1px' }} />
                              {w}
                            </div>
                          ))}
                        </div>
                      )}

                      {generateError && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--color-danger)',
                            background: 'rgba(248,113,113,0.06)',
                            border: '1px solid rgba(248,113,113,0.18)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 12px',
                          }}
                        >
                          {generateError}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {mode === 'visualize' && (
                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    <JsonPasteInput onVisualize={onVisualize} />
                  </div>
                )}

                {mode === 'debug' && (
                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {!debugDiagnosis ? (
                      <DebugInputs
                        onDiagnose={onDiagnose}
                        isRunning={isDebugging}
                        progress={debugProgress}
                      />
                    ) : (
                      <>
                        <DiagnosisPanel diagnosis={debugDiagnosis} />

                        {debugOriginal && debugFixed && (
                          <DiffView
                            original={debugOriginal}
                            fixed={debugFixed}
                            onApply={onApplyFix}
                            onDeploy={onDeployFix}
                            canDeploy={canDeploy}
                          />
                        )}

                        <button
                          onClick={() => onDiagnose({}, '')}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '7px 12px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s',
                          }}
                        >
                          ← New diagnosis
                        </button>
                      </>
                    )}

                    {debugError && (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--color-danger)',
                          background: 'rgba(248,113,113,0.06)',
                          border: '1px solid rgba(248,113,113,0.18)',
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 12px',
                        }}
                      >
                        {debugError}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Collapse / expand button ── */
function CollapseButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? 'Expand panel' : 'Collapse panel'}
      style={{
        flexShrink: 0,
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered ? 'rgba(255, 94, 26, 0.12)' : 'var(--glass-floating)',
        border: `1px solid ${hovered ? 'rgba(255,94,26,0.40)' : 'var(--glass-border)'}`,
        borderTopColor: hovered ? 'rgba(255,94,26,0.58)' : 'var(--glass-border-bright)',
        borderRadius: 'var(--radius-xs)',
        cursor: 'pointer',
        color: hovered ? 'var(--tint-peach)' : 'var(--text-muted)',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        boxShadow: 'var(--shadow-inset-top)',
      }}
    >
      {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
    </button>
  );
}
