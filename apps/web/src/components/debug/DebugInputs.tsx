import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Bug, Loader2, AlertCircle } from 'lucide-react';
import { defineBlueprintThemes, currentEditorTheme, EDITOR_OPTIONS } from '../../lib/monaco-theme.js';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <span className="bp-label">Redline review — broken workflow + error</span>

      {/* Workflow JSON */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '5px', minHeight: 0 }}>
        <span className="bp-label" style={{ fontSize: '8px' }}>Workflow JSON</span>
        <div className="monaco-surface" style={{ flex: 1, minHeight: '150px' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={workflowJson}
            onChange={(v) => setWorkflowJson(v ?? '')}
            theme={currentEditorTheme()}
            beforeMount={defineBlueprintThemes}
            options={EDITOR_OPTIONS}
          />
        </div>
      </div>

      {/* Error message */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', minHeight: 0 }}>
        <span className="bp-label" style={{ fontSize: '8px' }}>Error message</span>
        <textarea
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
          placeholder="Paste the error from n8n's execution log…"
          className="bp-input"
          style={{
            flex: 1,
            fontSize: '10px',
            resize: 'none',
            lineHeight: 1.6,
            minHeight: '72px',
          }}
        />
      </div>

      {parseError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={11} style={{ flexShrink: 0 }} />
          {parseError}
        </div>
      )}

      {isRunning && progress && (
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
          {progress}
        </div>
      )}

      <button
        onClick={handleDiagnose}
        disabled={!workflowJson.trim() || !errorText.trim() || isRunning}
        className="btn-primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          fontSize: '10px',
        }}
      >
        {isRunning ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Diagnosing…
          </>
        ) : (
          <>
            <Bug size={12} />
            Diagnose workflow
          </>
        )}
      </button>
    </div>
  );
}
