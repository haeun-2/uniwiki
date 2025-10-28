# 빌드 스테이지
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Gradle 설정 파일 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 의존성 다운로드 (캐싱 최적화)
RUN gradle dependencies --no-daemon || true

# 소스 코드 복사
COPY src ./src

# 빌드 (테스트 제외)
RUN gradle clean build -x test --no-daemon

# 실행 스테이지
FROM openjdk:17-slim

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 실행
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]