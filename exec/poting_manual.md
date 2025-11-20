# UniWiki 포팅 매뉴얼

> 프로젝트: **UniWiki** (대학 위키 서비스: Spring Boot 백엔드 + React/Vite 프론트)  
> 문서 목적: 새 서버/클러스터에서도 **동일 소스**로 UniWiki를 빌드·배포할 수 있도록, 필수 환경 정보와 절차를 표준화한다.

---

## 0) 저장소 구조

레포 최상단 기준:

```bash
repo-root/
├─ backend/
│  └─ uniwiki/
│     ├─ build.gradle
│     ├─ settings.gradle
│     ├─ Dockerfile            # ⇦ 백엔드 Spring Boot 컨테이너
│     ├─ gradlew / gradlew.bat
│     └─ src/
│        ├─ main/java/com/kiwi/uniwiki/
│        │  ├─ security/       # JWT, CORS, 인증/인가
│        │  ├─ domain/         # university/document/discussion/search/report 등 도메인
│        │  └─ common/         # 공통 예외/응답/유틸
│        └─ main/resources/
│           ├─ application.yml  # ⇦ 공통 설정 (DB/Redis/Elasticsearch/S3/AI/메일)
│           └─ elasticsearch/   # 인덱스 setting/mapping, synonyms
│
└─ frontend/
   └─ uniwiki/
      ├─ package.json
      ├─ vite.config.ts
      ├─ Dockerfile             # ⇦ 프론트(React SPA) 컨테이너
      ├─ nginx.conf             # ⇦ SPA + 정적 파일 서빙
      └─ src/
         ├─ layout/             # 레이아웃(루트/대학/유저/관리자 등)
         ├─ pages/              # 문서 조회/편집, 토론, 관리자 페이지
         └─ utils/              # auth, 공통 함수 등
```

---

## 1) 시스템 개요 & 기술 스택

### 1-1) 전체 구성

- **백엔드 API 서버**
  - Spring Boot 단일 애플리케이션
  - 주요 기능: 회원/인증, 대학·카테고리 관리, 문서 CRUD + 버전 관리, 토론, 신고, 검색(Elasticsearch), RAG 기반 검색 보조(AI), 이미지 업로드(S3)
  - 공개 엔드포인트는 `/api/v1/**` 패턴 사용

- **프론트엔드**
  - React + TypeScript + Vite 기반 SPA
  - UniWiki의 문서 조회/편집, 토론, 관리자 기능 UI 제공
  - 빌드 산출물은 Nginx 컨테이너에서 정적 파일로 서빙

- **외부 인프라 의존성**
  - PostgreSQL: 영속 데이터 저장
  - Redis: 캐시/토큰/이메일 인증 등
  - Elasticsearch: 문서·대학 검색, RAG용 벡터 스토어
  - AWS S3: 이미지 업로드(문서 내 첨부)
  - OpenAI API (Spring AI): 임베딩 + 챗 모델
  - SMTP(Gmail): 이메일 인증/알림

### 1-2) 주요 버전 (권장)

| 구분             | 버전/기술                         | 비고 |
|------------------|-----------------------------------|------|
| JDK              | **17**                            | Gradle toolchain 지정 |
| Spring Boot      | **3.5.6**                         | `build.gradle` 기준 |
| 빌드 도구        | Gradle 8.x (래퍼 사용)           | `./gradlew` 권장 |
| DB               | PostgreSQL **14+ 권장**           | `org.postgresql.Driver` 사용 |
| Redis            | Redis **6+ 권장**                 | 호스트명 `redis` 기준 설정 |
| Elasticsearch    | Elasticsearch **7.17+ 또는 8.x**  | Nori 분석기 사용 |
| Node.js          | Node **22** (Dockerfile 기준)     | 로컬은 18+ 권장 |
| 프론트 프레임워크| React 19 + Vite 7                 | TypeScript 5.9 |

> 운영/개발 환경 차이는 **환경 변수와 실행 옵션**으로만 나눈다. 소스 코드는 공통.

---

## 2) 외부 인프라 구성

UniWiki 백엔드는 다음 서비스를 전제한다.

1. **PostgreSQL**
   - JDBC URL: `jdbc:postgresql://<DB_HOST>:5432/<DB_NAME>`
   - 스키마는 이미 생성되어 있어야 한다.  
     - `spring.jpa.hibernate.ddl-auto=validate` 이므로, **DDL 자동 생성 안 함**  
     - 새 환경에서는 기존 DB 덤프 또는 DDL을 적용해야 한다.

2. **Redis**
   - 설정: `host=redis`, `port=6379`, `password=REDIS_PASSWORD`
   - Docker/K8s 환경에서는 `redis`라는 서비스명으로 접근하도록 구성하는 것을 가정.

3. **Elasticsearch**
   - 설정: `spring.elasticsearch.uris=${ELASTIC_URL}`
   - 사용자/비밀번호: `ELASTIC_USERNAME`, `ELASTIC_PASSWORD`
   - 인덱스 설정/매핑은 `src/main/resources/elasticsearch/*.json` 기반
   - Spring AI의 `vectorstore.elasticsearch.initialize-schema=true` 설정으로 초기 스키마 자동 생성
   - 동의어 파일 `src/main/resources/elasticsearch/synonyms.txt` 도커 컨테이너에 추가

4. **AWS S3**
   - 버킷: `${S3_BUCKET_NAME}`
   - 자격증명: `${S3_ACCESS_KEY}`, `${S3_SECRET_KEY}`
   - Region: `ap-northeast-2` 고정
   - 프론트는 presigned URL을 받아 **직접 S3로 업로드**하고, `fileUrl`만 문서 컨텐츠에 저장

5. **OpenAI (Spring AI)**
   - API base URL: `${AI_API_URL}` (예: `https://api.openai.com/v1`)
   - API 키: `${AI_API_KEY}`
   - 모델:
     - Chat: `gpt-4o-mini`
     - Embedding: `text-embedding-3-small`

6. **SMTP (Gmail)**
   - `smtp.gmail.com:587`  
   - 계정: `${GOOGLE_USERNAME}` / `${GOOGLE_PASSWORD}`  
   - TLS 활성화, AUTH 사용

---

## 3) 백엔드 환경 변수 정리

`backend/uniwiki/src/main/resources/application.yml` 기준 값들이다.  
로컬/운영 모두 **동일 키**를 사용하며 값만 환경마다 다르게 넣는다.

### 3-1) 필수 환경 변수 목록

| 이름               | 용도                                   | 예시 값 (예시일 뿐)                             |
|--------------------|----------------------------------------|-------------------------------------------------|
| `DB_URL`           | PostgreSQL JDBC URL                    | `jdbc:postgresql://db:5432/uniwiki`            |
| `DB_USERNAME`      | DB 유저                                | `uniwiki`                                      |
| `DB_PASSWORD`      | DB 비밀번호                            | `********`                                     |
| `REDIS_PASSWORD`   | Redis 비밀번호                         | `********`                                     |
| `JWT_SECRET`       | JWT 서명 시크릿                        | 임의의 32+자리 랜덤 문자열                     |
| `S3_BUCKET_NAME`   | S3 버킷 이름                           | `uniwiki-prod-bucket`                          |
| `S3_ACCESS_KEY`    | S3 Access Key                          | AWS 콘솔에서 발급                              |
| `S3_SECRET_KEY`    | S3 Secret Key                          | AWS 콘솔에서 발급                              |
| `AI_API_URL`       | OpenAI API Base URL                    | `https://api.openai.com/v1`                    |
| `AI_API_KEY`       | OpenAI API Key                         | `sk-...`                                       |
| `ELASTIC_URL`      | Elasticsearch URL                      | `http://elasticsearch:9200`                    |
| `ELASTIC_USERNAME` | Elasticsearch 유저                     | `elastic`                                      |
| `ELASTIC_PASSWORD` | Elasticsearch 비밀번호                 | `********`                                     |
| `GOOGLE_USERNAME`  | SMTP용 Gmail 주소                      | `example@gmail.com`                            |
| `GOOGLE_PASSWORD`  | SMTP 애플리케이션 비밀번호             | `********`                                     |

> 백엔드는 `spring.config.import=optional:file:.env[.properties]` 설정을 사용한다.  
> 즉, **실행 디렉터리**에 `.env` 또는 `.env.properties`를 두면 Spring Boot가 자동으로 읽는다.

### 3-2) .env 예시 (로컬 개발용)

```bash
# backend/uniwiki/.env

DB_URL=jdbc:postgresql://localhost:5432/uniwiki
DB_USERNAME=uniwiki
DB_PASSWORD=localpassword

REDIS_PASSWORD=localredis

JWT_SECRET=local-dev-secret-please-change-this

S3_BUCKET_NAME=uniwiki-local-bucket
S3_ACCESS_KEY=LOCAL_S3_ACCESS_KEY
S3_SECRET_KEY=LOCAL_S3_SECRET_KEY

AI_API_URL=https://api.openai.com/v1
AI_API_KEY=sk-...

ELASTIC_URL=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=localelastic

GOOGLE_USERNAME=example@gmail.com
GOOGLE_PASSWORD=app-password
```

---

## 4) 프론트엔드 API 엔드포인트 설정

현재 프론트 코드는 각 페이지에서 `API_BASE` 상수를 사용해 백엔드 주소를 직접 지정한다.

- 예시 (일부 파일):
  - `src/pages/DocumentViewPage.tsx`:  
    `const API_BASE = 'https://k13d104.p.ssafy.io/api';`
  - `src/pages/admin/AdminUserReportPage.tsx`:  
    `const API_BASE = "https://k13d104.p.ssafy.io/api/v1";`
- 운영 환경 전환 시 **모든 `API_BASE` 정의를 새 도메인에 맞게 수정**해야 한다.
  - 예) 공통 정책:
    - `API_BASE = 'https://<새 도메인>/api'` 로 통일
    - 각 요청에서 `/v1/**`를 붙여 사용

> 향후에는 `.env` + `import.meta.env.VITE_API_BASE` 형태로 통일하는 개선 여지가 있다.  
> 현재 포팅 매뉴얼은 **기존 구조 그대로** 사용하는 것을 기준으로 한다.

---

## 5) 로컬 개발 환경 실행 방법

### 5-1) 백엔드 (로컬 JDK 실행)

1. **사전 준비**
   - JDK 17 설치
   - 로컬/원격 PostgreSQL, Redis, Elasticsearch 준비
   - `backend/uniwiki/.env` 작성 (위 예시 참고)

2. **실행**

```bash
cd backend/uniwiki

# 빌드
./gradlew clean build

# 바로 실행 (bootRun 사용)
./gradlew bootRun

# 또는 JAR 실행
java -jar build/libs/*-SNAPSHOT.jar
```

- 기본 포트: `8080`
- 주요 엔드포인트:
  - REST API: `/api/v1/**`
  - 헬스체크: `/actuator/health`
  - Swagger UI (springdoc): `/swagger-ui/index.html` (설정에 따라 경로 상이 가능)


### 5-2) 프론트엔드 (Vite 개발 서버)

1. **사전 준비**
   - Node.js 18+ (운영은 22 기준이지만, 로컬은 LTS 사용 가능)
   - `frontend/uniwiki/src/...` 내 `API_BASE`를 로컬 백엔드에 맞게 수정  
     - 예: `http://localhost:8080/api`

2. **실행**

```bash
cd frontend/uniwiki

# 의존성 설치
npm install   # 또는 npm ci

# 개발 서버
npm run dev   # 기본 http://localhost:5173
```

- 브라우저에서 `http://localhost:5173` 접속
- CORS는 백엔드에서 `addAllowedOriginPattern("*")`로 허용되어 있어 로컬 개발에는 문제 없음  
  (운영에서는 도메인으로 좁히는 것을 권장)

---

## 6) Docker 빌드 및 실행

### 6-1) 백엔드 Docker 이미지

`backend/uniwiki/Dockerfile` 기준:

- 빌드 스테이지: `gradle:8.5-jdk17`
- 실행 스테이지: 기본 JDK 이미지 (multi-stage, `app.jar` 실행)
- 실행 명령:
  ```bash
  ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
  ```

**이미지 빌드**

```bash
cd backend/uniwiki
docker build -t uniwiki-backend:latest .
```

**컨테이너 실행 예시**

```bash
docker run -d --name uniwiki-backend \
  -p 8080:8080 \
  --env-file .env \              # 위에서 작성한 .env 재사용
  --network <공유-네트워크명> \   # DB/Redis/ES가 있는 Docker 네트워크
  uniwiki-backend:latest
```

- 헬스체크: Dockerfile에 `HEALTHCHECK` 설정  
  - `http://localhost:8080/actuator/health` 기준

### 6-2) 프론트엔드 Docker 이미지

`frontend/uniwiki/Dockerfile` 기준:

- 빌드 스테이지
  - `node:22-alpine`
  - `npm ci --legacy-peer-deps`
  - `npx vite build`
- 실행 스테이지
  - `nginx:alpine`
  - 빌드 결과물 `/usr/share/nginx/html`에 복사
  - `nginx.conf` 적용 (SPA 라우팅, 정적 파일 캐시)
  - 헬스체크: `wget http://localhost`

**이미지 빌드**

```bash
cd frontend/uniwiki
docker build -t uniwiki-frontend:latest .
```

**컨테이너 실행 예시**

```bash
docker run -d --name uniwiki-frontend \
  -p 80:80 \
  uniwiki-frontend:latest
```

> 주의: 프론트 컨테이너 안의 Nginx는 **백엔드 프록시 설정이 없다.**  
> 실제 운영에서는 상위 레벨(호스트 Nginx/Ingress/로드밸런서 등)에서  
> `/api` → 백엔드(8080), `/` → 프론트(80)로 라우팅해야 한다.  
> 프론트 코드의 `API_BASE`도 해당 도메인에 맞게 맞춰야 한다.

### 6-3) 

---

## 7) 배포
### 7-1) nginx.conf 파일
```bash
server {
    server_name k13d104.p.ssafy.io;

    # 로그
    access_log /var/log/nginx/uniwiki_access.log;
    error_log /var/log/nginx/uniwiki_error.log;

    # 업로드 크기 제한
    client_max_body_size 100M;

    # React 프론트엔드
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Spring Boot 백엔드 API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Swagger UI
    location /swagger-ui {
        proxy_pass http://localhost:8080/swagger-ui;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger API Docs
    location /v3/api-docs {
        proxy_pass http://localhost:8080/v3/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location ~ ^/api/v1/discussions/\d+/stream$ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        chunked_transfer_encoding off;
    }
    # Swagger 정적 파일
    location ~* ^/(swagger-ui.*\.(css|js|png|jpg|jpeg|gif|ico|svg))$ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Actuator
    location /actuator {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/k13d104.p.ssafy.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/k13d104.p.ssafy.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = k13d104.p.ssafy.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name k13d104.p.ssafy.io;
    return 404; # managed by Certbot


}
```
### 7-2) Jenkins 파이프라인
```bash
pipeline {
    agent any
    
    environment {
        BACKEND_IMAGE = 'uniwiki-backend'
        FRONTEND_IMAGE = 'uniwiki-frontend'
        
        // Jenkins Credentials (스크린샷에서 확인한 ID 사용)
        JWT_SECRET = credentials('JWT_SECRET')
        DB_URL = credentials('DB_URL')
        DB_USERNAME = credentials('DB_USERNAME')
        DB_PASSWORD = credentials('DB_PASSWORD')
        REDIS_PASSWORD = credentials('REDIS_PASSWORD')
        GOOGLE_USERNAME = credentials('GOOGLE_USERNAME')
        GOOGLE_PASSWORD = credentials('GOOGLE_PASSWORD')
        S3_BUCKET_NAME = credentials('S3_BUCKET_NAME')
        S3_ACCESS_KEY = credentials('S3_ACCESS_KEY')
        S3_SECRET_KEY = credentials('S3_SECRET_KEY')
        ELASTIC_URL = credentials('ELASTIC_URL')
        ELASTIC_USERNAME = credentials('ELASTIC_USERNAME')
        ELASTIC_PASSWORD = credentials('ELASTIC_PASSWORD')
        AI_API_KEY = credentials('AI_API_KEY')
        AI_API_URL = credentials('AI_API_URL')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 코드 체크아웃'
                git branch: 'develop',
                    credentialsId: 'gitlab-token1',
                    url: 'https://lab.ssafy.com/s13-final/S13P31D104.git'
                
                sh '''
                    echo "✅ 체크아웃 완료"
                    ls -la
                '''
            }
        }
        
        stage('Environment Check') {
            steps {
                sh '''
                    echo "🔍 환경 확인"
                    docker --version
                    docker-compose --version
                    echo ""
                    echo "환경변수 확인:"
                    echo "JWT_SECRET: ✅ 로드됨"
                    echo "DB_URL: ${DB_URL}"
                    echo "DB_USERNAME: ${DB_USERNAME}"
                '''
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                sh '''
                    echo "🛑 기존 컨테이너 중지 및 제거"
                    
                    # 컨테이너 강제 중지 및 제거
                    docker stop backend frontend 2>/dev/null || true
                    docker rm -f backend frontend 2>/dev/null || true
                    
                    # 완전히 제거되었는지 확인
                    sleep 2
                    
                    # 남아있는 컨테이너 확인 및 재시도
                    if docker ps -a | grep -E "backend|frontend"; then
                        echo "⚠️ 컨테이너가 남아있어 다시 제거 시도"
                        docker rm -f backend frontend 2>/dev/null || true
                        sleep 2
                    fi
                    
                    echo "✅ 컨테이너 정리 완료"
                    docker ps -a | grep -E "backend|frontend" || echo "모든 컨테이너 제거됨"
                '''
            }
        }
        
        stage('Build and Deploy Backend') {
            steps {
                script {
                    try {
                        sh '''
                            echo "🔨 백엔드 빌드 시작"
                            
                            # 기존 백엔드 컨테이너 한 번 더 확인 및 제거
                            docker rm -f backend 2>/dev/null || true
                            
                            cd backend/uniwiki
                            docker build -t ${BACKEND_IMAGE}:latest . --no-cache
                            
                            echo "🚀 백엔드 배포"
                            docker run -d \
                              --name backend \
                              --network uniwiki-net \
                              -e SPRING_PROFILES_ACTIVE=prod \
                              -e SERVER_PORT=8080 \
                              -e JWT_SECRET="${JWT_SECRET}" \
                              -e JWT_EXPIRATION=86400000 \
                              -e SPRING_DATASOURCE_URL="${DB_URL}" \
                              -e SPRING_DATASOURCE_USERNAME="${DB_USERNAME}" \
                              -e SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}" \
                              -e REDIS_PASSWORD="${REDIS_PASSWORD}" \
                              -e GOOGLE_USERNAME="${GOOGLE_USERNAME}" \
                              -e GOOGLE_PASSWORD="${GOOGLE_PASSWORD}" \
                              -e S3_BUCKET_NAME="${S3_BUCKET_NAME}" \
                              -e S3_ACCESS_KEY="${S3_ACCESS_KEY}" \
                              -e S3_SECRET_KEY="${S3_SECRET_KEY}" \
                              -e ELASTIC_URL="${ELASTIC_URL}" \
                              -e ELASTIC_USERNAME="${ELASTIC_USERNAME}" \
                              -e ELASTIC_PASSWORD="${ELASTIC_PASSWORD}" \
                              -e AI_API_KEY="${AI_API_KEY}" \
                              -e AI_API_URL="${AI_API_URL}" \
                              -p 8080:8080 \
                              --restart unless-stopped \
                              ${BACKEND_IMAGE}:latest
                            
                            # 컨테이너 실행 확인
                            sleep 3
                            if docker ps | grep -q backend; then
                                echo "✅ 백엔드 배포 성공"
                            else
                                echo "❌ 백엔드 컨테이너 실행 실패"
                                docker logs backend 2>&1 || true
                                exit 1
                            fi
                        '''
                    } catch (Exception e) {
                        echo "❌ 백엔드 빌드/배포 실패: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Build and Deploy Frontend') {
            steps {
                script {
                    try {
                        sh '''
                            echo "🔨 프론트엔드 빌드 시작"
                            
                            # 기존 프론트엔드 컨테이너 한 번 더 확인 및 제거
                            docker rm -f frontend 2>/dev/null || true
                            
                            cd frontend/uniwiki
                            docker build -t ${FRONTEND_IMAGE}:latest . --no-cache
                            
                            echo "🚀 프론트엔드 배포"
                            docker run -d \
                              --name frontend \
                              -p 3001:80 \
                              --restart unless-stopped \
                              ${FRONTEND_IMAGE}:latest
                            
                            # 컨테이너 실행 확인
                            sleep 3
                            if docker ps | grep -q frontend; then
                                echo "✅ 프론트엔드 배포 성공"
                            else
                                echo "❌ 프론트엔드 컨테이너 실행 실패"
                                docker logs frontend 2>&1 || true
                                exit 1
                            fi
                        '''
                    } catch (Exception e) {
                        echo "❌ 프론트엔드 빌드/배포 실패: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "✅ 배포 확인"
                    echo ""
                    echo "=== 실행 중인 컨테이너 ==="
                    docker ps --filter "name=backend" --filter "name=frontend"
                    echo ""
                    
                    # 백엔드 확인
                    if docker ps | grep -q backend; then
                        echo "✅ 백엔드 컨테이너 실행 중"
                        echo "백엔드 로그 (최근 20줄):"
                        docker logs backend --tail 20
                    else
                        echo "❌ 백엔드 컨테이너 없음"
                    fi
                    
                    echo ""
                    
                    # 프론트엔드 확인
                    if docker ps | grep -q frontend; then
                        echo "✅ 프론트엔드 컨테이너 실행 중"
                        echo "프론트엔드 로그 (최근 20줄):"
                        docker logs frontend --tail 20
                    else
                        echo "❌ 프론트엔드 컨테이너 없음"
                    fi
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    echo "💊 헬스 체크"
                    
                    # 백엔드 헬스체크
                    if docker ps | grep -q backend; then
                        echo "백엔드 헬스체크 대기 중..."
                        sleep 20
                        for i in {1..5}; do
                            if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
                                echo "✅ 백엔드 정상 작동"
                                curl http://localhost:8080/actuator/health
                                break
                            else
                                echo "대기 중... ($i/5)"
                                sleep 5
                            fi
                        done
                    fi
                    
                    # 프론트엔드 헬스체크
                    if docker ps | grep -q frontend; then
                        if curl -f http://localhost:3001 > /dev/null 2>&1; then
                            echo "✅ 프론트엔드 정상 작동"
                        else
                            echo "⚠️ 프론트엔드 응답 없음 (시작 중일 수 있음)"
                        fi
                    fi
                '''
            }
        }
        
        stage('Reload Nginx') {
            steps {
                sh '''
                    echo "🔄 EC2 Nginx 리로드"
                    sudo systemctl reload nginx || echo "⚠️ Nginx 리로드 실패"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                def backendRunning = sh(script: 'docker ps | grep -q backend', returnStatus: true) == 0
                def frontendRunning = sh(script: 'docker ps | grep -q frontend', returnStatus: true) == 0
                
                if (backendRunning && frontendRunning) {
                    echo '''
                    ✅✅✅ 전체 배포 성공! 🎉
                    
                    백엔드: ✅ 실행 중
                    프론트엔드: ✅ 실행 중
                    
                    접속 정보:
                    - 프론트엔드: https://k11a104.p.ssafy.io
                    - 백엔드 API: https://k11a104.p.ssafy.io/api
                    '''
                } else if (backendRunning) {
                    echo '''
                    ⚠️ 부분 배포 성공
                    
                    백엔드: ✅ 실행 중
                    프론트엔드: ❌ 실패
                    '''
                } else if (frontendRunning) {
                    echo '''
                    ⚠️ 부분 배포 성공
                    
                    백엔드: ❌ 실패
                    프론트엔드: ✅ 실행 중
                    '''
                }
            }
        }
        unstable {
            echo '''
            ⚠️ 배포 일부 성공
            
            실패한 서비스 로그를 확인하세요.
            '''
        }
        failure {
            echo '❌ 배포 완전 실패 😢'
        }
    }
}
```