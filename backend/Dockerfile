FROM node:18-alpine

# Create non-root user
RUN addgroup -S ecoflow && adduser -S ecoflow -G ecoflow

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --only=production

# Copy application source
COPY . .

# Drop to non-root
USER ecoflow

EXPOSE 3000

CMD ["node", "server.js"]
