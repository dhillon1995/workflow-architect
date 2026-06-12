import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Sun, Moon } from 'lucide-react';
import WorkflowCanvas from '../components/canvas/WorkflowCanvas.js';
import LeftRail from '../components/layout/LeftRail.js';
import RightRail from '../components/layout/RightRail.js';
import ConnectN8nPanel from '../components/connect/ConnectN8nPanel.js';
import CommandPalette from '../components/command-palette/CommandPalette.js';
import FirstRunHints from '../components/onboarding/FirstRunHints.js';
import { useGenerate } from '../hooks/useGenerate.js';
import { useDebug } from '../hooks/useDebug.js';
import { useWorkflowHistory } from '../hooks/useWorkflowHistory.js';
import { useN8nConnection } from '../hooks/useN8nConnection.js';
import { registerShortcut } from '../lib/keyboard.js';
import { syncEditorTheme } from '../lib/monaco-theme.js';

type Mode = 'generate' | 'visualize' | 'debug';

const MODES: { id: Mode; no: string; label: string }[] = [
  { id: 'generate', no: '01', label: 'Generate' },
  { id: 'visualize', no: '02', label: 'Visualise' },
  { id: 'debug', no: '03', label: 'Debug' },
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const ONBOARD_KEY = 'wa:onboarded';

export default function AppPage() {
  const [mode, setMode] = useState<Mode>('generate');
  const [workflow, setWorkflow] = useState<Record<string, unknown> | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARD_KEY);
    } catch {
      return false;
    }
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('wa-theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    localStorage.setItem('wa-theme', theme);
    syncEditorTheme();
  }, [theme]);

  const dismissHints = useCallback(() => {
    setHintsVisible(false);
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      /* private mode */
    }
  }, []);

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
      dismissHints();
      const wf = await gen.generate(prompt);
      if (wf) {
        setWorkflow(wf);
        const name = (wf['name'] as string | undefined) ?? 'Workflow';
        addEntry({ prompt, workflowName: name, workflow: wf });
      }
    },
    [gen, addEntry, dismissHints],
  );

  const handleVisualize = useCallback(
    (wf: Record<string, unknown>) => {
      dismissHints();
      setWorkflow(wf);
    },
    [dismissHints],
  );

  const handleDiagnose = useCallback(
    async (wf: Record<string, unknown>, err: string) => {
      dismissHints();
      if (!wf || Object.keys(wf).length === 0) {
        dbg.reset();
        return;
      }
      await dbg.diagnose(wf, err);
    },
    [dbg, dismissHints],
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
      if (deleted && deleted.workflow === workflow) {
        setWorkflow(null);
      }
    },
    [history, removeEntry, workflow],
  );

  const handleExample = useCallback(
    (prompt: string) => {
      setMode('generate');
      void handleGenerate(prompt);
    },
    [handleGenerate],
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
        background: 'var(--paper)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          height: '54px',
          borderBottom: '1px solid var(--line-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          flexShrink: 0,
          background: 'var(--paper)',
          gap: '12px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo → landing */}
        <RouterLink
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}
          title="Back to overview"
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '1.5px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '7px', height: '7px', background: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
              }}
            >
              Workflow Architect
            </span>
            <span className="bp-label" style={{ fontSize: '7px' }}>
              Drafting table
            </span>
          </div>
        </RouterLink>

        {/* Mode tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            border: '1px solid var(--line)',
            flexShrink: 0,
            background: 'var(--panel)',
          }}
        >
          {MODES.map(({ id, no, label }, i) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                title={`${label} (${MOD}+${i + 1})`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 16px',
                  background: active ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  borderRight: i < MODES.length - 1 ? '1px solid var(--line)' : 'none',
                  color: active ? 'var(--accent-ink)' : 'var(--ink-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ opacity: active ? 0.7 : 0.45, fontSize: '8px' }}>{no}</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {workflow && (
            <span
              className="bp-label bp-label--bright"
              style={{
                maxWidth: '160px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={(workflow['name'] as string | undefined) ?? 'Untitled'}
            >
              {(workflow['name'] as string | undefined) ?? 'Untitled'}
            </span>
          )}

          <button
            onClick={() => setPaletteOpen(true)}
            title={`Command palette (${MOD}+K)`}
            className="btn-ghost"
            style={{ padding: '6px 10px', fontSize: '9px' }}
          >
            {MOD} K
          </button>

          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Switch to Vellum (light)' : 'Switch to Cyanotype (dark)'}
            className="btn-ghost"
            style={{ padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>

          <button
            onClick={() => setConnectOpen(true)}
            className="btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 12px',
              fontSize: '9px',
              ...(connection
                ? {
                    borderColor: 'var(--success)',
                    color: 'var(--success)',
                    background: 'var(--success-dim)',
                  }
                : {}),
            }}
          >
            <Link size={11} />
            {connection ? 'Connected' : 'Connect n8n'}
          </button>
        </div>
      </div>

      {/* Mobile banner */}
      {isMobile && (
        <div
          style={{
            background: 'var(--accent-dim)',
            borderBottom: '1px solid var(--line)',
            padding: '7px 16px',
            textAlign: 'center',
          }}
        >
          <span className="bp-label bp-label--accent" style={{ letterSpacing: '0.1em' }}>
            Full drafting available on desktop — canvas is view-only on mobile
          </span>
        </div>
      )}

      {/* ── Three-pane layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftRail
          history={history}
          onHistorySelect={handleHistorySelect}
          onHistoryDelete={handleHistoryDelete}
          onNewWorkflow={handleNewWorkflow}
        />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <ReactFlowProvider>
            <WorkflowCanvas workflow={workflow} onExample={handleExample} />
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

      {/* First-run drafting notes — hidden on mobile where anchors don't fit */}
      {!isMobile && <FirstRunHints visible={hintsVisible} onDismiss={dismissHints} />}

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
