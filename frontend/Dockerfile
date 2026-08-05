# ==============================================================================
# STAGE 1: Build React static assets
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to maximize Docker layer cache
COPY package.json package-lock.json ./

# Install dependencies using clean install
RUN npm ci

# Copy application source files
COPY . .

# Build production bundle to /app/dist
RUN npm run build


# ==============================================================================
# STAGE 2: Production NGINX web server
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default Nginx HTML website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP web port
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
