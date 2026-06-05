# Base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy all source files (required to resolve all monorepo workspaces and files)
COPY . .

# Install all dependencies (including devDependencies required for the build)
RUN npm ci

# Build the backend service and its dependencies
RUN npx turbo run build --filter=@admin-panel/admin-service...

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built workspace and node_modules from the builder stage
COPY --from=builder /app ./

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 54321

# Start the service
CMD ["node", "apps/admin-service/dist/index.js"]
