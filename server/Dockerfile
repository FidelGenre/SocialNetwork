# Paso 1: Construcción (Asegúrate de que este paso también use una imagen válida)
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Paso 2: Ejecución (Aquí es donde fallaba antes)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Ajusta el nombre del .jar según el nombre de tu proyecto
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]