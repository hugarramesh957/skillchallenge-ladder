# Production Multi-Stage Dockerfile for SkillChallenge Ladder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definitions
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm --prefix client install
RUN npm --prefix server install --omit=dev

# Copy application sources
COPY client/ ./client/
COPY server/ ./server/

# Build React client
RUN npm --prefix client run build

# Production Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy server and built client
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5000

CMD ["node", "server.js"]
