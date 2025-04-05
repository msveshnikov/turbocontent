FROM oven/bun:1.2.5-slim as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install 

# Copy source code
COPY . .
ENV VITE_GOOGLE_CLIENT_ID=502877623167-inluia1l7i1tmuvke3uglpd4be636su6.apps.googleusercontent.com

# Build the application
RUN bun run build

WORKDIR /app/server
COPY server/package*.json server/bun.lockb ./
RUN bun install 

WORKDIR /app
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "server/index.js"]