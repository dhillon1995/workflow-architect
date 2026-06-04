import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, AlertCircle } from 'lucide-react';

interface JsonPasteInputProps {
  onVisualize: (workflow: Record<string, unknown>) => void;
}

export default function JsonPasteInput({ onVisualize }: JsonPasteInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    setError(null);
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null || !('nodes' in parsed)) {
        setError('JSON must be a valid n8n workflow with a "nodes" array.');
        return;
      }
      onVisualize(parsed as Record<string, unknown>);
    } catch {
      setError('Invalid JSON — check for syntax errors.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          marginBottom: '2px',
        }}
      >
        Paste n8n workflow JSON
      </div>

      <div
        style={{
          flex: 1,
          minHeight: '200px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={(v) => setValue(v ?? '')}
          theme="vs-dark"
          options={{
            fontSize: 12,
            fontFamily: '"IBM Plex Mono", "Cascadia Code", monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { useShadows: false, verticalScrollbarSize: 6 },
          }}
        />
      </div>

      {error && (
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
          {error}
        </div>
      )}

      <button
        onClick={handleVisualize}
        disabled={!value.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'var(--color-accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: value.trim() ? 'pointer' : 'not-allowed',
          opacity: value.trim() ? 1 : 0.4,
          letterSpacing: '0.03em',
        }}
      >
        <Play size={12} />
        Render workflow
      </button>
    </div>
  );
}
