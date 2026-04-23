#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# SecuriScan – Deploy / Update Script
# Run as the deploy user: bash deploy/deploy.sh
#
# Assumes:
#   - The repo is already cloned at APP_DIR
#   - server/.env and client/.env.local exist (see *.example files)
#   - PostgreSQL and Redis are running (run setup-vps.sh first)
#   - PM2 is installed globally
# ─────────────────────────────────────────────────────────────────────────────

APP_DIR="/var/www/securiscan"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Preflight checks ─────────────────────────────────────────────────────────
[[ -d "$APP_DIR" ]]              || error "$APP_DIR not found. Run setup-vps.sh first."
[[ -f "$APP_DIR/package.json" ]] || error "package.json not found in $APP_DIR."
[[ -f "$APP_DIR/server/.env" ]]  || error "server/.env not found. Create it from server/.env.production.example."
[[ -f "$APP_DIR/client/.env.local" ]] || error "client/.env.local not found. Create it from client/.env.production.example."

command -v node &>/dev/null || error "Node.js not installed."
command -v pm2  &>/dev/null || error "PM2 not installed. Run: npm install -g pm2"

info "Starting deployment of SecuriScan..."
cd "$APP_DIR"

# ── Pull latest code ──────────────────────────────────────────────────────────
info "Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# ── Install dependencies ───────────────────────────────────────────────────────
info "Installing dependencies..."
npm ci --workspaces --include-workspace-root

# ── Build server ──────────────────────────────────────────────────────────────
info "Building server (TypeScript → dist/)..."
npm run build -w server

# ── Generate Prisma client ────────────────────────────────────────────────────
info "Generating Prisma client..."
cd "$APP_DIR/server"
npx prisma generate

# ── Run database migrations ────────────────────────────────────────────────────
info "Running database migrations..."
npx prisma migrate deploy
cd "$APP_DIR"

# ── Build client ──────────────────────────────────────────────────────────────
info "Building Next.js client..."
npm run build -w client

# ── Copy static assets for standalone Next.js output ─────────────────────────
# next.config.ts uses output: 'standalone'; static files must be copied manually
info "Copying Next.js static assets to standalone output..."
cp -r "$APP_DIR/client/public" "$APP_DIR/client/.next/standalone/public" 2>/dev/null || true
mkdir -p "$APP_DIR/client/.next/standalone/.next"
cp -r "$APP_DIR/client/.next/static" "$APP_DIR/client/.next/standalone/.next/static"

# ── Start / reload PM2 processes ──────────────────────────────────────────────
info "Reloading PM2 processes..."
pm2 startOrReload "$APP_DIR/deploy/ecosystem.config.js" --env production

# Persist PM2 process list so it survives reboots
pm2 save

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
info "════════════════════════════════════════════════════════"
info " Deployment complete!"
info "════════════════════════════════════════════════════════"
pm2 list
echo ""
info "View logs:  pm2 logs"
info "Monitor:    pm2 monit"
info "API health: curl http://localhost:4000/api/health"
echo ""
