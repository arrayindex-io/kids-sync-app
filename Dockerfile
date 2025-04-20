# This is a build script Dockerfile for Render deployment
# It will be used to build both frontend and backend services

# Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 spring
RUN adduser --system --uid 1001 spring
RUN chown -R spring:spring /app

# Copy the built frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy the built backend
COPY --from=backend-builder /app/backend/target/kids-sync-app-0.0.1-SNAPSHOT.jar app.jar
RUN chown spring:spring app.jar

USER spring

# Expose the ports
EXPOSE 8080 3000

# Start the application
CMD ["java", "-jar", "app.jar"] 