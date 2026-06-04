import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Copy, Upload, Check } from 'lucide-react';
import { useState } from 'react';

interface DiffViewProps {
  original: Record<string, unknown>;
  fixed: Record<string, unknown>;
  onApply?: (fixed: Record<string, unknown>) => void;
  onDeploy?: (fixed: Record<string, unknown>) => void;
  canDeploy?: boolean;
}

const diffStyles = {
  variables: {
    dark: {
      diffViewerBackground: 'var(--color-surface)',
      diffViewerColor: '#e8eaed',
      addedBackground: 'rgba(167, 139, 250, 0.07)',
      addedColor: '#c4b5fd',
      removedBackground: 'rgba(248, 113, 113, 0.06)',
      removedColor: '#f87171',
      wordAddedBackground: 'rgba(167, 139, 250, 0.2)',
      wordRemovedBackground: 'rgba(248, 113, 113, 0.18)',
      addedGutterBackground: 'rgba(167, 139, 250, 0.09)',
      removedGutterBackground: 'rgba(248, 113, 113, 0.08)',
      gutterBackground: 'var(--color-surface-2)',
      gutterColor: '#4b5260',
      codeFoldBackground: 'var(--color-surface)',
      codeFoldGutterBackground: 'var(--color-surface-2)',
      codeFoldContentColor: '#4b5260',
      emptyLineBackground: 'var(--color-bg)',
    },
  },
  line: {
    fontFamily: '"IBM Plex Mono", "Cascadia Code", monospace',
    fontSize: '11px',
  },
};

export default function DiffView({ original, fixed, onApply, onDeploy, canDeploy }: DiffViewProps) {
  const [copied, setCopied] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const oldStr = JSON.stringify(original, null, 2);
  const newStr = JSON.stringify(fixed, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(newStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeploy() {
    await onDeploy?.(fixed);
    setDeployed(true);
    setTimeout(() => setDeployed(false), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy fixed JSON'}
        </button>

        {canDeploy && onDeploy && (
          <button
            onClick={handleDeploy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: deployed ? 'rgba(74, 222, 128, 0.15)' : 'var(--color-accent)',
              color: deployed ? 'var(--color-success)' : '#fff',
              border: deployed ? '1px solid var(--color-success)' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.03em',
            }}
          >
            {deployed ? (
              <>
                <Check size={11} />
                Deployed!
              </>
            ) : (
              <>
                <Upload size={11} />
                Deploy to n8n
              </>
            )}
          </button>
        )}

        {!canDeploy && onApply && (
          <button
            onClick={() => onApply(fixed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            <Check size={11} />
            Apply fix
          </button>
        )}
      </div>

      {/* Diff */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          minHeight: 0,
        }}
      >
        <ReactDiffViewer
          oldValue={oldStr}
          newValue={newStr}
          splitView={false}
          compareMethod={DiffMethod.WORDS}
          useDarkTheme
          styles={diffStyles}
          hideLineNumbers={false}
          leftTitle="Original"
          rightTitle="Fixed"
        />
      </div>
    </div>
  );
}
