# ── Stage 1: Build React client ──────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --prefer-offline

COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install only production server deps
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production --prefer-offline

# Copy server source
COPY server/ ./server/

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p ./server/uploads ./logs

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server/src/server.js"]
