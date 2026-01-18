# Frontend Dockerfile (Vite + React built and served via Nginx)

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# VITE_API_BASE_URL should be provided at build time for production
# e.g. VITE_API_BASE_URL=/api
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# 2) Nginx runtime stage
FROM nginx:1.27-alpine AS runtime

# Remove default config and add our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
