# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 (TypeScript strict 모드 비활성화)
ENV CI=false
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine

# 빌드 결과물 복사 (Vite는 dist 폴더)
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]