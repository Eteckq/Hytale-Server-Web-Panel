# Build Stage 1

FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and lockfile first (for better cache)
COPY package.json package-lock.json ./

# Install dependencies (this layer will be cached if package.json doesn't change)
RUN npm ci

# Copy configuration files (these change less frequently)
COPY nuxt.config.ts tsconfig.json tailwind.config.js ./

# Copy source directories (copy by layer for better cache)
COPY app/ ./app/
COPY server/ ./server/
COPY public/ ./public/
COPY assets/ ./assets/

# Build the project (this will only rebuild if source files change)
RUN npm run build

# Build Stage 2

FROM node:22-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0
ENV STACK_NAME="hytale"
ENV PANEL_PASSWORD="pass"
ENV JWT_SECRET="cc"

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]