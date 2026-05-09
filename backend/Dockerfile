# Multi-stage build for backend - Optimized for production

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (install both prod and dev dependencies for building)
COPY package*.json ./

# Install all dependencies (including devDependencies for any build steps)
RUN npm ci

# Copy source code
COPY app.js .

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only package files
COPY package*.json ./

# Install only production dependencies - clean and minimal
RUN npm ci --only=production && npm cache clean --force

# Copy only necessary files from builder
COPY --from=builder /app/app.js .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use dumb-init to properly handle signals (SIGTERM for graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "app.js"]
