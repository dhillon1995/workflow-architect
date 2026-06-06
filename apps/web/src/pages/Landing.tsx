import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Eye, Bug, ExternalLink, Workflow, MoveRight } from 'lucide-react';

function FadeIn({
  children,
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const MODES = [
  {
    Icon: Zap,
    label: 'Generate',
    tintVar: '--tint-peach',
    accentVar: '--accent-peach',
    desc: 'Describe a workflow in plain English. Get valid n8n JSON with auto-positioned nodes, ready to import or deploy.',
  },
  {
    Icon: Eye,
    label: 'Visualise',
    tintVar: '--tint-sky',
    accentVar: '--accent-sky',
    desc: 'Paste any n8n workflow JSON and see it as an interactive graph instantly. No setup, no account required.',
  },
  {
    Icon: Bug,
    label: 'Debug',
    tintVar: '--tint-mint',
    accentVar: '--accent-mint',
    desc: 'Paste a broken workflow and its error. Get a structured diagnosis, parameter patch, and a side-by-side diff.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Classify intent',
    desc: 'A fast Claude call identifies the right node types from the 62-node catalog.',
  },
  {
    n: '02',
    title: 'Build IR',
    desc: "Tool-use forces structured output — trigger, steps, dependencies. No hallucinated node types.",
  },
  {
    n: '03',
    title: 'Translate',
    desc: 'Pure function converts the IR to valid n8n JSON. Node positions computed with dagre.',
  },
  {
    n: '04',
    title: 'Validate',
    desc: 'Zod schema validates the full n8n workflow shape. Warnings surface missing credentials.',
  },
];

function WorkflowMock() {
  // All coordinates in a single SVG viewBox so lines and nodes scale together
  const nodes = [
    { x: 0,   y: 8,  w: 165, h: 48, label: 'GitHub Trigger',  sub: 'trigger',   dotColor: '#fb923c', dotBg: 'rgba(251,146,60,0.18)' },
    { x: 200, y: 66, w: 155, h: 48, label: "Is Label 'bug'?",  sub: 'condition', dotColor: '#a78bfa', dotBg: 'rgba(167,139,250,0.18)' },
    { x: 390, y: 8,  w: 175, h: 48, label: 'Create Ticket',    sub: 'linear',    dotColor: '#a78bfa', dotBg: 'rgba(167,139,250,0.18)' },
    { x: 600, y: 66, w: 165, h: 48, label: 'Post to Slack',    sub: 'slack',     dotColor: '#a78bfa', dotBg: 'rgba(167,139,250,0.18)' },
  ];

  // right-center of source → left-center of target
  const edges = [
    { x1: 165, y1: 32, x2: 200, y2: 90 },
    { x1: 355, y1: 90, x2: 390, y2: 32 },
    { x1: 565, y1: 32, x2: 600, y2: 90 },
  ];

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox="0 0 780 128"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {edges.map((e, i) => {
          const mx = (e.x1 + e.x2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${e.x1} ${e.y1} C ${mx} ${e.y1} ${mx} ${e.y2} ${e.x2} ${e.y2}`}
                fill="none"
                stroke="#fb923c"
                strokeWidth="1.5"
                strokeOpacity="0.65"
              />
              <circle cx={e.x1} cy={e.y1} r="3.5" fill="#fb923c" opacity="0.85" />
              <circle cx={e.x2} cy={e.y2} r="3.5" fill="#fb923c" opacity="0.85" />
            </g>
          );
        })}

        {nodes.map((node, i) => (
          <g key={i}>
            <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="9" ry="9"
              fill="#1d2438" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <rect x={node.x + 1} y={node.y + 1} width={node.w - 2} height="1" rx="1"
              fill="rgba(255,255,255,0.09)" />
            <rect x={node.x + 9} y={node.y + 10} width="28" height="28" rx="6" ry="6"
              fill={node.dotBg} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <circle cx={node.x + 23} cy={node.y + 24} r="5" fill={node.dotColor} opacity="0.9" />
            <text x={node.x + 45} y={node.y + 21}
              fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fontWeight="600"
              fill="#e2e6f3" letterSpacing="-0.2">
              {node.label}
            </text>
            <text x={node.x + 45} y={node.y + 34}
              fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9"
              fill="rgba(122,136,171,0.75)">
              {node.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AppPreviewCard({ delay = 0 }: { delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          background: 'var(--glass-floating)',
          backdropFilter: 'var(--glass-blur-floating)',
          WebkitBackdropFilter: 'var(--glass-blur-floating)',
          border: '1px solid var(--glass-border)',
          borderTopColor: 'var(--glass-border-bright)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-inset-top), var(--shadow-lift)',
        }}
      >
        {/* Mock top bar */}
        <div
          style={{
            height: '44px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: 'var(--glass-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'var(--accent-lavender)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Workflow size={12} style={{ color: 'var(--tint-lavender)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
              }}
            >
              Workflow Architect
            </span>
          </div>
          {/* Mock pill tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--glass-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '100px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {['Generate', 'Visualize', 'Debug'].map((tab, i) => (
              <div
                key={tab}
                style={{
                  padding: '3px 10px',
                  borderRadius: '100px',
                  background: i === 0 ? 'var(--glass-floating)' : 'transparent',
                  border: i === 0 ? '1px solid var(--glass-border-bright)' : '1px solid transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? 'var(--text)' : 'var(--text-faint)',
                }}
              >
                {tab}
              </div>
            ))}
          </div>
          <div
            style={{
              width: '80px',
              height: '24px',
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 500, color: '#4ade80' }}>
              Connected
            </span>
          </div>
        </div>

        {/* Mock canvas */}
        <div
          style={{
            background: 'var(--base-canvas)',
            padding: '32px 40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, var(--glass-border) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative' }}>
            <WorkflowMock />
          </div>
        </div>

        <div
          style={{
            background: 'var(--glass-surface)',
            borderTop: '1px solid var(--glass-border)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--tint-mint)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
            Generated "Webhook → Classify → Slack" in 4.2s
          </span>
        </div>
      </div>
    </FadeIn>
  );
}

export default function Landing() {
  return (
    <div
      style={{
        background: 'var(--base-bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-elevated)',
          backdropFilter: 'var(--glass-blur-elevated)',
          WebkitBackdropFilter: 'var(--glass-blur-elevated)',
          boxShadow: 'var(--shadow-inset-top), var(--shadow-rest)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'var(--accent-lavender)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-inset-top)',
            }}
          >
            <Workflow size={14} style={{ color: 'var(--tint-lavender)' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
            }}
          >
            Workflow Architect
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://github.com/dhillon1995/workflow-architect"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            GitHub <ExternalLink size={11} />
          </a>
          <Link
            to="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass-floating)',
              backdropFilter: 'var(--glass-blur-floating)',
              color: 'var(--text)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '7px 16px',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              boxShadow: 'var(--shadow-inset-top), var(--shadow-rest)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
          >
            Open app <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          position: 'relative',
          maxWidth: '960px',
          margin: '0 auto',
          padding: '50px 40px 64px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative' }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass-floating)',
              backdropFilter: 'var(--glass-blur-floating)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-inset-top)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--tint-mint)',
                display: 'inline-block',
              }}
            />
            n8n workflow tooling, powered by Claude
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(38px, 5.5vw, 68px)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              marginBottom: '36px',
            }}
          >
            Generate. Visualise.{' '}
            <span style={{ color: 'var(--tint-sky)' }}>Debug.</span>
          </h1>

          {/* Demo video */}
          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto 32px',
              background: 'var(--glass-floating)',
              backdropFilter: 'var(--glass-blur-floating)',
              WebkitBackdropFilter: 'var(--glass-blur-floating)',
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-inset-top), var(--shadow-lift)',
            }}
          >
            <video
              src="/projects/workflowarchitect/demo.mp4"
              autoPlay
              loop
              muted
              controls
              playsInline
              preload="auto"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                background: 'var(--base-canvas)',
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 400,
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: '540px',
              margin: '0 auto 40px',
              letterSpacing: '-0.01em',
            }}
          >
            Describe a workflow in plain English. Get valid n8n JSON, an interactive
            canvas, and — when things break — a structured diagnosis with one-click fix.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--glass-floating)',
                backdropFilter: 'var(--glass-blur-floating)',
                color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 26px',
                borderRadius: 'var(--radius-pill)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                border: '1px solid var(--glass-border)',
                borderTopColor: 'var(--glass-border-bright)',
                boxShadow: 'var(--shadow-inset-top), var(--shadow-float)',
                transition: 'transform 0.15s, box-shadow 0.2s',
              }}
            >
              Try it free <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 22px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              How it works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Three modes */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 80px' }}>
        <FadeIn>
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '30px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              Three tools in one
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
              Switch between modes with Ctrl+1 / Ctrl+2 / Ctrl+3.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {MODES.map(({ Icon, label, tintVar, accentVar, desc }, i) => (
            <FadeIn key={label} delay={i * 0.08}>
              <div
                className="glass glass-floating"
                style={{
                  border: '1px solid var(--glass-border)',
                  borderTopColor: 'var(--glass-border-bright)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '26px',
                  height: '100%',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  boxShadow: 'var(--shadow-inset-top), var(--shadow-rest)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'var(--glass-border-active)';
                  el.style.boxShadow = `var(--shadow-inset-top), var(--shadow-float)`;
                  el.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'var(--glass-border)';
                  el.style.borderTopColor = 'var(--glass-border-bright)';
                  el.style.boxShadow = 'var(--shadow-inset-top), var(--shadow-rest)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    background: `var(${accentVar})`,
                    border: '1px solid var(--glass-border)',
                    borderTopColor: 'var(--glass-border-bright)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    color: `var(${tintVar})`,
                    boxShadow: 'var(--shadow-inset-top)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {label}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.65,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 80px' }}>
        <FadeIn>
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '30px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              How generate works
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
              Two-step LLM pipeline prevents hallucinated node types.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.07}>
              <div
                className="glass glass-floating"
                style={{
                  border: '1px solid var(--glass-border)',
                  borderTopColor: 'var(--glass-border-bright)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px 20px',
                  boxShadow: 'var(--shadow-inset-top), var(--shadow-rest)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-4px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '52px',
                    fontWeight: 800,
                    color: 'var(--glass-border)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    background: 'var(--accent-sky)',
                    border: '1px solid var(--glass-border)',
                    borderTopColor: 'var(--glass-border-bright)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--tint-sky)',
                    marginBottom: '14px',
                  }}
                >
                  {step.n}
                </div>
                <h4
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '6px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {step.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px',
              padding: '12px',
              flexWrap: 'wrap',
            }}
          >
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {step.title}
                </span>
                {i < STEPS.length - 1 && (
                  <MoveRight size={14} style={{ color: 'var(--tint-sky)', opacity: 0.5, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Example generated output */}
        <div style={{ marginTop: '32px' }}>
          <AppPreviewCard delay={0.4} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 100px' }}>
        <FadeIn>
          <div
            className="glass glass-floating"
            style={{
              border: '1px solid var(--glass-border)',
              borderTopColor: 'var(--glass-border-bright)',
              borderRadius: 'var(--radius-xl)',
              padding: '56px 48px',
              textAlign: 'center',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-inset-top), var(--shadow-float)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '34px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: 'var(--text)',
                marginBottom: '12px',
                position: 'relative',
              }}
            >
              Ready to build?
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: 'var(--text-muted)',
                marginBottom: '32px',
                lineHeight: 1.6,
                position: 'relative',
                letterSpacing: '-0.01em',
              }}
            >
              Generate your first workflow in under 10 seconds.
            </p>
            <Link
              to="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--glass-elevated)',
                backdropFilter: 'var(--glass-blur-elevated)',
                color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '13px 30px',
                borderRadius: 'var(--radius-pill)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                position: 'relative',
                border: '1px solid var(--glass-border)',
                borderTopColor: 'var(--glass-border-bright)',
                boxShadow: 'var(--shadow-inset-top), var(--shadow-float)',
              }}
            >
              Open Workflow Architect <ArrowRight size={15} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--glass-border)',
          padding: '22px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-faint)' }}>
          Sandip Dhillon · sandipdhillon.co.uk
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
          Built with Claude Sonnet · n8n
        </span>
      </footer>
    </div>
  );
}
