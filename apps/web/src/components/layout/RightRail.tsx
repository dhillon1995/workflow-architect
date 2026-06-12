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
const MIN_WIDTH = 220;
const MAX_WIDTH = 600;
const COLLAPSED_WIDTH = 40;

const MODE_LABEL: Record<Mode, { no: string; label: string }> = {
  generate: { no: '01', label: 'Generate' },
  visualize: { no: '02', label: 'Visualise' },
  debug: { no: '03', label: 'Debug' },
};

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

  // Right rail: dragging LEFT widens, dragging RIGHT narrows
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
  const { no, label } = MODE_LABEL[mode];

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', flexShrink: 0 }}>
      {/* Resize handle — left edge, only when expanded */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHandleHovered(true)}
          onMouseLeave={() => setHandleHovered(false)}
          title="Drag to resize"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: handleActive ? '12px' : '6px',
            cursor: 'col-resize',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: handleActive ? 'var(--accent-dim)' : 'transparent',
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
      )}

      {/* Rail panel */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_WIDTH : width }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        style={{
          overflow: 'hidden',
          borderLeft: '1px solid var(--line)',
          background: 'var(--panel)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Inner container at expanded width so content doesn't reflow */}
        <div
          style={{
            width: `${width}px`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 10px',
              borderBottom: '1px solid var(--line)',
              flexShrink: 0,
            }}
          >
            <CollapseButton collapsed={collapsed} onClick={() => setCollapsed((c) => !c)} />
            <span className="bp-label bp-label--accent" style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
              Sheet {no}
            </span>
            <span className="bp-label bp-label--bright" style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
              {label}
            </span>
          </div>

          {/* Panel content */}
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
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: 0,
                }}
              >
                {mode === 'generate' && (
                  <>
                    <PromptInput onGenerate={onGenerate} isRunning={isGenerating} onSave={onSaveToHistory} />

                    {/* Status messages */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {isGenerating && generateProgress && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9.5px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                          }}
                        >
                          <Loader2 size={11} className="animate-spin" />
                          {generateProgress}
                        </div>
                      )}

                      {generateSummary && !isGenerating && (
                        <div
                          style={{
                            border: '1px solid var(--line)',
                            borderLeft: '3px solid var(--success)',
                            background: 'var(--paper-deep)',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                            <CheckCircle size={11} style={{ color: 'var(--success)' }} />
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '8.5px',
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'var(--success)',
                              }}
                            >
                              Drafted
                            </span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
                            {generateSummary}
                          </p>
                        </div>
                      )}

                      {generateWarnings.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {generateWarnings.map((w, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '7px',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                color: 'var(--warning)',
                                lineHeight: 1.45,
                              }}
                            >
                              <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: '2px' }} />
                              {w}
                            </div>
                          ))}
                        </div>
                      )}

                      {generateError && <ErrorNote text={generateError} />}
                    </div>
                  </>
                )}

                {mode === 'visualize' && (
                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    <JsonPasteInput onVisualize={onVisualize} />
                  </div>
                )}

                {mode === 'debug' && (
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {!debugDiagnosis ? (
                      <DebugInputs onDiagnose={onDiagnose} isRunning={isDebugging} progress={debugProgress} />
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
                          className="btn-ghost"
                          style={{ padding: '8px 12px', fontSize: '9px', alignSelf: 'flex-start' }}
                        >
                          ← New diagnosis
                        </button>
                      </>
                    )}

                    {debugError && <ErrorNote text={debugError} />}
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

function ErrorNote({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--danger)',
        background: 'var(--danger-dim)',
        border: '1px solid var(--danger)',
        borderLeftWidth: '3px',
        padding: '9px 12px',
        lineHeight: 1.55,
      }}
    >
      {text}
    </div>
  );
}

function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? 'Expand panel' : 'Collapse panel'}
      className="btn-ghost"
      style={{
        flexShrink: 0,
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
    </button>
  );
}
