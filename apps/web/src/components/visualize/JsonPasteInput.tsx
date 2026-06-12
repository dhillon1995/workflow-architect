import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, AlertCircle } from 'lucide-react';
import { defineBlueprintThemes, currentEditorTheme, EDITOR_OPTIONS } from '../../lib/monaco-theme.js';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      <span className="bp-label">Existing drawing — n8n workflow JSON</span>

      <div className="monaco-surface" style={{ flex: 1, minHeight: '220px' }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={(v) => setValue(v ?? '')}
          theme={currentEditorTheme()}
          beforeMount={defineBlueprintThemes}
          options={EDITOR_OPTIONS}
        />
      </div>

      {error && (
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
          {error}
        </div>
      )}

      <button
        onClick={handleVisualize}
        disabled={!value.trim()}
        className="btn-primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '9px 16px',
          fontSize: '10px',
        }}
      >
        <Play size={12} />
        Render schematic
      </button>
    </div>
  );
}
