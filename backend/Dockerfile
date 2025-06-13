# Stage 1: Build the application with Maven
FROM maven:3.9-eclipse-temurin-17-alpine as builder
WORKDIR /app
COPY osapi/pom.xml .
RUN mvn dependency:go-offline
COPY osapi/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image with only the JRE
FROM openjdk:17-slim
WORKDIR /app
# Copy the executable JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar
# Expose the port the application runs on
EXPOSE 8080
# The command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]