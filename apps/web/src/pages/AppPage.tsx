import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Link, Zap, Eye, Bug, Sun, Moon } from 'lucide-react';
import WorkflowCanvas from '../components/canvas/WorkflowCanvas.js';
import LeftRail from '../components/layout/LeftRail.js';
import RightRail from '../components/layout/RightRail.js';
import ConnectN8nPanel from '../components/connect/ConnectN8nPanel.js';
import CommandPalette from '../components/command-palette/CommandPalette.js';
import { useGenerate } from '../hooks/useGenerate.js';
import { useDebug } from '../hooks/useDebug.js';
import { useWorkflowHistory } from '../hooks/useWorkflowHistory.js';
import { useN8nConnection } from '../hooks/useN8nConnection.js';
import { registerShortcut } from '../lib/keyboard.js';

type Mode = 'generate' | 'visualize' | 'debug';

const MODES: { id: Mode; label: string; Icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'generate', label: 'Generate', Icon: Zap },
  { id: 'visualize', label: 'Visualize', Icon: Eye },
  { id: 'debug', label: 'Debug', Icon: Bug },
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

export default function AppPage() {
  const [mode, setMode] = useState<Mode>('generate');
  const [workflow, setWorkflow] = useState<Record<string, unknown> | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('wa-theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    localStorage.setItem('wa-theme', theme);
  }, [theme]);

  const gen = useGenerate();
  const dbg = useDebug();
  const { history, addEntry, removeEntry } = useWorkflowHistory();
  const { connection, deployWorkflow } = useN8nConnection();

  const handleNewWorkflow = useCallback(() => {
    setWorkflow(null);
    setMode('generate');
  }, []);

  useEffect(() => {
    const unsubs = [
      registerShortcut('mod+k', () => setPaletteOpen(true)),
      registerShortcut('mod+1', () => setMode('generate')),
      registerShortcut('mod+2', () => setMode('visualize')),
      registerShortcut('mod+3', () => setMode('debug')),
      registerShortcut('mod+n', handleNewWorkflow),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [handleNewWorkflow]);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      const wf = await gen.generate(prompt);
      if (wf) {
        setWorkflow(wf);
        const name = (wf['name'] as string | undefined) ?? 'Workflow';
        addEntry({ prompt, workflowName: name, workflow: wf });
      }
    },
    [gen, addEntry],
  );

  const handleVisualize = useCallback((wf: Record<string, unknown>) => {
    setWorkflow(wf);
  }, []);

  const handleDiagnose = useCallback(
    async (wf: Record<string, unknown>, err: string) => {
      if (!wf || Object.keys(wf).length === 0) {
        dbg.reset();
        return;
      }
      await dbg.diagnose(wf, err);
    },
    [dbg],
  );

  const handleApplyFix = useCallback((fixed: Record<string, unknown>) => {
    setWorkflow(fixed);
  }, []);

  const handleDeployFix = useCallback(
    async (fixed: Record<string, unknown>) => {
      await deployWorkflow(fixed);
    },
    [deployWorkflow],
  );

  const handleSaveToHistory = useCallback(() => {
    if (!workflow) return;
    const name = (workflow['name'] as string | undefined) ?? 'Workflow';
    addEntry({ prompt: name, workflowName: name, workflow });
  }, [workflow, addEntry]);

  const handleHistorySelect = useCallback(
    (entry: import('../hooks/useWorkflowHistory.js').HistoryEntry) => {
      setWorkflow(entry.workflow);
      setMode('generate');
    },
    [],
  );

  const handleHistoryDelete = useCallback(
    (id: string) => {
      const deleted = history.find((e) => e.id === id);
      removeEntry(id);
      // If the deleted workflow is the one on the canvas, clear it.
      if (deleted && deleted.workflow === workflow) {
        setWorkflow(null);
      }
    },
    [history, removeEntry, workflow],
  );

  async function handleCopyJson() {
    if (workflow) await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--base-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: '54px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          background: 'var(--glass-surface)',
          backdropFilter: 'var(--glass-blur-surface)',
          WebkitBackdropFilter: 'var(--glass-blur-surface)',
          boxShadow: 'var(--shadow-inset-top)',
          gap: '12px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              background: '#ff5e1a',
              border: '1px solid #ff5e1a',
              borderTopColor: '#ff7a3d',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-inset-top), 0 4px 12px rgba(255, 94, 26, 0.25)',
            }}
          >
            <span style={{ color: '#000000', fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>W</span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            Workflow Architect
          </span>
        </div>

        {/* Mode pill tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--glass-elevated)',
            border: '1px solid var(--glass-border)',
            borderTopColor: 'var(--glass-border-bright)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            gap: '2px',
            flexShrink: 0,
            boxShadow: 'var(--shadow-inset-top)',
          }}
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  background: active ? '#ff5e1a' : 'transparent',
                  border: active ? '1px solid #ff5e1a' : '1px solid transparent',
                  borderTopColor: active ? '#ff7a3d' : 'transparent',
                  borderRadius: 'var(--radius-pill)',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: active
                    ? 'var(--shadow-inset-top), 0 4px 14px rgba(255, 94, 26, 0.30)'
                    : 'none',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {workflow && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--text-faint)',
                maxWidth: '160px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {(workflow['name'] as string | undefined) ?? 'Untitled'}
            </span>
          )}

          <button
            onClick={() => setPaletteOpen(true)}
            title={`Command palette (${MOD}K)`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'var(--glass-floating)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-inset-top)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,94,26,0.35)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--tint-peach)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            {MOD}K
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              background: 'var(--glass-floating)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
              boxShadow: 'var(--shadow-inset-top)',
            }}
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          <button
            onClick={() => setConnectOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: connection ? 'rgba(74, 222, 128, 0.08)' : 'var(--glass-floating)',
              border: `1px solid ${connection ? 'rgba(74,222,128,0.28)' : 'var(--glass-border)'}`,
              borderTopColor: connection ? 'rgba(74,222,128,0.4)' : 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              color: connection ? 'var(--color-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-inset-top)',
            }}
          >
            <Link size={12} />
            {connection ? 'Connected' : 'Connect n8n'}
          </button>
        </div>
      </div>

      {/* Mobile banner */}
      {isMobile && (
        <div
          style={{
            background: 'var(--accent-lavender)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '8px 16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Full editing available on desktop. Canvas is view-only on mobile.
        </div>
      )}

      {/* Three-pane layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftRail
          history={history}
          onHistorySelect={handleHistorySelect}
          onHistoryDelete={handleHistoryDelete}
          onNewWorkflow={handleNewWorkflow}
        />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <ReactFlowProvider>
            <WorkflowCanvas workflow={workflow} />
          </ReactFlowProvider>
        </div>

        <RightRail
          mode={mode}
          isGenerating={gen.status === 'running'}
          generateProgress={gen.progress}
          generateSummary={gen.summary}
          generateWarnings={gen.warnings}
          generateError={gen.error}
          onGenerate={handleGenerate}
          onSaveToHistory={handleSaveToHistory}
          onVisualize={handleVisualize}
          isDebugging={dbg.status === 'running'}
          debugProgress={dbg.progress}
          debugDiagnosis={dbg.diagnosis}
          debugOriginal={dbg.original}
          debugFixed={dbg.fixed}
          debugError={dbg.error}
          onDiagnose={handleDiagnose}
          onApplyFix={handleApplyFix}
          onDeployFix={connection ? handleDeployFix : undefined}
          canDeploy={!!connection}
        />
      </div>

      <ConnectN8nPanel isOpen={connectOpen} onClose={() => setConnectOpen(false)} />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSwitchMode={setMode}
        onClearCanvas={handleNewWorkflow}
        onCopyJson={() => void handleCopyJson()}
        onOpenConnect={() => setConnectOpen(true)}
        currentMode={mode}
      />
    </div>
  );
}
