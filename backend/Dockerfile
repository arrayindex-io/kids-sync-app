FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Copy source code after downloading dependencies to leverage Docker cache
RUN mvn dependency:go-offline 
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Make sure the artifact name matches the one in pom.xml and target folder
COPY --from=build /app/target/kidsync-0.0.1-SNAPSHOT.jar app.jar 
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 