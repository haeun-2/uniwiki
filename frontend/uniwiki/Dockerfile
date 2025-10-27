# 빌드 스테이지 (Node 22 사용)
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 소스 복사 및 빌드
COPY . .
RUN npx vite build

# 프로덕션 스테이지
FROM nginx:alpine

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]