import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Bug, Loader2, AlertCircle } from 'lucide-react';

interface DebugInputsProps {
  onDiagnose: (workflow: Record<string, unknown>, error: string) => void;
  isRunning: boolean;
  progress?: string;
}

export default function DebugInputs({ onDiagnose, isRunning, progress }: DebugInputsProps) {
  const [workflowJson, setWorkflowJson] = useState('');
  const [errorText, setErrorText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  function handleDiagnose() {
    setParseError(null);
    if (!workflowJson.trim() || !errorText.trim()) {
      setParseError('Both workflow JSON and error message are required.');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(workflowJson);
      if (typeof parsed !== 'object' || parsed === null) throw new Error();
      onDiagnose(parsed as Record<string, unknown>, errorText.trim());
    } catch {
      setParseError('Invalid workflow JSON.');
    }
  }

  const editorOptions = {
    fontSize: 11,
    fontFamily: '"IBM Plex Mono", "Cascadia Code", monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    padding: { top: 8, bottom: 8 },
    renderLineHighlight: 'none' as const,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: { useShadows: false, verticalScrollbarSize: 4 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
        }}
      >
        Paste your broken workflow JSON + error message
      </div>

      {/* Workflow JSON */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '4px', minHeight: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Workflow JSON
        </span>
        <div
          style={{
            flex: 1,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            minHeight: '160px',
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="json"
            value={workflowJson}
            onChange={(v) => setWorkflowJson(v ?? '')}
            theme="vs-dark"
            options={editorOptions}
          />
        </div>
      </div>

      {/* Error message */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minHeight: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Error message
        </span>
        <textarea
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
          placeholder="Paste the error from n8n's execution log…"
          style={{
            flex: 1,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text)',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.6,
            minHeight: '80px',
          }}
        />
      </div>

      {parseError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-danger)',
          }}
        >
          <AlertCircle size={12} />
          {parseError}
        </div>
      )}

      {isRunning && progress && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-accent)',
          }}
        >
          <Loader2 size={12} className="animate-spin" />
          {progress}
        </div>
      )}

      <button
        onClick={handleDiagnose}
        disabled={!workflowJson.trim() || !errorText.trim() || isRunning}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          background: isRunning ? 'var(--color-surface-2)' : 'var(--color-accent)',
          color: isRunning ? 'var(--color-text-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '9px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 700,
          cursor: isRunning ? 'not-allowed' : 'pointer',
          opacity: !workflowJson.trim() || !errorText.trim() ? 0.4 : 1,
          letterSpacing: '0.03em',
          transition: 'all 0.15s',
        }}
      >
        {isRunning ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Diagnosing…
          </>
        ) : (
          <>
            <Bug size={13} />
            Diagnose workflow
          </>
        )}
      </button>
    </div>
  );
}
