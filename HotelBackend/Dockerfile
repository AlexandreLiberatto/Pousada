FROM ubuntu:latest AS build

RUN apt-get update
RUN apt-get install openjdk-21-jdk -y
RUN apt-get install maven -y

COPY . .

RUN mvn clean install -DskipTests

FROM openjdk:21-jdk-slim

EXPOSE 9090

COPY --from=build /target/HotelBackend-1.0.0.jar app.jar

ENTRYPOINT [ "java", "-jar", "app.jar" ]
