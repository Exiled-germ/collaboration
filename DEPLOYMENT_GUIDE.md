# PhaseFlow v2.1 - 배포 가이드

## 🚀 배포 준비

### 1. 환경 변수 설정

#### 필수 환경 변수
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### 선택 환경 변수
```bash
VITE_RESEND_API_KEY=re_your_resend_key          # 이메일 발송용
VITE_NOTION_API_KEY=secret_your_notion_key      # Notion 통합용 (UI에서도 설정 가능)
```

### 2. Supabase 설정

#### 프로젝트 생성
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Project URL과 anon key 복사

#### 데이터베이스 마이그레이션
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

또는 Supabase Dashboard에서:
1. SQL Editor 열기
2. `supabase/migrations/20251114220000_phaseflow_v2_schema.sql` 내용 복사
3. 실행

### 3. Google Gemini API 설정

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. API 키 생성
3. `.env`에 추가

### 4. Resend 설정 (선택)

1. [Resend](https://resend.com) 가입
2. API Keys에서 새 키 생성
3. `.env`에 추가
4. (선택) 도메인 인증 설정

### 5. Notion 설정 (선택)

1. [Notion Integrations](https://www.notion.so/my-integrations) 방문
2. New integration 생성
3. Internal Integration Token 복사
4. `.env`에 추가 (또는 UI에서 입력)

## 📦 빌드

### 로컬 빌드
```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 빌드 결과 확인
```bash
# dist 폴더 확인
ls -la dist/

# 예상 파일:
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
#   - vendor-react-[hash].js
#   - vendor-ui-[hash].js
#   - vendor-ai-[hash].js
#   - vendor-notion-[hash].js
#   - vendor-pdf-[hash].js
#   - vendor-ocr-[hash].js
```

## 🌐 배포 플랫폼

### Vercel (권장)

#### 자동 배포
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com) 로그인
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정
6. Deploy 클릭

#### CLI 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 환경 변수 설정
```bash
# Vercel Dashboard에서:
Settings → Environment Variables

# 또는 CLI:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_RESEND_API_KEY
vercel env add VITE_NOTION_API_KEY
```

### Netlify

#### 자동 배포
1. GitHub에 코드 푸시
2. [Netlify](https://netlify.com) 로그인
3. "New site from Git" 클릭
4. GitHub 저장소 선택
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 환경 변수 설정
7. Deploy 클릭

#### CLI 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

#### 환경 변수 설정
```bash
# Netlify Dashboard에서:
Site settings → Environment variables

# 또는 netlify.toml:
[build.environment]
  VITE_SUPABASE_URL = "your_url"
  VITE_SUPABASE_ANON_KEY = "your_key"
  VITE_GEMINI_API_KEY = "your_key"
```

### AWS Amplify

#### 배포
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 열기
2. "New app" → "Host web app" 클릭
3. GitHub 연결
4. 저장소 선택
5. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
6. 환경 변수 설정
7. Save and deploy

### Docker

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 빌드 및 실행
```bash
# 이미지 빌드
docker build -t phaseflow:v2.1 .

# 컨테이너 실행
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_GEMINI_API_KEY=your_key \
  phaseflow:v2.1
```

## 🔒 보안 설정

### Supabase RLS 확인
```sql
-- team_members 테이블
SELECT * FROM pg_policies WHERE tablename = 'team_members';

-- projects 테이블
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- 모든 테이블에 RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### CORS 설정
Supabase Dashboard:
1. Settings → API
2. CORS Allowed Origins에 배포 URL 추가
   - `https://your-app.vercel.app`
   - `https://your-app.netlify.app`

### API 키 보호
- 환경 변수로만 관리
- `.env` 파일은 `.gitignore`에 포함
- 프로덕션 키와 개발 키 분리
- 정기적으로 키 로테이션

## 📊 모니터링

### Vercel Analytics
```bash
# Vercel Analytics 활성화
vercel analytics enable
```

### Supabase Monitoring
1. Supabase Dashboard → Reports
2. API Usage 확인
3. Database Performance 확인
4. Realtime Connections 확인

### Error Tracking
```bash
# Sentry 통합 (선택)
npm install @sentry/react @sentry/vite-plugin

# vite.config.ts에 추가
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: "your-org",
      project: "phaseflow",
    }),
  ],
});
```

## 🧪 배포 후 테스트

### 체크리스트
- [ ] 홈페이지 로드 확인
- [ ] 로그인/회원가입 작동
- [ ] 온보딩 3단계 완료
- [ ] 프로젝트 생성 및 Phase 생성
- [ ] PDF 업로드 및 파싱
- [ ] 이미지 업로드 및 OCR
- [ ] Notion 통합 테스트
- [ ] 이메일 발송 테스트
- [ ] Activity Timeline 실시간 업데이트
- [ ] 모바일 반응형 확인

### 성능 테스트
```bash
# Lighthouse 실행
npx lighthouse https://your-app.vercel.app --view

# 목표:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

## 🔄 CI/CD 설정

### GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📱 도메인 설정

### Vercel
1. Vercel Dashboard → Settings → Domains
2. Add Domain 클릭
3. 도메인 입력 (예: phaseflow.app)
4. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Netlify
1. Netlify Dashboard → Domain settings
2. Add custom domain 클릭
3. 도메인 입력
4. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: @
   Value: your-site.netlify.app
   ```

### SSL 인증서
- Vercel/Netlify는 자동으로 Let's Encrypt SSL 제공
- 별도 설정 불필요

## 🔧 문제 해결

### 빌드 실패
```bash
# 캐시 클리어
rm -rf node_modules package-lock.json dist
npm install
npm run build

# 메모리 부족
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### 환경 변수 미적용
- 빌드 시 환경 변수가 설정되어 있는지 확인
- `VITE_` 접두사 확인
- 배포 플랫폼에서 환경 변수 재확인
- 재배포 필요

### Supabase 연결 실패
- URL과 anon key 확인
- CORS 설정 확인
- RLS 정책 확인
- 네트워크 방화벽 확인

### 이메일 발송 실패
- Resend API 키 확인
- 도메인 인증 상태 확인
- Rate limit 확인
- 콘솔 에러 확인

## 📈 스케일링

### 데이터베이스
- Supabase Pro 플랜 고려
- 인덱스 최적화
- 쿼리 최적화
- Connection pooling

### CDN
- Vercel/Netlify는 자동 CDN 제공
- 정적 자산 캐싱
- 이미지 최적화

### 성능 모니터링
- Vercel Analytics
- Supabase Monitoring
- Sentry Error Tracking
- Google Analytics

## 🎯 배포 체크리스트

### 배포 전
- [ ] 모든 환경 변수 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 로컬 빌드 성공
- [ ] 로컬 테스트 완료
- [ ] Git 커밋 및 푸시

### 배포 중
- [ ] 배포 플랫폼 선택
- [ ] 저장소 연결
- [ ] 빌드 설정 확인
- [ ] 환경 변수 입력
- [ ] 배포 실행

### 배포 후
- [ ] 배포 성공 확인
- [ ] 프로덕션 URL 접속
- [ ] 기능 테스트
- [ ] 성능 테스트
- [ ] 모니터링 설정
- [ ] 도메인 연결 (선택)
- [ ] SSL 인증서 확인

## 🆘 긴급 대응

### 롤백
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Git
git revert HEAD
git push
```

### 긴급 패치
1. 버그 수정
2. 로컬 테스트
3. 긴급 배포
4. 모니터링

### 장애 대응
1. 에러 로그 확인
2. Supabase 상태 확인
3. API 상태 확인
4. 사용자 공지
5. 문제 해결
6. 재배포

---

**배포 성공을 기원합니다! 🚀**

문제가 발생하면 [GitHub Issues](https://github.com/your-repo/issues)에 문의하세요.
