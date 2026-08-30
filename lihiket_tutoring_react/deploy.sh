#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Lihiket Tutoring Platform — Deployment Script
# Usage: bash deploy.sh [--docker | --pm2]
# ─────────────────────────────────────────────────────────────────────────────

set -e  # exit on any error

MODE=${1:-"--pm2"}
echo "🚀 Deploying Lihiket in $MODE mode..."

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "📥 Pulling latest code..."
git pull origin master

# ── 2. Build React client ─────────────────────────────────────────────────────
echo "🔨 Building client..."
cd client
npm ci --prefer-offline
npm run build
cd ..

# ── 3. Install server deps ────────────────────────────────────────────────────
echo "📦 Installing server dependencies..."
cd server
npm ci --only=production --prefer-offline
cd ..

if [ "$MODE" = "--docker" ]; then
  # ── Docker deployment ───────────────────────────────────────────────────────
  echo "🐳 Building Docker image..."
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
  echo "✅ Docker containers started"
  docker-compose ps

else
  # ── PM2 deployment ─────────────────────────────────────────────────────────
  echo "⚙️  Restarting with PM2..."
  mkdir -p logs

  # Install PM2 if not installed
  if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
  fi

  pm2 reload ecosystem.config.js --env production || \
  pm2 start  ecosystem.config.js --env production

  pm2 save
  echo "✅ PM2 deployment complete"
  pm2 status
fi

echo ""
echo "✅ Lihiket deployed successfully!"
echo "   API:    http://localhost:5000/api/health"
echo "   Client: built into server/client/dist"
