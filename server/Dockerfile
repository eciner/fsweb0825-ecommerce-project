FROM eclipse-temurin:21.0.12.1_1-jdk-jammy AS build

WORKDIR /build
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
COPY src/ src/
RUN ./mvnw -B -ntp -DskipTests clean package

FROM eclipse-temurin:21.0.12.1_1-jre-jammy

WORKDIR /app
COPY --from=build /build/target/ecommerce-api-0.0.1-SNAPSHOT.jar /app/app.jar
USER 10001:10001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
