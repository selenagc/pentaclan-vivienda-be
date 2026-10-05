# ==============================================================================
# Base stage: common Node.js 22 LTS Alpine runtime
# ==============================================================================
FROM node:22-alpine AS base

# Install dumb-init to properly handle PID 1 and forward process signals
RUN apk add --no-cache dumb-init

WORKDIR /app

# ==============================================================================
# Dependencies stage: install full dependencies for building
# ==============================================================================
FROM base AS dependencies

# Build tools for compiling native C/C++ addons if needed (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

# Copy root manifest and workspace package definitions
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Clean install of all dependencies
RUN npm ci

# ==============================================================================
# Builder stage: compile TypeScript workspaces and prune devDependencies
# ==============================================================================
FROM dependencies AS builder

# Copy source code and assets
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Compile workspaces in dependency order
RUN npm run build --workspace=@pentaclan/shared
RUN npm run build --workspace=@pentaclan/api

# Prune devDependencies to keep the production layer minimal
RUN npm prune --omit=dev

# Remove TypeScript source and tests to minimize footprint
RUN rm -rf packages/shared/src apps/api/src apps/api/tests

# ==============================================================================
# Production Runner stage
# ==============================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Copy root package.json and pruned node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy shared package and built API
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/apps/api ./apps/api

# Run as unprivileged node user
USER node

WORKDIR /app/apps/api

EXPOSE 3000

# Health check using built-in busybox wget against the API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
