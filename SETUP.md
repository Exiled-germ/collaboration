# PhaseFlow v2.0 Setup Guide

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Gemini API key

### 2. Clone and Install

```bash
cd 협업툴
npm install
```

### 3. Supabase Setup

#### A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to initialize

#### B. Get Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - Anon/Public Key

#### C. Run Migrations

Option 1: Using Supabase Dashboard
1. Go to SQL Editor
2. Copy content from `supabase/migrations/20251114220000_phaseflow_v2_schema.sql`
3. Run the SQL

Option 2: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy the key

### 5. Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📝 First Time Usage

### 1. Sign Up

1. Click "Sign Up" on auth page
2. Enter email and password
3. Verify email (check inbox)

### 2. Onboarding

**Step 1: Company Description**
```
우리는 AI 기반 협업 도구를 만드는 스타트업입니다.
팀 규모는 10명이며, 제품/개발/디자인 팀으로 구성되어 있습니다.
```

**Step 2: Project Description**
```
[프로젝트명] PhaseFlow v2.0

[설명] PM을 위한 AI 기반 프로젝트 관리 도구

[목표]
- 3개월 내 베타 출시
- 100개 팀 온보딩
```

**Step 3: Team Members**

Add team members with:
- Name: "홍길동"
- Role: "Frontend Developer"
- Email: "hong@example.com"
- Loves: "UI 개발, 애니메이션"
- Hates: "백엔드 작업"
- Tools: "React, TypeScript"
- Career: "5년차 프론트엔드 개발자"

### 3. Project Analysis

Click "프로젝트 생성" and wait for AI to:
- Analyze project requirements
- Generate optimal phases
- Recommend team members
- Set milestones and KPIs

### 4. Dashboard

**View Phases**
- See all project phases
- Check recommended team members
- View milestones and deadlines

**Upload Artifacts**
- Select phase
- Enter work content or upload file
- AI analyzes and recommends next steps

**Manage Invites**
- View AI-generated invitations
- Send emails to team members
- Track invitation status

**Refine Structure**
- Request phase structure changes
- Preview AI suggestions
- Apply improvements

## 🔧 Troubleshooting

### Database Connection Error

**Problem**: "Failed to connect to Supabase"

**Solution**:
1. Check `.env` file has correct credentials
2. Verify Supabase project is active
3. Check network connection

### Gemini API Error

**Problem**: "Gemini API request failed"

**Solution**:
1. Verify API key is correct
2. Check API quota (free tier has limits)
3. Try again after a few seconds

### Migration Error

**Problem**: "Table already exists"

**Solution**:
1. Drop existing tables in Supabase Dashboard
2. Re-run migration
3. Or use `IF NOT EXISTS` in migration (already included)

### Email Not Sending

**Problem**: "Invitations not sent"

**Solution**:
1. Email service not yet implemented
2. Check `ai_invites` table for saved invitations
3. Manually send emails for now
4. Email service will be added in future update

## 📊 Database Tables

### team_members
- Stores team member profiles
- Linked to user account

### projects
- Stores project information
- Contains phase structure as JSONB

### phases
- Detailed phase tracking
- Status: pending/in-progress/completed

### ai_invites
- AI-generated invitations
- Status: pending/accepted/declined

### artifacts
- Uploaded work artifacts
- Supports text, PDF, images, Notion

### activity_timeline
- Project activity log
- Tracks all events

## 🎯 Next Steps

1. **Add More Team Members**
   - Go to settings (coming soon)
   - Add new team members
   - Update profiles

2. **Upload Artifacts**
   - Upload meeting notes
   - Upload design files
   - Get AI recommendations

3. **Track Progress**
   - Mark phases as complete
   - Monitor KPIs
   - Analyze team performance

4. **Refine Structure**
   - Request phase changes
   - Optimize team assignments
   - Improve workflow

## 🆘 Support

For issues or questions:
1. Check this guide
2. Review README.md
3. Contact development team

---

**Happy Project Managing! 🚀**
