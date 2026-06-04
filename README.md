# Workflow Architect

Generate, visualise, and debug n8n workflows with AI.

**Live:** [sandipdhillon.co.uk/projects/workflowarchitect](https://sandipdhillon.co.uk/projects/workflowarchitect)

## Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion + @xyflow/react
- **Backend:** Node 22 + Express + TypeScript
- **AI:** Claude Sonnet 4.6 via Anthropic SDK (tool use + prompt caching)
- **Process manager:** PM2
- **Reverse proxy:** Nginx (location block in existing portfolio server)

## Setup

### 1. Prerequisites

- Node 22+
- npm 10+
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install

```bash
git clone <repo-url> workflow-architect
cd workflow-architect
cp .env.example apps/api/.env
# Edit apps/api/.env with your ANTHROPIC_API_KEY
npm install
```

### 3. Development

```bash
npm run dev
# Frontend: http://localhost:5173/projects/workflowarchitect/
# API:      http://localhost:3001
```

### 4. Build

```bash
npm run build
```

### 5. Production deploy

```bash
# First deploy
cp nginx.conf.example /etc/nginx/snippets/workflow-architect.conf
# Add 'include /etc/nginx/snippets/workflow-architect.conf;' to your server block
sudo nginx -t && sudo systemctl reload nginx
pm2 start ecosystem.config.js
pm2 save

# Subsequent deploys
./deploy.sh
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (get from console.anthropic.com) |
| `PORT` | No | API server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Allowed origin (default: http://localhost:5173) |

## Acceptance testing

To test generated workflows import cleanly into n8n:

1. Sign up for [n8n Cloud free tier](https://n8n.io)
2. Use the 10 example prompts in `examples/prompts/`
3. Copy the generated JSON and import via n8n → New Workflow → Import from file
4. Verify each workflow opens without errors

## Testing Debug mode

Use the broken workflow corpus in `examples/broken/`:

```bash
# Example: test missing credentials case
curl -X POST http://localhost:3001/api/debug \
  -H "Content-Type: application/json" \
  -d "{\"workflow\": $(cat examples/broken/01-missing-credentials/workflow.json), \"error\": \"$(cat examples/broken/01-missing-credentials/error.txt)\"}"
```

## Architecture

```
apps/api       Express backend — classify → build IR → translate → validate
apps/web       React SPA — canvas, generate, visualize, debug modes
packages/
  shared       Zod schemas for n8n workflow + intermediate representation
  n8n-catalog  ~62 curated node definitions + keyword selector
examples/      Test prompts, real n8n exports, broken workflow corpus
docs/          Debug mode error reference
```

## License

MIT
