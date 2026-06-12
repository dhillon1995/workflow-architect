import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';

const EXAMPLES = [
  {
    label: 'Stripe payment → Airtable + Slack alert',
    prompt: 'When a Stripe payment succeeds, log it to Airtable and alert #payments in Slack',
  },
  {
    label: 'Monday 9am → HubSpot deals → email digest',
    prompt: 'Every Monday at 9am, fetch open HubSpot deals and email me a digest',
  },
  {
    label: 'GitHub "bug" label → Linear ticket',
    prompt: 'When a GitHub issue is labelled "bug", create a Linear ticket and notify #eng',
  },
];

interface EmptyStateProps {
  onExample?: (prompt: string) => void;
}

export default function EmptyState({ onExample }: EmptyStateProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center select-none"
      style={{ pointerEvents: 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.6 }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          maxWidth: '420px',
          padding: '0 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            border: '1px dashed var(--line-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PenLine size={20} strokeWidth={1.5} style={{ color: 'var(--ink-faint)' }} />
        </div>

        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            Blank sheet
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--ink-faint)', lineHeight: 1.6 }}>
            Describe a workflow in the panel on the right — or paste n8n JSON in Visualise mode.
          </p>
        </div>

        {onExample && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '6px',
              pointerEvents: 'auto',
              width: '100%',
            }}
          >
            <span className="bp-label" style={{ marginBottom: '2px' }}>
              Or try one of these
            </span>
            {EXAMPLES.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => onExample(prompt)}
                className="btn-ghost"
                style={{
                  padding: '8px 12px',
                  fontSize: '9.5px',
                  textTransform: 'none',
                  letterSpacing: '0.04em',
                  width: '100%',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
