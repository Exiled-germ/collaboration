# 닉네임 세션 시스템 마이그레이션 적용

## 1. Supabase Dashboard에서 SQL 실행

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `qbxgrxvlfoqeefnznyhj`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. 아래 파일의 내용을 복사해서 붙여넣기:
   - `supabase/migrations/20251115000000_nickname_sessions.sql`
6. **Run** 버튼 클릭

## 2. 확인

SQL Editor에서 다음 쿼리로 테이블이 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'sessions';
```

결과가 나오면 성공!

## 3. 새로운 기능

### 닉네임 기반 세션
- 팀 닉네임으로 로그인
- 같은 닉네임으로 다시 접속하면 이전 작업 이어서 진행
- 모든 artifact가 DB에 저장됨

### 데이터 구조
- `sessions` 테이블: 닉네임과 현재 프로젝트 연결
- `projects.session_id`: 프로젝트가 어떤 세션에 속하는지
- `artifacts.uploaded_by_nickname`: 누가 업로드했는지 추적

## 4. 사용 방법

1. 온보딩 페이지에서 팀 닉네임 입력
2. 프로젝트 생성 및 작업
3. 나중에 같은 닉네임으로 다시 접속
4. 자동으로 이전 프로젝트 불러오기

## 5. PDF 업로드 지원

이제 Artifact Upload에서 다음 파일 형식을 지원합니다:
- PDF (텍스트 추출)
- DOCX, PPTX
- TXT, MD
- 이미지 (PNG, JPG - OCR)
- ZIP

모든 파일은 자동으로 파싱되어 AI 분석에 사용됩니다.
