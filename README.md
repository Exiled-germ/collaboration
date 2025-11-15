# PhaseFlow v2.0

AI-Powered Project Phase Designer for PM

## 🎯 Overview

PhaseFlow v2.0 is an intelligent project management tool that helps PMs organize projects into optimal phases and automatically assign team members based on their skills, preferences, and work history.

### Key Features

- **Smart Onboarding**: Step-by-step project and team setup
- **AI Phase Generation**: Automatically creates project phases using Google Gemini Flash
- **Team Member Matching**: AI recommends best-fit team members for each phase
- **Artifact Analysis**: Upload work artifacts (text, PDF, images) for AI analysis
- **Automated Invitations**: Send email invites to team members for collaboration
- **Phase Refinement**: Iteratively improve phase structure with AI assistance
- **Real-time Dashboard**: Track progress, KPIs, and team activity

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **AI**: Google Gemini 2.0 Flash
- **Email**: Resend API
- **Integrations**: Notion API
- **File Processing**: pdfjs-dist, Tesseract.js
- **State Management**: React Query + Supabase

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your credentials:
# - VITE_SUPABASE_URL (required)
# - VITE_SUPABASE_ANON_KEY (required)
# - VITE_GEMINI_API_KEY (required)
# - VITE_RESEND_API_KEY (optional - for email)
# - VITE_NOTION_API_KEY (optional - can be set in UI)

# Run database migrations
# (Use Supabase CLI or Dashboard to run migrations in supabase/migrations/)

# Start development server
npm run dev
```

## 🗄️ Database Schema

### Tables

- **team_members**: Store team member profiles (name, role, email, loves, hates, tools, career)
- **projects**: Store project information and phase structure
- **phases**: Detailed phase tracking with milestones and KPIs
- **ai_invites**: AI-generated collaboration invitations
- **artifacts**: Uploaded work artifacts (text, PDF, images, Notion)
- **activity_timeline**: Project activity log

## 🎨 User Flow

### 1. Onboarding (3 Steps)

**Step 1: Company Description**
- Describe your company/organization
- Team size and structure

**Step 2: Project Description**
- Project name and goals
- Core features and timeline

**Step 3: Team Member Profiles**
- Name, Role, Email (required)
- Loves: Preferred tasks
- Hates: Tasks to avoid
- Tools: Technologies/tools they use
- Career: Work history and experience

### 2. Project Analysis

- AI analyzes project description and team profiles
- Generates 4-6 optimal phases
- Recommends team members for each phase
- Sets milestones and KPIs

### 3. Dashboard

**Project Phases Panel**
- Visual phase cards with status
- Recommended vs Active team members
- Click to view phase details

**Artifact Upload**
- Upload work artifacts (text, PDF, images)
- AI analyzes and suggests next steps
- Generates personalized invitations

**AI Invites**
- View all AI-generated invitations
- Send email notifications to team members
- Track invitation status

**Activity Timeline** (NEW in v2.1)
- Real-time activity tracking
- Phase status changes
- Team member actions
- File uploads and analysis

**Notion Import** (NEW in v2.1)
- Import pages from Notion
- Import entire databases
- Automatic content parsing
- Support for various block types

### 4. Advanced Features

**PDF & Image Processing**
- Upload PDF documents with automatic text extraction
- Upload images with OCR (English + Korean)
- Confidence scores and metadata

**Email Notifications**
- Resend API integration
- Beautiful HTML email templates
- Batch sending support
- Development mode for testing

**Real-time Collaboration**
- Live activity updates
- Supabase Realtime subscriptions
- Instant notifications
- Team activity tracking

**Phase Refinement**
- Request changes to phase structure
- AI generates improved structure
- Preview and apply changes

## 🤖 AI Features

### 1. Project Analysis
```typescript
analyzeProject(projectDescription, teamProfiles)
```
- Analyzes project requirements
- Matches team members to phases
- Considers Loves/Hates/Tools/Career
- Generates phase structure with milestones

### 2. Artifact Analysis
```typescript
analyzeArtifact(profiles, phaseId, phaseName, content)
```
- Extracts insights from work artifacts
- Identifies action items
- Recommends next collaborators
- Generates personalized invite messages

### 3. Phase Refinement
```typescript
refinePhaseStructure(currentProject, profiles, refinementRequest)
```
- Modifies existing phase structure
- Adds/removes/merges phases
- Reassigns team members
- Adjusts milestones and KPIs

## 📧 Email Integration

When AI recommends a team member for a task:
1. Invitation is saved to database
2. Email is sent to team member's email address
3. Email includes:
   - Phase name and description
   - Why they were selected
   - Personalized message from AI
   - Link to accept/decline

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Email addresses are validated
- API keys stored in environment variables

## 📊 Improvements from v1.0

### ✅ Implemented
- [x] Step-by-step onboarding (3 steps)
- [x] Detailed team member profiles (Loves/Hates/Tools/Email/Career)
- [x] Google Gemini Flash integration (replaced Lovable AI)
- [x] Supabase database integration
- [x] Phase status tracking (pending/in-progress/completed)
- [x] Milestone and deadline management
- [x] KPI tracking per phase
- [x] Email notifications for invitations

### 🚧 Planned
- [ ] PDF/Image upload with OCR (VLM)
- [ ] Notion API integration
- [ ] Time tracking per phase
- [ ] Team-to-team collaboration analytics
- [ ] Phase structure before/after comparison
- [ ] Advanced KPI dashboard
- [ ] Slack/Discord integration

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API
VITE_GEMINI_API_KEY=your-gemini-api-key

# Email Service (optional)
VITE_EMAIL_SERVICE_URL=your-email-service-url
```

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

## 📄 License

Private - All Rights Reserved

---

**PhaseFlow v2.0** - Built with ❤️ for PMs who want to work smarter, not harder.
