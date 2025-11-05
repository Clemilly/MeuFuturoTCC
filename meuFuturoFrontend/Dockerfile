# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build arguments para variáveis NEXT_PUBLIC
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_AI_ENABLED
ARG NEXT_PUBLIC_ANALYTICS_ENABLED

# Set environment variables para o build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_AI_ENABLED=${NEXT_PUBLIC_AI_ENABLED}
ENV NEXT_PUBLIC_ANALYTICS_ENABLED=${NEXT_PUBLIC_ANALYTICS_ENABLED}

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
