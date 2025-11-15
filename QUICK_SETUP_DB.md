# 빠른 데이터베이스 설정

## ⚠️ 오류 해결: "Could not find the table 'public.team_members'"

이 오류는 Supabase 데이터베이스에 필요한 테이블이 생성되지 않았을 때 발생합니다.

## 🚀 빠른 해결 방법 (5분)

### 1단계: Supabase Dashboard 열기

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: SQL 스크립트 실행

아래 SQL을 복사하여 SQL Editor에 붙여넣고 **Run** 클릭:

```sql
-- PhaseFlow v2.0 Database Schema

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_invites_project_id ON ai_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_project_id ON activity_timeline(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Users can view their own team members"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for phases
CREATE POLICY "Users can view phases of their projects"
  ON phases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert phases for their projects"
  ON phases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update phases of their projects"
  ON phases FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete phases of their projects"
  ON phases FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for ai_invites
CREATE POLICY "Users can view invites for their projects"
  ON ai_invites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert invites for their projects"
  ON ai_invites FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update invites for their projects"
  ON ai_invites FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete invites for their projects"
  ON ai_invites FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for artifacts
CREATE POLICY "Users can view artifacts of their projects"
  ON artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert artifacts for their projects"
  ON artifacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete artifacts of their projects"
  ON artifacts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for activity_timeline
CREATE POLICY "Users can view activity of their projects"
  ON activity_timeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_timeline.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert activity for their projects"
  ON activity_timeline FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_timeline.project_id
    AND projects.user_id = auth.uid()
  ));
```

### 3단계: 실행 확인

SQL 실행 후 "Success. No rows returned" 메시지가 나오면 성공입니다!

### 4단계: 테이블 확인

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ team_members
   - ✅ projects
   - ✅ phases
   - ✅ ai_invites
   - ✅ artifacts
   - ✅ activity_timeline

### 5단계: 앱 새로고침

브라우저에서 앱을 새로고침하고 다시 시도하세요!

---

## 🔧 대체 방법: Supabase CLI 사용

터미널에서 실행:

```bash
# Supabase CLI 설치 (한 번만)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

---

## ❓ 여전히 문제가 있나요?

### 환경 변수 확인

`.env` 파일에서 Supabase URL과 Key가 올바른지 확인:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 브라우저 콘솔 확인

1. F12 키를 눌러 개발자 도구 열기
2. Console 탭에서 에러 메시지 확인
3. Network 탭에서 Supabase API 호출 확인

### Supabase 프로젝트 상태 확인

1. Supabase Dashboard → Settings → General
2. Project Status가 "Active"인지 확인
3. Database가 "Healthy"인지 확인

---

## 📚 추가 도움말

- [SETUP.md](./SETUP.md) - 전체 설정 가이드
- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [Supabase 공식 문서](https://supabase.com/docs)

---

**문제가 해결되었나요? 이제 PhaseFlow를 사용할 준비가 되었습니다! 🚀**
