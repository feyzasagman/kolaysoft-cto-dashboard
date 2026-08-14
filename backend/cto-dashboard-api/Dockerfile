# Multi-stage build — Kolaysoft CTO Dashboard API
# Build: Maven + JDK 21 | Runtime: JRE 21 (non-root)

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml
RUN chmod +x mvnw \
  && ./mvnw -B -q dependency:go-offline -DskipTests

COPY src src
RUN ./mvnw -B -q clean package -DskipTests \
  && cp target/cto-dashboard-api-*.jar /workspace/app.jar

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system spring \
  && useradd --system --gid spring --home-dir /app --shell /usr/sbin/nologin spring

COPY --from=build /workspace/app.jar /app/app.jar
RUN chown spring:spring /app/app.jar

USER spring
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=12 \
  CMD wget -qO- http://127.0.0.1:${PORT:-8080}/actuator/health/readiness >/dev/null || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
