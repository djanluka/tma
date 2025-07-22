# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/events.json ./
CMD ["node", "test/local-runner.js"]