import ReactMarkdown from 'react-markdown';
import { AlertTriangle, ShieldAlert, Code2, Link2, GitBranch, Clock, Wrench } from 'lucide-react';
import type { WorkflowDiagnosis } from '@workflow-architect/shared';

const CATEGORY_META: Record<
  WorkflowDiagnosis['category'],
  { label: string; color: string; tintBg: string; Icon: React.ComponentType<{ size: number }> }
> = {
  auth:       { label: 'Authentication', color: 'var(--color-danger)',   tintBg: 'rgba(248,113,113,0.08)',  Icon: ShieldAlert },
  params:     { label: 'Parameters',     color: 'var(--color-warning)',  tintBg: 'rgba(251,191,36,0.07)',   Icon: Wrench },
  expression: { label: 'Expression',     color: 'var(--tint-lavender)',  tintBg: 'var(--accent-lavender)',  Icon: Code2 },
  connection: { label: 'Connection',     color: 'var(--tint-peach)',     tintBg: 'var(--accent-peach)',     Icon: Link2 },
  logic:      { label: 'Logic',          color: 'var(--tint-sky)',       tintBg: 'var(--accent-sky)',       Icon: GitBranch },
  version:    { label: 'Version',        color: 'var(--tint-mint)',      tintBg: 'var(--accent-mint)',      Icon: Clock },
  timeout:    { label: 'Timeout',        color: 'var(--text-muted)',     tintBg: 'var(--glass-border)',     Icon: Clock },
  other:      { label: 'Other',          color: 'var(--text-faint)',     tintBg: 'var(--glass-border)',     Icon: AlertTriangle },
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
            gap: '5px',
            background: meta.tintBg,
            border: '1px solid var(--glass-border)',
            borderTopColor: 'var(--glass-border-bright)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            color: meta.color,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            boxShadow: 'var(--shadow-inset-top)',
          }}
        >
          <Icon size={10} />
          {meta.label}
        </span>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: confidence >= 80 ? 'var(--color-success)' : 'var(--text-faint)',
          }}
        >
          {confidence}% confidence
        </span>

        {diagnosis.affectedNodeName && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
            node: <strong style={{ color: 'var(--text-muted)' }}>{diagnosis.affectedNodeName}</strong>
          </span>
        )}
      </div>

      {/* Root cause */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text)',
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {diagnosis.rootCause}
      </div>

      {/* Explanation (markdown) */}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
        }}
        className="diagnosis-markdown"
      >
        <ReactMarkdown>{diagnosis.explanation}</ReactMarkdown>
      </div>

      {/* Suggested fixes */}
      {diagnosis.suggestedFixes.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            Suggested fixes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {diagnosis.suggestedFixes.map((fix, i) => (
              <div
                key={i}
                className="glass-floating"
                style={{
                  border: '1px solid var(--glass-border)',
                  borderTopColor: 'var(--glass-border-bright)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: 'var(--shadow-inset-top)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tint-sky)' }}>
                  {fix.nodeName} → {fix.paramPath}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-muted)' }}>
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
