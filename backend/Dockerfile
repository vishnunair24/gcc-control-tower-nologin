# Backend Dockerfile
# Multi-stage to keep runtime image small and Prisma-compatible

FROM node:20-bullseye-slim AS base
WORKDIR /app

# Install system dependencies needed by Prisma (OpenSSL)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install

# Copy source
COPY . .

# Generate Prisma client (needs devDependency prisma + @prisma/client)
RUN npx prisma generate

# Runtime image
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

# Install system dependencies needed by Prisma (OpenSSL)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Copy installed node_modules and app source
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/. ./

ENV NODE_ENV=production
ENV PORT=3001

# Expose internal port
EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
