# 🚀 지금 바로 설정하기

## ✅ 환경 변수 설정 완료!

모든 API 키가 설정되었습니다:
- ✅ Supabase URL & Key
- ✅ Google Gemini API Key
- ✅ Resend API Key (이메일 발송용)

## 📊 다음 단계: 데이터베이스 테이블 생성

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. **Supabase Dashboard 열기**
   - https://supabase.com/dashboard/project/yvbihchwylsytvtjhvfj 접속

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3. **아래 SQL 복사 & 실행**

```sql
-- PhaseFlow v2.1 Database Schema

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  loves TEXT[] DEFAULT '{}',
  hates TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  career TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_summary TEXT,
  company_description TEXT,
  phases JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phases Table
CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  recommended TEXT[] DEFAULT '{}',
  active TEXT[] DEFAULT '{}',
  milestone TEXT,
  deadline TEXT,
  kpis TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Invites Table
CREATE TABLE IF NOT EXISTS ai_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  target_user TEXT NOT NULL,
  target_email TEXT,
  invite_message TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artifacts Table
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  content TEXT NOT NULL,
  artifact_type TEXT DEFAULT 'text' CHECK (artifact_type IN ('text', 'pdf', 'image', 'notion', 'other')),
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Timeline Table
CREATE TABLE IF NOT EXISTS activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
DROP POLICY IF EXISTS "Users can manage their own team members" ON team_members;
CREATE POLICY "Users can manage their own team members"
  ON team_members FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for projects
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for phases
DROP POLICY IF EXISTS "Users can manage phases of their projects" ON phases;
CREATE POLICY "Users can manage phases of their projects"
  ON phases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for ai_invites
DROP POLICY IF EXISTS "Users can manage invites for their projects" ON ai_invites;
CREATE POLICY "Users can manage invites for their projects"
  ON ai_invites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for artifacts
DROP POLICY IF EXISTS "Users can manage artifacts of their projects" ON artifacts;
CREATE POLICY "Users can manage artifacts of their projects"
  ON artifacts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for activity_timeline
DROP POLICY IF EXISTS "Users can manage activity of their projects" ON activity_timeline;
CREATE POLICY "Users can manage activity of their projects"
  ON activity_timeline FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_timeline.project_id
    AND projects.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_invites_project_id ON ai_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_project_id ON activity_timeline(project_id);
```

4. **"Run" 버튼 클릭**

5. **성공 확인**
   - "Success. No rows returned" 메시지가 나오면 성공!

### 방법 2: 앱에서 자동 안내

1. 브라우저에서 http://localhost:8080 열기
2. 회원가입/로그인
3. 온보딩 진행
4. "프로젝트 생성" 버튼 클릭
5. 데이터베이스 설정 가이드가 자동으로 나타남
6. 가이드를 따라 설정

## ✅ 설정 완료 후

1. **브라우저 새로고침** (F5)
2. **온보딩 다시 시작**
3. **프로젝트 생성** - 이제 정상 작동!

## 🎉 이제 사용 가능한 기능

- ✅ AI 기반 프로젝트 Phase 생성
- ✅ 팀원 프로필 관리
- ✅ PDF 파일 업로드 및 파싱
- ✅ 이미지 OCR (한글/영어)
- ✅ 팀원 초대 이메일 자동 발송
- ✅ 실시간 Activity Timeline
- ✅ Notion 통합 (선택)

## 📧 이메일 발송 테스트

Resend API가 설정되어 있으므로:
1. 팀원 프로필에 실제 이메일 주소 입력
2. Artifact 업로드
3. AI가 초대 생성
4. 실제 이메일이 발송됨!

**주의**: Resend 무료 플랜은 하루 100개 이메일까지 발송 가능합니다.

## ❓ 문제가 있나요?

### 데이터베이스 연결 실패
- Supabase URL과 Key가 올바른지 확인
- 브라우저 콘솔(F12)에서 에러 확인

### 이메일 발송 실패
- Resend API 키 확인
- 발신자 이메일 도메인 인증 필요 (Resend Dashboard)

### Gemini API 에러
- API 키가 올바른지 확인
- 할당량 초과 여부 확인

---

**모든 준비가 완료되었습니다! 🚀**

이제 PhaseFlow를 사용하여 프로젝트를 관리하세요!
