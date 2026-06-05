# Base image
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci

# Vite embeds environment variables at build time. 
# We declare it as a build argument so Railway can pass it during build.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend and its dependencies
RUN npx turbo run build --filter=@admin-panel/admin-frontend...

# Runner stage using a lightweight web server (serve)
FROM node:18-alpine AS runner
WORKDIR /app
RUN npm install -g serve

# Copy only the compiled static assets from the builder stage
COPY --from=builder /app/apps/admin-frontend/dist ./dist

# Expose port (Railway automatically binds to this)
EXPOSE 3000

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "3000"]
