# PhaseFlow v2.0 - 기능 목록

## 🎯 핵심 기능

### 1. AI 기반 프로젝트 분석
- **Google Gemini 2.0 Flash** 통합
- 프로젝트 설명으로부터 자동 Phase 생성
- 팀원 프로필 기반 최적 인력 배치
- 작업물 분석 및 협업자 추천

### 2. 3단계 온보딩 시스템
- **Step 1**: 회사/조직 소개
- **Step 2**: 프로젝트 설명 및 목표
- **Step 3**: 팀원 프로필 입력
  - 이름, 역할, 이메일 (필수)
  - Loves (선호 업무)
  - Hates (비선호 업무)
  - Tools (사용 도구/기술)
  - Career (경력 정보)

### 3. Phase 관리 시스템
- **상태 추적**: pending → in-progress → completed
- **시각적 표시**: 아이콘 및 색상 코딩
- **Phase 액션**: Start/Complete 버튼
- **상세 정보**: Milestone, Deadline, KPIs
- **팀원 배치**: Recommended vs Active
- **Phase 개선**: AI 기반 구조 수정 및 미리보기

### 4. 파일 업로드 및 분석
- **지원 파일 타입**:
  - 텍스트 파일 (.txt, .md, etc.)
  - PDF 문서 (pdfjs-dist)
  - 이미지 (Tesseract.js OCR - 한글/영어)
- **자동 파싱**: 파일 내용 자동 추출
- **AI 분석**: 업로드된 작업물 분석 및 협업자 추천

### 5. 이메일 알림 시스템
- **Resend API** 통합
- **자동 초대 생성**: AI가 개인화된 메시지 생성
- **HTML 이메일 템플릿**: 아름다운 디자인
- **배치 발송**: 여러 초대를 한 번에 처리
- **개발 모드**: API 키 없이도 콘솔 로그로 테스트 가능

### 6. Notion 통합
- **페이지 가져오기**: Notion 페이지 내용 추출
- **데이터베이스 가져오기**: 여러 페이지 일괄 가져오기
- **자동 파싱**: 
  - 제목, 본문, 속성 추출
  - 다양한 블록 타입 지원 (헤딩, 리스트, 코드, 등)
- **UI 통합**: Dashboard에서 직접 사용 가능

### 7. 실시간 활동 타임라인
- **실시간 업데이트**: Supabase Realtime 구독
- **활동 타입**:
  - phase_created: Phase 생성
  - phase_started: Phase 시작
  - phase_completed: Phase 완료
  - member_added: 팀원 추가
  - artifact_uploaded: 작업물 업로드
  - invite_sent: 초대 발송
  - phase_refined: Phase 구조 개선
- **시각적 표시**: 아이콘, 색상, 시간 표시
- **메타데이터**: 각 활동의 상세 정보

### 8. 데이터베이스 시스템
- **Supabase PostgreSQL** 기반
- **테이블 구조**:
  - `team_members`: 팀원 프로필
  - `projects`: 프로젝트 정보
  - `phases`: Phase 상세 추적
  - `ai_invites`: AI 생성 초대
  - `artifacts`: 업로드된 작업물
  - `activity_timeline`: 활동 로그
- **Row Level Security (RLS)**: 사용자별 데이터 격리
- **실시간 동기화**: 변경사항 즉시 반영

## 🚀 고급 기능

### AI 초대 시스템
- 작업물 분석 후 자동으로 필요한 협업자 추천
- 개인화된 초대 메시지 생성
- 추천 이유 설명
- 이메일 자동 발송

### Phase 구조 개선
- 현재 Phase 구조 분석
- AI가 개선된 구조 제안
- 미리보기 및 비교
- 원클릭 적용

### 파일 파싱 엔진
- **PDF**: pdfjs-dist로 텍스트 추출
- **이미지**: Tesseract.js로 OCR (한글/영어)
- **텍스트**: 직접 읽기
- **메타데이터**: 파일 크기, 타입, 아이콘

### Notion API 통합
- Integration 기반 인증
- 페이지/데이터베이스 선택적 가져오기
- 다양한 블록 타입 지원
- Markdown 형식 변환

## 📊 대시보드 기능

### 프로젝트 개요
- 프로젝트 이름 및 요약
- 회사 설명
- 편집 링크

### Phase 카드
- 상태별 색상 코딩
- 팀원 배치 현황
- 마일스톤 및 데드라인
- KPI 추적
- 액션 버튼 (Start/Complete)

### Artifact 업로드
- Phase별 작업물 업로드
- 파일 또는 텍스트 입력
- AI 자동 분석
- 피드 타임라인

### AI Invites 패널
- 생성된 초대 목록
- 초대 메시지 및 이유
- 이메일 발송 상태
- 배치 발송 기능

### Activity Timeline
- 실시간 활동 로그
- 시간순 정렬
- 활동 타입별 필터링
- 메타데이터 표시

### Notion Import
- API 키 입력
- URL 기반 가져오기
- 페이지/데이터베이스 선택
- 가져온 내용 미리보기

## 🔧 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Shadcn UI + Tailwind CSS
- React Router (라우팅)
- React Hook Form (폼 관리)
- Zod (유효성 검사)

### Backend & Services
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Google Gemini 2.0 Flash (AI)
- Resend (이메일)
- Notion API (통합)

### 파일 처리
- pdfjs-dist (PDF 파싱)
- tesseract.js (OCR)
- mammoth (Word 문서 - 준비됨)
- jszip (압축 파일 - 준비됨)

### 개발 도구
- ESLint (코드 품질)
- TypeScript (타입 안전성)
- Lovable Tagger (개발 모드)

## 🎨 UI/UX 특징

### 디자인 시스템
- Gradient 기반 브랜딩
- 다크/라이트 모드 지원 (next-themes)
- 반응형 디자인
- 애니메이션 (tailwindcss-animate)

### 컴포넌트
- Radix UI 기반 접근성
- Shadcn UI 커스터마이징
- Lucide React 아이콘
- Sonner 토스트 알림

### 사용자 경험
- 진행률 표시
- 로딩 상태 관리
- 에러 처리 및 피드백
- 실시간 업데이트

## 📈 성능 최적화

### 빌드 최적화
- 코드 스플리팅 (Manual Chunks)
- Vendor 번들 분리
- Tree Shaking
- Minification

### 런타임 최적화
- React.memo 사용
- useCallback/useMemo 활용
- 동적 import (lazy loading)
- 이미지 최적화

### 데이터베이스 최적화
- 인덱싱
- RLS 정책
- 쿼리 최적화
- 실시간 구독 관리

## 🔐 보안

### 인증 & 권한
- Supabase Auth
- Row Level Security (RLS)
- API 키 환경 변수 관리
- CORS 설정

### 데이터 보호
- 사용자별 데이터 격리
- 암호화된 통신 (HTTPS)
- 환경 변수 보호
- XSS/CSRF 방어

## 🌐 배포

### 지원 플랫폼
- Vercel (권장)
- Netlify
- AWS Amplify
- 기타 정적 호스팅

### 환경 변수
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_RESEND_API_KEY` (선택)
- `VITE_NOTION_API_KEY` (선택)

## 📱 모바일 지원

### 반응형 디자인
- 모바일 우선 접근
- 터치 최적화
- 적응형 레이아웃
- 모바일 네비게이션

## 🔄 실시간 기능

### Supabase Realtime
- Activity Timeline 실시간 업데이트
- Phase 상태 동기화
- 팀원 활동 추적
- 알림 시스템

## 📊 분석 & 추적

### Activity Logging
- 모든 주요 액션 로깅
- 타임스탬프 기록
- 메타데이터 저장
- 사용자 활동 추적

### KPI 추적
- Phase별 KPI 설정
- 진행률 모니터링
- 완료 시간 추적
- 팀 생산성 분석

## 🎯 향후 계획

### 단기 (1-2주)
- [ ] 이메일 템플릿 커스터마이징
- [ ] PDF 파싱 고도화
- [ ] OCR 정확도 개선
- [ ] 노션 동기화 자동화

### 중기 (1개월)
- [ ] 실시간 채팅
- [ ] 파일 버전 관리
- [ ] 고급 분석 대시보드
- [ ] 모바일 앱

### 장기 (3개월+)
- [ ] 다국어 지원
- [ ] 커스텀 워크플로우
- [ ] API 공개
- [ ] 플러그인 시스템

## 💡 사용 팁

### 효율적인 사용법
1. 온보딩 시 팀원 프로필을 상세히 작성
2. Phase별로 명확한 KPI 설정
3. 작업물은 자주 업로드하여 AI 분석 활용
4. Activity Timeline으로 팀 활동 모니터링
5. Notion 통합으로 기존 문서 활용

### 베스트 프랙티스
- 프로젝트 목표를 구체적으로 작성
- 팀원의 Loves/Hates를 정확히 파악
- Phase 구조는 AI 제안을 참고하되 커스터마이징
- 정기적으로 Phase 상태 업데이트
- 이메일 알림으로 팀 커뮤니케이션 강화

## 🆘 문제 해결

### 일반적인 문제
- **빌드 실패**: `npm install` 재실행
- **API 에러**: 환경 변수 확인
- **인증 실패**: Supabase 프로젝트 설정 확인
- **이메일 미발송**: Resend API 키 확인

### 디버깅
- 개발자 도구 콘솔 확인
- Supabase 대시보드에서 로그 확인
- 네트워크 탭에서 API 호출 확인
- 환경 변수 로드 확인

---

**PhaseFlow v2.0**은 PM을 위한 완전한 AI 협업 플랫폼입니다! 🚀
