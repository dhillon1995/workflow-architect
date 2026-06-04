# Workflow Architect — CLAUDE.md

AI assistant context for working in this codebase.

---

## What this is

A web app that generates, visualises, and debugs n8n workflows using Claude AI.
Hosted at `sandipdhillon.co.uk/projects/workflowarchitect` (path-based — NOT a subdomain).
Landing page at `/`, app at `/app`. This is an extended page inside an existing portfolio site.

Purpose: dual consulting demo (Automation Specialist + Solutions Engineer).
Debug mode is the main differentiator — structured workflow diagnosis nobody else does.

---

## Repo structure

```
workflow-architect/            ← monorepo root (npm workspaces)
  packages/
    shared/                    ← Zod schemas shared by API and web
      src/
        n8n-workflow.ts        ← N8nWorkflow Zod schema (matches real n8n JSON)
        intermediate.ts        ← IRWorkflow, WorkflowDiagnosis, API response types
    n8n-catalog/               ← 62-node catalog + selection logic
      nodes.json               ← Catalog data (hand-curated)
      src/
        select.ts              ← selectNodes(), selectByTypes(), buildCatalogContext()
        index.ts               ← Package exports
  apps/
    api/                       ← Node 22 + Express backend
      src/
        index.ts               ← App entry, routes, trust proxy
        routes/
          generate.ts          ← POST /api/generate  (SSE)
          debug.ts             ← POST /api/debug     (SSE)
          health.ts            ← GET  /api/health
        services/
          classify.ts          ← Step 1: cheap Claude call → node type IDs
          build-workflow.ts    ← Step 2: build_workflow tool use → IRWorkflow
          translate.ts         ← IR → n8n JSON (pure, no LLM)
          validate.ts          ← Zod validation + credential warnings
          diagnose.ts          ← diagnose_workflow tool use + applyFixes()
          layout.ts            ← dagre layout + computeDepths()
        middleware/
          rate-limit.ts        ← Token bucket, 10 req/min per IP
          cors.ts              ← CORS_ORIGIN env var
        lib/
          set-path.ts          ← Dot-notation path setter for applyFixes
      .env.example
    web/                       ← Vite + React 19 frontend
      src/
        App.tsx                ← BrowserRouter with basename
        pages/
          Landing.tsx          ← Landing page
          AppPage.tsx          ← Main app orchestrator (keyboard shortcuts, state)
        components/
          canvas/              ← WorkflowCanvas, CustomNode, CustomEdge, EmptyState
          layout/              ← LeftRail (history), RightRail (mode panels)
          generate/            ← PromptInput (ghost text, ⌘↵)
          visualize/           ← JsonPasteInput
          debug/               ← DebugInputs, DiagnosisPanel, DiffView
          connect/             ← ConnectN8nPanel (sessionStorage only)
          command-palette/     ← CommandPalette (⌘K)
        hooks/
          useGenerate.ts       ← SSE stream → workflow state
          useDebug.ts          ← SSE stream → diagnosis state
          useWorkflowHistory.ts← localStorage history
          useN8nConnection.ts  ← sessionStorage n8n creds + deploy
        lib/
          api.ts               ← SSE stream parsers (generateWorkflow, debugWorkflow)
          parse-workflow.ts    ← n8n JSON → ReactFlow nodes/edges + animation depths
          keyboard.ts          ← registerShortcut()
        styles/
          globals.css          ← @theme tokens, ReactFlow overrides, .wf-node styles
      index.html               ← Google Fonts: Plus Jakarta Sans + IBM Plex Mono
      vite.config.ts
  ecosystem.config.js          ← PM2 config (port 3001)
  nginx.conf.example           ← Location blocks for sandipdhillon.co.uk
  deploy.sh                    ← git pull → build → pm2 reload
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Vite 6, React 19, TypeScript, Tailwind v4 |
| Canvas | @xyflow/react 12, dagre layout |
| Animations | Framer Motion 12 |
| Code editor | Monaco Editor |
| Backend | Node 22, Express 4 |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Validation | Zod 3 |
| Fonts | Plus Jakarta Sans, IBM Plex Mono (Google Fonts) |

---

## Design system

Design direction: **warm navy-slate + soft violet**. Visually distinct from the portfolio (which uses near-black + electric cyan).

### CSS variables (`globals.css` `@theme` block)

```
--color-bg:          #0f1117   (page background)
--color-canvas:      #0c0f18   (ReactFlow canvas)
--color-surface:     #161c2a   (panels, rails, nav)
--color-surface-2:   #1d2438   (cards, elevated elements)
--color-surface-3:   #252d46   (hover states)
--color-surface-4:   #2e3754   (very elevated)
--color-border:      #1e2740   (structural borders)
--color-border-2:    #2c3858   (interactive borders)
--color-text:        #e2e6f3
--color-text-muted:  #7a88ab
--color-text-faint:  #454f6a
--color-accent:      #a78bfa   (soft violet — primary accent)
--color-accent-2:    #c4b5fd   (lighter violet)
--color-accent-dim:  rgba(167,139,250,0.1)
--color-accent-glow: rgba(167,139,250,0.28)
--color-danger:      #f87171
--color-warning:     #fbbf24
--color-success:     #34d399
--shadow-sm/md/lg    (layered box shadows — no flat borders)
--radius-sm: 8px  --radius-md: 12px  --radius-lg: 18px  --radius-pill: 9999px
--font-sans: "Plus Jakarta Sans"
--font-mono: "IBM Plex Mono"
```

### UI patterns
- Mode switching is in the **top bar** as horizontal pill tabs, not the left rail
- Left rail is **history-only** (no mode switching)
- Buttons with accent background use `color: #fff` (NOT `#0a0b0d` — violet is darker than the old cyan)
- Workflow node cards use `box-shadow` for elevation + `transform: translateY(-1px)` on hover
- All motion via Framer Motion; node stagger delay = `depth * 0.12s`

---

## Architecture: generate pipeline

```
POST /api/generate  →  SSE stream of progress events

1. classifyIntent(prompt)
   → Single cheap Claude call with all 62 node displayNames
   → Returns string[] of node type IDs

2. selectByTypes(typeIds) | selectNodes(prompt)
   → Filters catalog to ≤12 relevant nodes
   → Falls back to fuzzy scoring if classify returns nothing

3. buildWorkflow(prompt, catalogNodes)
   → Claude tool use: build_workflow tool
   → System prompt has catalog context with cache_control: ephemeral
   → Validates output with IRWorkflow.safeParse()
   → Returns IRWorkflow (trigger + steps with dependsOn[])

4. translateToN8n(ir)
   → Pure function, no LLM
   → Generates UUIDs for node IDs
   → Builds connections from dependsOn (KEYED BY NODE NAME, NOT ID — critical!)
   → Calls dagre layout (rankdir: LR, 250px rankSep, 80px nodeSep)
   → Attaches depth to each node for animation stagger

5. validateWorkflow(n8nWorkflow)
   → Zod schema check
   → Credential warnings for known service nodes
   → Connection integrity check (names match)

→ event: workflow  { workflow, summary, warnings }
```

## Architecture: debug pipeline

```
POST /api/debug  →  SSE stream

1. Validate input with N8nWorkflow.safeParse() → 400 if invalid
2. extractMentionedNodes(errorText, workflow) → node names from error message
3. selectByTypes(mentionedNodeTypes) → catalog context for those nodes
4. diagnoseWorkflow tool use → WorkflowDiagnosis
5. applyFixes(workflow, diagnosis.suggestedFixes)
   → Deep clone via JSON.parse(JSON.stringify(...))
   → dot-notation path setter on each node object

→ event: diagnosis  { diagnosis, original, fixed }
```

---

## Critical gotchas

**Connections keyed by node NAME not ID.**
In n8n JSON, `workflow.connections` is a `Record<nodeName, {...}>`. The translate service explicitly builds this map from `n8nIdToName`. Never key by `node.id`.

**`typeVersion` is a number, not an integer.**
The Zod schema uses `z.number()` — decimals like `4.1` are valid. Don't use `z.int()`.

**Two-step LLM pipeline is intentional.**
Classify first (cheap, all 62 nodes), then build with a focused subset. This prevents Claude from hallucinating node types not in the catalog.

**IR `dependsOn: []` means depends on trigger.**
Empty array → runs immediately after the trigger node. Non-empty → depends on those specific step IDs.

**n8n credentials never touch the server.**
ConnectN8nPanel stores them in `sessionStorage` only. The browser calls n8n's API directly (CORS allowed by n8n Cloud). Never log or proxy credentials.

**Packages must be built before apps.**
`npm run dev` runs `build:packages` first. If you change `packages/shared` or `packages/n8n-catalog`, run `npm run build:packages` again before the API/web picks up the changes.

**`cp` replaced with cross-platform node command.**
`packages/n8n-catalog` build script uses `node -e "require('fs').copyFileSync(...)"` — not Unix `cp`.

**tsconfig project references require `composite: true`.**
`packages/shared` and `packages/n8n-catalog` set `composite: true` so the apps' project references resolve. Without it, `npm run build` hard-fails with `TS6306` (api builds with `tsc`, web with `tsc -b` — both enforce references). tsx dev mode skips type-checking so it never surfaced this; the production build does.

**SSE buffering must be disabled for nginx.**
`X-Accel-Buffering: no` header is set on all SSE responses. nginx.conf.example has `proxy_buffering off`. Both are required.

---

## Path and routing

Everything lives under `/projects/workflowarchitect/`.

| Config | Value |
|---|---|
| Vite `base` | `/projects/workflowarchitect/` |
| React Router `basename` | `/projects/workflowarchitect` |
| API prefix | `/api/...` (Express has no prefix) |
| Dev proxy | `/projects/workflowarchitect/api` → `http://localhost:3001` (rewrites prefix) |
| nginx location | `location /projects/workflowarchitect` (inside existing server block) |

---

## Environment variables

`apps/api/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Production `CORS_ORIGIN` should be `https://sandipdhillon.co.uk`.

---

## Dev commands

```bash
# From monorepo root: workflow-architect/
npm install               # install all workspaces
npm run dev               # build packages, then start API (tsx watch) + Vite concurrently

# Build only
npm run build:packages    # build shared + n8n-catalog → dist/
npm run build             # full production build (all packages + apps)

# Individual
npm run dev -w apps/api   # API only (packages must already be built)
npm run dev -w apps/web   # Vite only
```

Dev URLs:
- Frontend: `http://localhost:5173/projects/workflowarchitect/`
- API: `http://localhost:3001/api/health`

---

## Catalog (`packages/n8n-catalog/nodes.json`)

62 curated nodes. Each entry:
```json
{
  "type": "n8n-nodes-base.slack",
  "displayName": "Slack",
  "category": "Communication",
  "description": "...",
  "isTrigger": false,
  "typeVersion": 2.2,
  "keywords": ["slack", "message", "channel", "notify"],
  "requiredParameters": [{ "name": "channel", "type": "string" }],
  "optionalParameters": [...],
  "credentialsType": "slackApi",
  "examplePrompt": "post a message to Slack"
}
```

`selectNodes(intent)` scores by keyword match (keyword exact = +4, displayName = +3, corpus = +1). Always ensures at least one trigger is included. Falls back to manualTrigger + httpRequest if nothing matches.

---

## Deployment

Server runs the API with PM2 (`ecosystem.config.js`). Static files served by nginx.

```bash
# First deploy
npm install
npm run build
pm2 start ecosystem.config.js

# Subsequent deploys (deploy.sh)
git pull
npm ci
npm run build:packages
npm run build -w apps/api
npm run build -w apps/web
pm2 reload workflow-architect-api
```

nginx location block (add inside existing `server {}` for sandipdhillon.co.uk):
```nginx
location /projects/workflowarchitect/api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_buffering off;
    proxy_cache off;
    add_header X-Accel-Buffering no;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
}

location /projects/workflowarchitect/ {
    alias /path/to/workflow-architect/apps/web/dist/;
    try_files $uri $uri/ /projects/workflowarchitect/index.html;
}
```

---

## n8n setup (for acceptance testing)

No n8n instance in the dev environment. Workflow generation and debug are testable without one. To test Connect + Deploy:
1. Sign up at app.n8n.cloud (free tier, no card)
2. Settings → n8n API → Create API Key
3. In the app: Connect n8n panel → enter instance URL + key → Test Connection
4. Generate a workflow → Deploy to n8n button becomes active

---

## Rate limiting

Token bucket: 10 requests/minute per IP, in-memory. Applies to `/api/generate` and `/api/debug`. No Redis — resets on server restart. Increase `CAPACITY` in `apps/api/src/middleware/rate-limit.ts` if needed.

---

## Model

`claude-sonnet-4-6` used for all three LLM calls:
- `classifyIntent` (max_tokens: 256, no tools)
- `buildWorkflow` (max_tokens: 4096, tool_choice: forced build_workflow)
- `diagnoseWorkflow` (max_tokens: 4096, tool_choice: forced diagnose_workflow)

Catalog context is passed as a `cache_control: { type: 'ephemeral' }` system block on the build and diagnose calls. This enables prompt caching for repeated calls with the same catalog subset.
