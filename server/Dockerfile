# Paso 1: Construcción (Build)
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copiamos el pom y el código fuente
COPY pom.xml .
COPY src ./src
# Compilamos el proyecto saltando los tests para acelerar el despliegue
RUN mvn clean package -DskipTests

# Paso 2: Ejecución (Run)
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copiamos el archivo .jar generado en el paso anterior
COPY --from=build /app/target/*.jar app.jar
# Exponemos el puerto 8080 (el que configuraste en tus variables)
EXPOSE 8080
# Comando para arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]