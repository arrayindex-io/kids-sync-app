# Use multi-stage build
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM maven:3.8.4-openjdk-17 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy the built backend
COPY --from=backend-builder /app/backend/target/*.jar ./backend/app.jar

# Copy docker-compose and other necessary files
COPY docker-compose.yml .
COPY .env .

# Expose necessary ports
EXPOSE 8080 3000 27017

# Start the application using docker-compose
CMD ["docker-compose", "up", "--build"] 