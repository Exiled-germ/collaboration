# PhaseFlow v2.1 - 빠른 시작 가이드

## ⚡ 5분 안에 시작하기

### 1단계: 저장소 클론 (30초)

```bash
git clone https://github.com/your-username/phaseflow.git
cd phaseflow
```

### 2단계: 의존성 설치 (1분)

```bash
npm install
```

### 3단계: 환경 변수 설정 (2분)

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 편집:
```bash
# 필수
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# 선택 (나중에 추가 가능)
VITE_RESEND_API_KEY=re_your_key
VITE_NOTION_API_KEY=secret_your_key
```

#### 빠른 API 키 발급

**Supabase** (1분)
1. [supabase.com](https://supabase.com) 가입
2. New project 클릭
3. Project Settings → API에서 URL과 anon key 복사

**Google Gemini** (30초)
1. [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) 방문
2. Create API key 클릭
3. 키 복사

### 4단계: 데이터베이스 설정 (1분)

Supabase Dashboard에서:
1. SQL Editor 열기
2. `supabase/migrations/20251114220000_phaseflow_v2_schema.sql` 파일 내용 복사
3. Run 클릭

### 5단계: 개발 서버 실행 (30초)

```bash
npm run dev
```

브라우저에서 http://localhost:8080 열기

## 🎯 첫 프로젝트 만들기 (5분)

### 1. 회원가입/로그인
- 이메일과 비밀번호 입력
- 또는 소셜 로그인 (Supabase 설정 필요)

### 2. 온보딩 Step 1: 회사 소개
```
회사명: TechStartup Inc.
설명: AI 기반 SaaS 스타트업으로 5명의 팀원이 있습니다.
```

### 3. 온보딩 Step 2: 프로젝트 설명
```
프로젝트명: AI 챗봇 서비스
목표: 고객 지원 자동화를 위한 AI 챗봇 개발
주요 기능:
- 자연어 처리
- 다국어 지원
- 대시보드
- API 통합
```

### 4. 온보딩 Step 3: 팀원 프로필

**팀원 1**
- 이름: 김철수
- 역할: Backend Developer
- 이메일: chulsoo@example.com
- Loves: Python, FastAPI, AI/ML
- Hates: Frontend, CSS
- Tools: Python, Docker, PostgreSQL
- Career: 5년 경력, AI 스타트업 근무

**팀원 2**
- 이름: 이영희
- 역할: Frontend Developer
- 이메일: younghee@example.com
- Loves: React, UI/UX, 애니메이션
- Hates: Backend, 데이터베이스
- Tools: React, TypeScript, Tailwind
- Career: 3년 경력, 웹 에이전시 근무

**팀원 3**
- 이름: 박민수
- 역할: Product Manager
- 이메일: minsu@example.com
- Loves: 사용자 인터뷰, 기획, 데이터 분석
- Hates: 코딩, 디자인
- Tools: Notion, Figma, Google Analytics
- Career: 4년 경력, PM 경험

### 5. AI가 Phase 생성
- 자동으로 4-6개 Phase 생성
- 각 Phase에 팀원 자동 배치
- Milestone과 KPI 설정

### 6. Dashboard 확인
- Phase 카드 확인
- 팀원 배치 확인
- Activity Timeline 확인

## 🚀 주요 기능 체험 (10분)

### PDF 업로드 및 분석
1. Dashboard → Artifact Upload
2. Phase 선택
3. PDF 파일 업로드
4. AI 분석 결과 확인
5. 협업자 추천 확인

### 이미지 OCR
1. 텍스트가 포함된 이미지 준비
2. Artifact Upload에서 이미지 업로드
3. OCR 진행률 확인
4. 추출된 텍스트 확인

### Notion 통합
1. Notion Integration 생성
2. Dashboard → Notion Import
3. API 키 입력
4. Notion 페이지 URL 입력
5. 가져오기 실행

### 이메일 알림
1. Artifact 업로드
2. AI가 초대 생성
3. AI Invites 패널에서 확인
4. (Resend 설정 시) 실제 이메일 발송

### Activity Timeline
1. Phase 시작/완료
2. Artifact 업로드
3. Activity Timeline에서 실시간 확인

## 📚 다음 단계

### 기본 사용법 익히기
- [FEATURES.md](./FEATURES.md) - 전체 기능 목록
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 테스트 가이드

### 고급 기능 설정
- [SETUP.md](./SETUP.md) - 상세 설정 가이드
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 배포 가이드

### 문제 해결
- [README.md](./README.md) - 프로젝트 개요
- [CHANGELOG.md](./CHANGELOG.md) - 변경 이력

## 💡 유용한 팁

### 개발 모드
```bash
# 개발 서버 (Hot reload)
npm run dev

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```

### 빌드 및 미리보기
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 데이터베이스 관리
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경
supabase start

# 마이그레이션 생성
supabase migration new your_migration_name

# 마이그레이션 적용
supabase db push
```

## 🆘 자주 묻는 질문

**Q: Supabase 무료 플랜으로 충분한가요?**
A: 네, 개발 및 소규모 팀에는 충분합니다. 500MB 데이터베이스, 1GB 파일 스토리지, 50,000 MAU를 제공합니다.

**Q: Gemini API는 무료인가요?**
A: 네, 일정 할당량까지 무료입니다. 자세한 내용은 [Google AI Studio](https://makersuite.google.com/app/apikey)를 참고하세요.

**Q: 이메일 발송이 필수인가요?**
A: 아니요, 선택사항입니다. Resend API 키 없이도 모든 기능을 사용할 수 있습니다. 이메일은 콘솔에 로그로 출력됩니다.

**Q: Notion 통합이 필수인가요?**
A: 아니요, 선택사항입니다. Notion을 사용하지 않아도 모든 기능을 사용할 수 있습니다.

**Q: 모바일에서도 사용할 수 있나요?**
A: 네, 반응형 디자인으로 모바일에서도 사용 가능합니다. 다만 데스크톱 환경이 더 최적화되어 있습니다.

**Q: 데이터는 어디에 저장되나요?**
A: Supabase PostgreSQL 데이터베이스에 저장됩니다. 모든 데이터는 사용자별로 격리되어 있습니다 (RLS).

**Q: 팀원을 초대할 수 있나요?**
A: 현재는 AI가 생성한 초대를 이메일로 발송하는 기능만 있습니다. 실제 팀원 초대 및 권한 관리는 향후 버전에서 추가될 예정입니다.

**Q: 오프라인에서도 사용할 수 있나요?**
A: 아니요, 인터넷 연결이 필요합니다. Supabase와 Gemini API를 사용하기 때문입니다.

## 🎓 학습 자료

### 공식 문서
- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Supabase 가이드](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

### 관련 기술
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)

## 🤝 커뮤니티

### 도움 받기
- GitHub Issues: 버그 리포트 및 기능 요청
- GitHub Discussions: 질문 및 토론
- Discord: 실시간 채팅 (준비 중)

### 기여하기
- Pull Request 환영
- 코드 리뷰 참여
- 문서 개선
- 번역 지원

## 📊 프로젝트 상태

- ✅ v2.0: 기본 기능 완성
- ✅ v2.1: 고급 기능 추가
- 🚧 v2.2: 실시간 협업 (계획 중)
- 🚧 v3.0: 모바일 앱 (계획 중)

---

**PhaseFlow와 함께 프로젝트를 성공적으로 관리하세요! 🚀**

문제가 있으면 [GitHub Issues](https://github.com/your-repo/issues)에 문의하세요.
