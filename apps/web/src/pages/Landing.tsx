import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, ShieldAlert } from 'lucide-react';
import HeroSchematic from '../components/landing/HeroSchematic.js';
import Ticks from '../components/ui/Ticks.js';

/* ───────────────────────── helpers ───────────────────────── */

function FadeIn({
  children,
  delay = 0,
  y = 18,
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

function SectionHead({
  fig,
  title,
  note,
}: {
  fig: string;
  title: string;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <span className="bp-label bp-label--accent">{fig}</span>
        <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(34px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.01em',
          lineHeight: 0.95,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h2>
      {note && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--ink-muted)',
            marginTop: '12px',
            maxWidth: '520px',
            lineHeight: 1.65,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────── data ───────────────────────── */

const SHEETS = [
  {
    no: '01',
    title: 'Generate',
    kbd: '1',
    desc: 'Describe a workflow in plain English. A two-step Claude pipeline drafts valid n8n JSON with auto-positioned nodes — ready to import or deploy.',
    tint: 'var(--tint-trigger)',
  },
  {
    no: '02',
    title: 'Visualise',
    kbd: '2',
    desc: 'Paste any n8n workflow JSON and see it as an interactive schematic instantly. No setup, no account, nothing leaves your browser.',
    tint: 'var(--tint-transform)',
  },
  {
    no: '03',
    title: 'Debug',
    kbd: '3',
    desc: 'Paste a broken workflow with its error message. Get a structured root-cause diagnosis, a parameter-level patch, and a side-by-side diff.',
    tint: 'var(--tint-action)',
    badge: 'Redline review',
  },
];

const PIPELINE = [
  {
    n: '01',
    title: 'Classify',
    desc: 'A fast Claude call maps your intent onto the 62-node catalog. Nothing outside the catalog can be drafted.',
  },
  {
    n: '02',
    title: 'Build',
    desc: 'Forced tool-use returns a structured intermediate representation — trigger, steps, dependencies. No free-form JSON.',
  },
  {
    n: '03',
    title: 'Translate',
    desc: 'A pure function converts the IR to n8n JSON. Dagre computes the layout; no LLM touches the output format.',
  },
  {
    n: '04',
    title: 'Validate',
    desc: 'Zod checks the full workflow shape and connection integrity. Missing credentials surface as warnings.',
  },
];

const BOM = [
  { ref: 'A', item: 'Frontend', spec: 'React 19 · TypeScript · Vite · Tailwind v4' },
  { ref: 'B', item: 'Canvas', spec: '@xyflow/react · dagre auto-layout · Framer Motion' },
  { ref: 'C', item: 'AI', spec: 'Claude Sonnet 4.6 — forced tool-use + prompt caching' },
  { ref: 'D', item: 'Transport', spec: 'Server-sent events — live pipeline progress' },
  { ref: 'E', item: 'Validation', spec: 'Zod schemas shared end-to-end (API ↔ web)' },
  { ref: 'F', item: 'Backend', spec: 'Node 22 · Express · token-bucket rate limiting' },
  { ref: 'G', item: 'Security', spec: 'n8n credentials live in sessionStorage only — never proxied' },
];

/* ───────────────────────── mock diagnosis card ───────────────────────── */

function MockDiagnosis() {
  return (
    <div style={{ position: 'relative', background: 'var(--panel)', border: '1px solid var(--line)' }}>
      <Ticks />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span className="bp-label bp-label--accent">Diagnosis — sample output</span>
        <span className="bp-label">Debug mode</span>
      </div>

      <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--danger)',
              padding: '3px 9px',
              fontFamily: 'var(--font-mono)',
              fontSize: '8.5px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--danger)',
              background: 'var(--danger-dim)',
            }}
          >
            <ShieldAlert size={10} />
            Authentication
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--success)' }}>
            92% CONFIDENCE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--ink-faint)' }}>
            NODE: Slack
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.55,
          }}
        >
          The Slack node has no credential attached — n8n rejects the request before it reaches the API.
        </div>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.65 }}>
          The error <code style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)' }}>
          "Credentials for 'slackApi' are not set"</code> means the node references a credential type that was
          never configured on this instance.
        </p>

        <div>
          <div className="bp-label" style={{ marginBottom: '8px' }}>Suggested patch</div>
          <div
            style={{
              border: '1px solid var(--line)',
              borderLeft: '3px solid var(--success)',
              padding: '9px 12px',
              background: 'var(--paper-deep)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--tint-transform)', marginBottom: '4px' }}>
              Slack → credentials.slackApi
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--ink-muted)' }}>
              Attach your Slack API credential, or switch the node to use a webhook URL instead.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Landing() {
  return (
    <div
      style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        minHeight: '100vh',
        overflowX: 'hidden',
        padding: 'clamp(8px, 1.5vw, 16px)',
      }}
    >
      {/* ── Drawing-sheet frame around the whole page ── */}
      <div style={{ position: 'relative', border: '1px solid var(--line-strong)', minHeight: 'calc(100vh - 32px)' }}>
        <Ticks color="var(--accent)" size={9} inset={-2} />

        {/* ── Nav ── */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(16px, 4vw, 40px)',
            height: '60px',
            borderBottom: '1px solid var(--line)',
            background: 'color-mix(in srgb, var(--paper) 88%, transparent)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                flexShrink: 0,
                border: '1.5px solid var(--accent)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ width: '8px', height: '8px', background: 'var(--accent)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
              <span
                className="nav-brand-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                Workflow Architect
              </span>
              <span className="bp-label nav-brand-sub" style={{ fontSize: '7.5px', whiteSpace: 'nowrap' }}>
                DWG NO. WA-001 · REV B
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="https://github.com/dhillon1995/workflow-architect"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '10px',
                textDecoration: 'none',
              }}
            >
              <Github size={12} />
              <span className="nav-gh-label">Source</span>
            </a>
            <Link
              to="/app"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                fontSize: '10px',
                textDecoration: 'none',
              }}
            >
              Open app <ArrowRight size={12} />
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            padding: 'clamp(40px, 7vw, 80px) clamp(16px, 4vw, 40px) clamp(48px, 6vw, 80px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <span style={{ width: '28px', height: '1px', background: 'var(--accent)' }} />
              <span className="bp-label bp-label--accent">
                n8n workflow tooling · drafted by Claude
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(54px, 10vw, 124px)',
                fontWeight: 800,
                textTransform: 'uppercase',
                lineHeight: 0.92,
                letterSpacing: '0.005em',
                marginBottom: '26px',
              }}
            >
              Automation,
              <br />
              <span style={{ color: 'var(--accent)' }}>drafted to spec.</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(14px, 1.6vw, 16px)',
                color: 'var(--ink-muted)',
                lineHeight: 1.7,
                maxWidth: '560px',
                marginBottom: '34px',
              }}
            >
              Describe a workflow in plain English. Workflow Architect drafts valid n8n JSON on an
              interactive canvas — and when a workflow breaks, it hands you a structured diagnosis
              with a one-click fix.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '52px' }}>
              <Link
                to="/app"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '13px 26px',
                  fontSize: '11px',
                  textDecoration: 'none',
                }}
              >
                Open the drafting table <ArrowRight size={14} />
              </Link>
              <a
                href="#demo"
                className="btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 22px',
                  fontSize: '11px',
                  textDecoration: 'none',
                }}
              >
                60-sec demo
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroSchematic />
          </motion.div>

          {/* Spec strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px 28px',
              justifyContent: 'center',
              padding: '22px 8px 0',
            }}
          >
            {[
              '62-node catalog',
              'Two-step LLM pipeline',
              'Zod-validated output',
              'Credentials never leave your browser',
            ].map((s, i) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="bp-label bp-label--bright" style={{ fontSize: '8.5px' }}>{s}</span>
                {i < 3 && <span style={{ width: '4px', height: '4px', background: 'var(--accent-line)', transform: 'rotate(45deg)' }} />}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ── Index of drawings (modes) ── */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(56px, 7vw, 96px)' }}>
          <FadeIn>
            <SectionHead
              fig="Index of drawings"
              title="Three sheets in the set"
              note="One canvas, three modes. Switch with Ctrl+1 / 2 / 3 — or hit Ctrl+K for the command palette."
            />
          </FadeIn>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {SHEETS.map((sheet, i) => (
              <FadeIn key={sheet.no} delay={i * 0.08}>
                <div
                  style={{
                    position: 'relative',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    padding: '24px 22px 22px',
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--accent-line)';
                    el.style.transform = 'translateY(-3px)';
                    el.style.boxShadow = 'var(--shadow-float)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--line)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* ghost sheet numeral */}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: '-18px',
                      right: '-6px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '110px',
                      fontWeight: 800,
                      color: 'transparent',
                      WebkitTextStroke: '1px var(--line)',
                      lineHeight: 1,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {sheet.no}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span className="bp-label" style={{ color: sheet.tint }}>
                      Sheet {sheet.no}
                    </span>
                    {sheet.badge && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '7.5px',
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--accent-ink)',
                          background: 'var(--accent)',
                          padding: '2px 6px',
                        }}
                      >
                        {sheet.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '30px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      marginBottom: '12px',
                    }}
                  >
                    {sheet.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '18px' }}>
                    {sheet.desc}
                  </p>

                  <span className="bp-label">
                    <kbd>Ctrl</kbd> <kbd>{sheet.kbd}</kbd>
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Pipeline ── */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(56px, 7vw, 96px)' }}>
          <FadeIn>
            <SectionHead
              fig="Fig. 02 — Generate mode internals"
              title="The drafting pipeline"
              note="Classify first against the full catalog, then build from a focused subset. The model can't hallucinate node types it was never shown — and the final JSON is produced by a pure function, not the LLM."
            />
          </FadeIn>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0',
              border: '1px solid var(--line)',
              position: 'relative',
              background: 'var(--panel)',
            }}
          >
            <Ticks />
            {PIPELINE.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.07}>
                <div
                  style={{
                    padding: '24px 22px',
                    borderRight: i < PIPELINE.length - 1 ? '1px dashed var(--line)' : 'none',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        border: '1px solid var(--accent-line)',
                        padding: '3px 7px',
                      }}
                    >
                      {step.n}
                    </span>
                    <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                    {i < PIPELINE.length - 1 && (
                      <span style={{ color: 'var(--accent-line)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>→</span>
                    )}
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Debug spotlight ── */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(56px, 7vw, 96px)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'center',
            }}
          >
            <FadeIn>
              <div>
                <SectionHead
                  fig="Sheet 03 — the differentiator"
                  title="Redline review"
                  note=""
                />
                <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: '22px', marginTop: '-16px' }}>
                  Plenty of tools generate workflows. Almost none can tell you why yours broke.
                  Paste a failing workflow and its error message — Debug mode returns a structured
                  diagnosis, not a paragraph of guesswork.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    'Root cause classified into 8 failure categories, with a confidence score',
                    'Parameter-level patch applied to the exact node and path that failed',
                    'Side-by-side diff of original vs fixed JSON before you accept anything',
                    'One click to apply on canvas — or deploy the fix straight to your n8n',
                  ].map((li) => (
                    <li key={li} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          flexShrink: 0,
                          marginTop: '5px',
                          border: '1.5px solid var(--accent)',
                          transform: 'rotate(45deg)',
                        }}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>{li}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <MockDiagnosis />
            </FadeIn>
          </div>
        </section>

        {/* ── Demo ── */}
        <section id="demo" style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(56px, 7vw, 96px)' }}>
          <FadeIn>
            <SectionHead fig="As-built recording" title="See a full draft" note="Prompt to deployable workflow, in real time." />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ position: 'relative', border: '1px solid var(--line)', background: 'var(--panel)' }}>
              <Ticks color="var(--accent-line)" />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span className="bp-label bp-label--accent">Recording WA-001-D</span>
                <span className="bp-label">60 sec · muted</span>
              </div>
              <video
                src="/projects/workflowarchitect/demo.mp4"
                autoPlay
                loop
                muted
                controls
                playsInline
                preload="auto"
                style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--paper-deep)' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </FadeIn>
        </section>

        {/* ── Bill of materials ── */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(56px, 7vw, 96px)' }}>
          <FadeIn>
            <SectionHead
              fig="Schedule of components"
              title="Bill of materials"
              note="What this is actually built from — for the engineers reading."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ position: 'relative', border: '1px solid var(--line)' }}>
              <Ticks />
              {BOM.map((row, i) => (
                <div
                  key={row.ref}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px minmax(110px, 180px) 1fr',
                    borderBottom: i < BOM.length - 1 ? '1px solid var(--line)' : 'none',
                    background: i % 2 === 0 ? 'var(--panel)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      padding: '13px 0',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      borderRight: '1px solid var(--line)',
                    }}
                  >
                    {row.ref}
                  </div>
                  <div
                    style={{
                      padding: '13px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 500,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-muted)',
                      borderRight: '1px dashed var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {row.item}
                  </div>
                  <div
                    style={{
                      padding: '13px 16px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {row.spec}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ── CTA ── */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(64px, 8vw, 110px)' }}>
          <FadeIn>
            <div
              style={{
                position: 'relative',
                border: '1px solid var(--line-strong)',
                padding: 'clamp(40px, 6vw, 72px) clamp(20px, 4vw, 48px)',
                textAlign: 'center',
                overflow: 'hidden',
              }}
              className="sheet-grid"
            >
              <Ticks color="var(--accent)" size={9} />
              {/* rotated stamp */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '22px',
                  right: 'clamp(-30px, 1vw, 36px)',
                  transform: 'rotate(8deg)',
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  padding: '7px 14px',
                  opacity: 0.85,
                  userSelect: 'none',
                }}
              >
                Ready for issue
              </span>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(40px, 7vw, 76px)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  lineHeight: 0.95,
                  marginBottom: '16px',
                }}
              >
                Your first draft is
                <br />
                <span style={{ color: 'var(--accent)' }}>ten seconds away.</span>
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '32px' }}>
                No account. No setup. Describe the workflow — the architect does the rest.
              </p>
              <Link
                to="/app"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '14px 30px',
                  fontSize: '11px',
                  textDecoration: 'none',
                }}
              >
                Open Workflow Architect <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* ── Footer title block ── */}
        <footer style={{ borderTop: '1px solid var(--line-strong)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            }}
          >
            {[
              { k: 'Project', v: 'Workflow Architect' },
              { k: 'Drawn by', v: 'Sandip Dhillon', href: 'https://sandipdhillon.co.uk' },
              { k: 'Checked by', v: 'Claude Sonnet 4.6' },
              { k: 'Scale', v: '1:1' },
              { k: 'Sheet', v: '01 of 01' },
              { k: 'Rev', v: 'B — Drafting set' },
            ].map((cell) => (
              <div
                key={cell.k}
                style={{
                  padding: '12px 16px 14px',
                  borderRight: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div className="bp-label" style={{ marginBottom: '5px' }}>{cell.k}</div>
                {cell.href ? (
                  <a
                    href={cell.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                    }}
                  >
                    {cell.v}
                  </a>
                ) : (
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                    {cell.v}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '14px clamp(16px, 4vw, 40px)',
            }}
          >
            <span className="bp-label">© {new Date().getFullYear()} Sandip Dhillon · sandipdhillon.co.uk</span>
            <span className="bp-label">Built with Claude · n8n · React</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
