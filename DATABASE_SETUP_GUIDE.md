# 📊 데이터베이스 설정 가이드

## 🚀 2단계로 간단하게 설정하기

### 1단계: 테이블 생성

1. **Supabase SQL Editor 열기**
   - https://supabase.com/dashboard/project/yvbihchwylsytvtjhvfj/sql
   - 또는 Dashboard → SQL Editor

2. **`SIMPLE_SETUP.sql` 파일 열기**
   - 프로젝트 폴더에서 `SIMPLE_SETUP.sql` 파일 열기

3. **전체 내용 복사**
   - Ctrl+A → Ctrl+C

4. **SQL Editor에 붙여넣기**
   - Supabase SQL Editor에 붙여넣기

5. **Run 버튼 클릭**
   - 우측 하단 "Run" 버튼 클릭
   - "Success" 메시지 확인

### 2단계: RLS 정책 설정

1. **`RLS_POLICIES.sql` 파일 열기**

2. **전체 내용 복사**

3. **SQL Editor에 붙여넣기**

4. **Run 버튼 클릭**

## ✅ 설정 완료 확인

### Table Editor에서 확인

1. 왼쪽 메뉴 → **Table Editor** 클릭

2. 다음 테이블들이 보이면 성공:
   - ✅ team_members
   - ✅ projects
   - ✅ phases
   - ✅ ai_invites
   - ✅ artifacts
   - ✅ activity_timeline

## 🎉 이제 앱 사용 가능!

1. **브라우저 새로고침** (F5)
2. **http://localhost:8080** 접속
3. **회원가입/로그인**
4. **온보딩 시작**
5. **프로젝트 생성** - 이제 정상 작동!

## ❓ 문제 해결

### "relation already exists" 에러
- 이미 테이블이 존재합니다
- 무시하고 다음 단계로 진행하세요

### "permission denied" 에러
- Supabase 프로젝트 권한 확인
- 올바른 프로젝트에 로그인했는지 확인

### 여전히 "table not found" 에러
1. Table Editor에서 테이블 존재 확인
2. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
3. 개발 서버 재시작
4. 브라우저 새로고침

## 📝 참고

- **SIMPLE_SETUP.sql**: 테이블 생성 (필수)
- **RLS_POLICIES.sql**: 보안 정책 (필수)
- **SETUP_NOW.md**: 상세 가이드
- **QUICK_SETUP_DB.md**: 전체 SQL (한 번에 실행 시 에러 가능)

---

**설정이 완료되면 PhaseFlow의 모든 기능을 사용할 수 있습니다! 🚀**
