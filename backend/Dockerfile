# Stage 1: Build the application with Maven
FROM maven:3.9-eclipse-temurin-17-alpine as builder
WORKDIR /app

# CORRECT: Copy only the pom.xml from the osapi sub-folder
COPY osapi/pom.xml .

# This downloads dependencies based on the pom.xml
RUN mvn dependency:go-offline

# CORRECT: Copy only the src directory from the osapi sub-folder
COPY osapi/src ./src

# This builds the application into a .jar file
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image with the JRE and Docker CLI
FROM openjdk:17-slim

# Copy the Docker command-line tool from the official Docker image
COPY --from=docker:latest /usr/local/bin/docker /usr/local/bin/

WORKDIR /app
# Copy the executable JAR that was created in the builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]