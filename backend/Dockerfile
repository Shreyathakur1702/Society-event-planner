FROM openjdk:17-jdk-slim

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

# Copy project source
COPY src src

RUN ./mvnw package -DskipTests && mv target/*.jar app.jar

CMD ["java", "-jar", "app.jar"]