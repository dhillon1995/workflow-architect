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

/* Both themes resolve through CSS variables, so the diff follows the toggle. */
const diffStyles = {
  variables: {
    dark: {
      diffViewerBackground: 'var(--editor-bg)',
      diffViewerColor: 'var(--ink)',
      addedBackground: 'var(--success-dim)',
      addedColor: 'var(--success)',
      removedBackground: 'var(--danger-dim)',
      removedColor: 'var(--danger)',
      wordAddedBackground: 'rgba(95, 214, 162, 0.28)',
      wordRemovedBackground: 'rgba(255, 122, 107, 0.26)',
      addedGutterBackground: 'var(--success-dim)',
      removedGutterBackground: 'var(--danger-dim)',
      gutterBackground: 'var(--panel)',
      gutterColor: 'var(--ink-faint)',
      codeFoldBackground: 'var(--panel)',
      codeFoldGutterBackground: 'var(--panel)',
      codeFoldContentColor: 'var(--ink-faint)',
      emptyLineBackground: 'var(--paper-deep)',
    },
  },
  line: {
    fontFamily: '"Martian Mono", "IBM Plex Mono", monospace',
    fontSize: '9.5px',
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
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span className="bp-label">Original vs fixed</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopy}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '8.5px' }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy fixed JSON'}
          </button>

          {canDeploy && onDeploy && (
            <button
              onClick={handleDeploy}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '8.5px',
                ...(deployed
                  ? { background: 'var(--success-dim)', borderColor: 'var(--success)', color: 'var(--success)' }
                  : {}),
              }}
            >
              {deployed ? (
                <>
                  <Check size={10} />
                  Deployed
                </>
              ) : (
                <>
                  <Upload size={10} />
                  Deploy to n8n
                </>
              )}
            </button>
          )}

          {!canDeploy && onApply && (
            <button
              onClick={() => onApply(fixed)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '8.5px' }}
            >
              <Check size={10} />
              Apply fix
            </button>
          )}
        </div>
      </div>

      {/* Diff */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid var(--line)',
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
