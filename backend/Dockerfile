# Backend Dockerfile
# Multi-stage to keep runtime image small

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install

# Copy source
COPY . .

# Generate Prisma client (needs devDependency prisma + @prisma/client)
RUN npx prisma generate

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy installed node_modules and app source
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/. ./

ENV NODE_ENV=production
ENV PORT=3001

# Expose internal port
EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
