# ==========================================================================
# Stage 1 : BUILD
# ==========================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ==========================================================================
# Stage 2 : RUNTIME
# ==========================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/*.jar app.jar

LABEL maintainer="restauranthub" \
      service="service-order" \ 
      version="1.0.0"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \ 
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

USER appuser

EXPOSE 8080

ENTRYPOINT [ "java", \
    "-XX:+UseContainerSupport", \ 
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "app.jar"]