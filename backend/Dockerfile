FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Copy source code after downloading dependencies to leverage Docker cache
RUN mvn dependency:go-offline 
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 spring
RUN adduser --system --uid 1001 spring
RUN chown -R spring:spring /app

# Make sure the artifact name matches the one in pom.xml and target folder
COPY --from=build /app/target/kids-sync-app-0.0.1-SNAPSHOT.jar app.jar
RUN chown spring:spring app.jar

USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 