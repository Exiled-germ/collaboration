# Vercel 배포 가이드

## 1. Vercel CLI 설치 (선택사항)

```bash
npm i -g vercel
```

## 2. Git 저장소 초기화

```bash
git init
git add .
git commit -m "Initial commit: PhaseFlow v2.0"
```

## 3. GitHub에 푸시 (추천)

1. GitHub에서 새 저장소 생성
2. 로컬 저장소와 연결:
```bash
git remote add origin https://github.com/YOUR_USERNAME/phaseflow.git
git branch -M main
git push -u origin main
```

## 4. Vercel에 배포

### 방법 A: Vercel 웹사이트 (추천)

1. https://vercel.com 접속
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 선택
5. **Environment Variables 설정**:
   - `VITE_SUPABASE_URL`: `https://qbxgrxvlfoqeefnznyhj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (Supabase anon key)
   - `VITE_GEMINI_API_KEY`: `AIzaSyCu8T444h9D2GG2ub_zRvv4zwIbPUsT9go`
   - `VITE_RESEND_API_KEY`: `re_HVsFQ2Rc_K6MyLcUGC9tibfpLXrknpqpn`
6. "Deploy" 클릭

### 방법 B: Vercel CLI

```bash
vercel
```

프롬프트에 따라 진행하고, 환경 변수는 Vercel 대시보드에서 설정.

## 5. 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

다음 변수들을 추가:

```
VITE_SUPABASE_URL=https://qbxgrxvlfoqeefnznyhj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyCu8T444h9D2GG2ub_zRvv4zwIbPUsT9go
VITE_RESEND_API_KEY=re_HVsFQ2Rc_K6MyLcUGC9tibfpLXrknpqpn
```

## 6. Supabase Edge Function 배포 (이메일 발송용)

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref qbxgrxvlfoqeefnznyhj

# Edge Function 배포
supabase functions deploy send-email

# Resend API 키 설정
supabase secrets set RESEND_API_KEY=re_HVsFQ2Rc_K6MyLcUGC9tibfpLXrknpqpn
```

## 7. 배포 확인

배포 완료 후:
- Vercel이 제공하는 URL 접속
- 닉네임 입력 → 온보딩 → 프로젝트 생성 테스트
- PDF 업로드 테스트
- 이메일 발송 테스트

## 8. 커스텀 도메인 (선택사항)

Vercel 대시보드 → 프로젝트 → Settings → Domains

## 주의사항

- `.env` 파일은 Git에 커밋되지 않음 (보안)
- 환경 변수는 Vercel 대시보드에서 설정
- Supabase Edge Function은 별도로 배포 필요
- 배포 후 환경 변수 변경 시 재배포 필요

## 문제 해결

### 빌드 실패
- `npm run build` 로컬에서 테스트
- TypeScript 에러 확인

### 환경 변수 인식 안 됨
- 변수 이름이 `VITE_`로 시작하는지 확인
- Vercel에서 재배포

### 이메일 발송 안 됨
- Supabase Edge Function 배포 확인
- Resend API 키 설정 확인
