#!/bin/bash
set -e

DEPLOY_DIR="/var/www/workflow-architect"
echo "=== Deploying Workflow Architect ==="

cd "$DEPLOY_DIR"

echo "[1/5] Pulling latest code..."
git pull origin main

echo "[2/5] Installing dependencies..."
npm ci

echo "[3/5] Building shared packages..."
npm run build -w packages/shared
npm run build -w packages/n8n-catalog

echo "[4/5] Building apps..."
npm run build -w apps/api
npm run build -w apps/web

echo "[5/5] Reloading API process..."
pm2 reload workflow-architect-api --update-env

echo "=== Deploy complete ==="
pm2 status workflow-architect-api
