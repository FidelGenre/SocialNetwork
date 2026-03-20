# Etapa 1: Build con Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copiamos el pom y el código
COPY pom.xml .
COPY src ./src
# Construimos el proyecto saltando los tests para ir más rápido
RUN mvn clean package -DskipTests

# Etapa 2: Entorno de ejecución (más liviano)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Copiamos solo el JAR generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]