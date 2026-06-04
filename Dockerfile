# ─── STAGE 1: BUILD THE FRONTEND ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy codebase and compile assets
COPY . .
RUN npm run build

# ─── STAGE 2: PRODUCTION SERVER RUNTIME ────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency files and install production-only modules
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built frontend assets and server runner script
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Assign ownership to node non-root user for security
RUN chown -R node:node /app

USER node

EXPOSE 3000

# Container Healthcheck (uses Node 20 built-in fetch api)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.json()).then(d => { if(d.status !== 'UP') process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "server.js"]
