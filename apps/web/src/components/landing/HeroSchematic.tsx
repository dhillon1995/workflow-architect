import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Ticks from '../ui/Ticks.js';

type Cat = 'trigger' | 'transform' | 'action' | 'integration';

interface SceneNode {
  x: number;
  y: number;
  label: string;
  sub: string;
  cat: Cat;
}

interface Scene {
  prompt: string;
  nodes: SceneNode[];
  edges: [number, number][];
}

const NODE_W = 170;
const NODE_H = 50;
const VIEW_W = 764;
const VIEW_H = 196;

const SCENES: Scene[] = [
  {
    prompt: 'When a Stripe payment succeeds, log it to Airtable and alert #payments in Slack',
    nodes: [
      { x: 8, y: 73, label: 'Stripe Trigger', sub: 'payment.succeeded', cat: 'trigger' },
      { x: 250, y: 73, label: 'Format Record', sub: 'set · amount, email', cat: 'transform' },
      { x: 492, y: 14, label: 'Airtable', sub: 'append row', cat: 'integration' },
      { x: 492, y: 132, label: 'Slack', sub: 'post · #payments', cat: 'integration' },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
  },
  {
    prompt: 'Every Monday at 9am, fetch open HubSpot deals and email me a digest',
    nodes: [
      { x: 8, y: 73, label: 'Schedule', sub: 'cron · mon 09:00', cat: 'trigger' },
      { x: 200, y: 73, label: 'HubSpot', sub: 'deal · getAll', cat: 'integration' },
      { x: 392, y: 73, label: 'Summarise', sub: 'Claude · digest', cat: 'action' },
      { x: 584, y: 73, label: 'Gmail', sub: 'send · weekly digest', cat: 'integration' },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    prompt: 'When a GitHub issue is labelled "bug", create a Linear ticket and notify #eng',
    nodes: [
      { x: 8, y: 73, label: 'GitHub Trigger', sub: 'issues · labeled', cat: 'trigger' },
      { x: 250, y: 73, label: 'If label = bug', sub: 'condition', cat: 'transform' },
      { x: 492, y: 14, label: 'Linear', sub: 'issue · create', cat: 'integration' },
      { x: 492, y: 132, label: 'Slack', sub: 'post · #eng', cat: 'integration' },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
  },
];

const TINT: Record<Cat, string> = {
  trigger: 'var(--tint-trigger)',
  transform: 'var(--tint-transform)',
  action: 'var(--tint-action)',
  integration: 'var(--tint-integration)',
};

const TYPE_MS = 24;
const NODE_STAGGER = 0.42;
const HOLD_MS = 3400;

type Phase = 'typing' | 'drafting' | 'done';

function edgePath(scene: Scene, [a, b]: [number, number]): string {
  const s = scene.nodes[a]!;
  const t = scene.nodes[b]!;
  const x1 = s.x + NODE_W;
  const y1 = s.y + NODE_H / 2;
  const x2 = t.x;
  const y2 = t.y + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
}

export default function HeroSchematic() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [chars, setChars] = useState(0);

  const scene = SCENES[sceneIdx % SCENES.length]!;

  // Phase: typing
  useEffect(() => {
    if (phase !== 'typing') return;
    if (chars >= scene.prompt.length) {
      const t = setTimeout(() => setPhase('drafting'), 360);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setChars((c) => c + 1), TYPE_MS);
    return () => clearTimeout(t);
  }, [phase, chars, scene.prompt.length]);

  // Phase: drafting → done
  useEffect(() => {
    if (phase !== 'drafting') return;
    const draftMs = scene.nodes.length * NODE_STAGGER * 1000 + 900;
    const t = setTimeout(() => setPhase('done'), draftMs);
    return () => clearTimeout(t);
  }, [phase, scene.nodes.length]);

  // Phase: done → next scene
  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => {
      setSceneIdx((i) => (i + 1) % SCENES.length);
      setChars(0);
      setPhase('typing');
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
      }}
    >
      <Ticks color="var(--accent-line)" />

      {/* Sheet header strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span className="bp-label bp-label--accent">Fig. 01 — Live draft</span>
        <span className="bp-label">Scale 1:1 · n8n JSON</span>
      </div>

      {/* Prompt line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px dashed var(--line)',
          minHeight: '46px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          SPEC&gt;
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--ink)',
            lineHeight: 1.6,
            overflowWrap: 'anywhere',
          }}
        >
          {scene.prompt.slice(0, chars)}
          <span
            className="caret-blink"
            style={{
              display: 'inline-block',
              width: '7px',
              height: '13px',
              background: 'var(--accent)',
              verticalAlign: 'text-bottom',
              marginLeft: '2px',
            }}
          />
        </span>
      </div>

      {/* Schematic canvas */}
      <div className="sheet-grid" style={{ position: 'relative', padding: '18px 14px' }}>
        <AnimatePresence mode="wait">
          <motion.svg
            key={sceneIdx}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            {/* Edges — drawn after their source node lands */}
            {phase !== 'typing' &&
              scene.edges.map((e, i) => (
                <motion.path
                  key={`e${i}`}
                  d={edgePath(scene, e)}
                  fill="none"
                  stroke="var(--accent-line)"
                  strokeWidth="1.4"
                  strokeDasharray="6 5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: (e[0] + 1) * NODE_STAGGER + 0.2,
                    duration: 0.45,
                    ease: 'easeOut',
                  }}
                />
              ))}

            {/* Nodes */}
            {phase !== 'typing' &&
              scene.nodes.map((n, i) => {
                const delay = i * NODE_STAGGER;
                const tint = TINT[n.cat];
                return (
                  <g key={`n${sceneIdx}-${i}`}>
                    {/* outline draws itself */}
                    <motion.rect
                      x={n.x}
                      y={n.y}
                      width={NODE_W}
                      height={NODE_H}
                      fill="var(--paper-deep)"
                      stroke="var(--line-strong)"
                      strokeWidth="1.2"
                      initial={{ pathLength: 0, fillOpacity: 0 }}
                      animate={{ pathLength: 1, fillOpacity: 0.92 }}
                      transition={{
                        pathLength: { delay, duration: 0.4, ease: 'easeInOut' },
                        fillOpacity: { delay: delay + 0.25, duration: 0.3 },
                      }}
                    />
                    {/* category spine */}
                    <motion.rect
                      x={n.x}
                      y={n.y}
                      width={3}
                      height={NODE_H}
                      fill={tint}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: delay + 0.3, duration: 0.25 }}
                    />
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: delay + 0.35, duration: 0.3 }}
                    >
                      {/* category tag */}
                      <text
                        x={n.x + 12}
                        y={n.y - 6}
                        fontFamily="'Martian Mono', monospace"
                        fontSize="7.5"
                        fontWeight="700"
                        letterSpacing="1.4"
                        fill={tint}
                      >
                        {n.cat.toUpperCase()}
                      </text>
                      <text
                        x={n.x + 14}
                        y={n.y + 22}
                        fontFamily="'Archivo', sans-serif"
                        fontSize="12.5"
                        fontWeight="600"
                        fill="var(--ink)"
                        letterSpacing="-0.1"
                      >
                        {n.label}
                      </text>
                      <text
                        x={n.x + 14}
                        y={n.y + 38}
                        fontFamily="'Martian Mono', monospace"
                        fontSize="8"
                        fill="var(--ink-faint)"
                      >
                        {n.sub}
                      </text>
                      {/* port dots */}
                      {i > 0 && (
                        <rect x={n.x - 2.5} y={n.y + NODE_H / 2 - 2.5} width="5" height="5" fill="var(--accent)" />
                      )}
                      {scene.edges.some(([a]) => a === i) && (
                        <rect x={n.x + NODE_W - 2.5} y={n.y + NODE_H / 2 - 2.5} width="5" height="5" fill="var(--accent)" />
                      )}
                    </motion.g>
                  </g>
                );
              })}
          </motion.svg>
        </AnimatePresence>
      </div>

      {/* Status line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderTop: '1px solid var(--line)',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            flexShrink: 0,
            background:
              phase === 'done' ? 'var(--success)' : phase === 'drafting' ? 'var(--accent)' : 'var(--ink-faint)',
            animation: phase === 'drafting' ? 'pulse 0.9s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: phase === 'done' ? 'var(--success)' : 'var(--ink-muted)',
          }}
        >
          {phase === 'typing' && 'Awaiting spec…'}
          {phase === 'drafting' && 'Drafting — classify → build → validate'}
          {phase === 'done' && `Valid n8n JSON · ${scene.nodes.length} nodes · ready to deploy`}
        </span>
      </div>
    </div>
  );
}
