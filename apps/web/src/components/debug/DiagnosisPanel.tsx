import ReactMarkdown from 'react-markdown';
import { AlertTriangle, ShieldAlert, Code2, Link2, GitBranch, Clock, Wrench } from 'lucide-react';
import type { WorkflowDiagnosis } from '@workflow-architect/shared';

const CATEGORY_META: Record<
  WorkflowDiagnosis['category'],
  { label: string; color: string; Icon: React.ComponentType<{ size: number }> }
> = {
  auth:       { label: 'Authentication', color: 'var(--danger)',           Icon: ShieldAlert },
  params:     { label: 'Parameters',     color: 'var(--warning)',          Icon: Wrench },
  expression: { label: 'Expression',     color: 'var(--tint-integration)', Icon: Code2 },
  connection: { label: 'Connection',     color: 'var(--accent)',           Icon: Link2 },
  logic:      { label: 'Logic',          color: 'var(--tint-transform)',   Icon: GitBranch },
  version:    { label: 'Version',        color: 'var(--tint-action)',      Icon: Clock },
  timeout:    { label: 'Timeout',        color: 'var(--ink-muted)',        Icon: Clock },
  other:      { label: 'Other',          color: 'var(--ink-faint)',        Icon: AlertTriangle },
};

interface DiagnosisPanelProps {
  diagnosis: WorkflowDiagnosis;
}

export default function DiagnosisPanel({ diagnosis }: DiagnosisPanelProps) {
  const meta = CATEGORY_META[diagnosis.category];
  const Icon = meta.Icon;
  const confidence = Math.round(diagnosis.confidence * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: `1px solid ${meta.color}`,
            padding: '3px 9px',
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            fontWeight: 700,
            color: meta.color,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <Icon size={10} />
          {meta.label}
        </span>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8.5px',
            letterSpacing: '0.08em',
            color: confidence >= 80 ? 'var(--success)' : 'var(--ink-faint)',
          }}
        >
          {confidence}% CONFIDENCE
        </span>

        {diagnosis.affectedNodeName && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--ink-faint)' }}>
            NODE: <strong style={{ color: 'var(--ink-muted)' }}>{diagnosis.affectedNodeName}</strong>
          </span>
        )}
      </div>

      {/* Root cause */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--ink)',
          fontWeight: 700,
          lineHeight: 1.55,
        }}
      >
        {diagnosis.rootCause}
      </div>

      {/* Explanation (markdown) */}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          lineHeight: 1.65,
        }}
        className="diagnosis-markdown"
      >
        <ReactMarkdown>{diagnosis.explanation}</ReactMarkdown>
      </div>

      {/* Suggested fixes */}
      {diagnosis.suggestedFixes.length > 0 && (
        <div>
          <div className="bp-label" style={{ marginBottom: '7px' }}>
            Suggested patch
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {diagnosis.suggestedFixes.map((fix, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--line)',
                  borderLeft: '3px solid var(--success)',
                  background: 'var(--paper-deep)',
                  padding: '9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--tint-transform)' }}>
                  {fix.nodeName} → {fix.paramPath}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                  {fix.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
