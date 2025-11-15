# Changelog

All notable changes to PhaseFlow will be documented in this file.

## [2.0.0] - 2024-11-14

### 🎉 Major Release - Complete Rebuild

PhaseFlow v2.0 is a complete rebuild from the ground up, replacing Lovable/Bubble AI with Google Gemini Flash and adding comprehensive project management features.

### ✨ Added

#### Onboarding System
- **3-Step Onboarding Process**
  - Step 1: Company/Organization description
  - Step 2: Project description with goals
  - Step 3: Detailed team member profiles
- **Team Member Profiles**
  - Name, Role, Email (required)
  - Loves: Preferred tasks and work
  - Hates: Tasks to avoid
  - Tools: Technologies and tools used
  - Career: Work history and experience
- **Profile-Based Matching**
  - AI considers all profile data when recommending team members
  - Avoids assigning members to tasks they explicitly hate

#### AI Integration
- **Google Gemini 2.0 Flash**
  - Replaced Lovable/Bubble AI dependency
  - Faster response times
  - More accurate project analysis
  - Better team member matching
- **Three AI Functions**
  - `analyzeProject`: Generate optimal phase structure
  - `analyzeArtifact`: Analyze work and recommend next steps
  - `refinePhaseStructure`: Iteratively improve phases

#### Phase Management
- **Phase Status Tracking**
  - Pending: Not started
  - In Progress: Currently active
  - Completed: Finished with timestamp
- **Visual Status Indicators**
  - Icons for each status
  - Color-coded phase cards
  - Progress visualization
- **Phase Actions**
  - Start Phase button
  - Complete Phase button
  - Automatic status transitions
- **Enhanced Phase Data**
  - Milestones: What should be achieved
  - Deadlines: Suggested timelines
  - KPIs: Key performance indicators
  - Descriptions: Detailed phase information

#### Database Integration
- **Supabase Backend**
  - Complete database schema
  - Row Level Security (RLS)
  - Real-time updates ready
- **New Tables**
  - `team_members`: Team member profiles
  - `projects`: Project information
  - `phases`: Detailed phase tracking
  - `ai_invites`: Collaboration invitations
  - `artifacts`: Uploaded work files
  - `activity_timeline`: Activity log
- **Data Persistence**
  - All data saved to database
  - No more sessionStorage-only data
  - Proper user isolation with RLS

#### Email System
- **Automated Invitations**
  - AI generates personalized invite messages
  - Explains why each member is needed
  - Beautiful HTML email templates
  - Batch email sending
- **Email Content**
  - Project name and phase
  - AI-generated message
  - Reason for invitation
  - Link to dashboard
- **Email Service Ready**
  - Infrastructure for SendGrid/Resend
  - Currently logs emails (integration pending)

#### File Upload
- **Multiple File Types**
  - Text files (.txt, .md)
  - PDF documents (parser ready)
  - Images (OCR ready)
  - Future: Word, Excel, PowerPoint
- **File Processing**
  - Automatic file parsing
  - Content extraction
  - File metadata display
  - Size formatting
- **File Icons**
  - Visual file type indicators
  - Intuitive UI

#### Dashboard Improvements
- **Project Overview**
  - Project name and summary
  - Company description
  - Phase count and status
- **Phase Cards**
  - Milestone and deadline display
  - Recommended vs Active members
  - Status indicators
  - Click to view details
- **Activity Feed**
  - Real-time artifact uploads
  - Phase updates
  - Team member actions
- **AI Invites Panel**
  - View all invitations
  - Email status tracking
  - Invitation history

#### Phase Refinement
- **Iterative Improvement**
  - Request specific changes
  - AI generates new structure
  - Preview before applying
  - Compare old vs new
- **Refinement Options**
  - Add/remove phases
  - Merge phases
  - Split phases
  - Reassign team members
  - Adjust milestones

### 🔄 Changed

- **AI Provider**: Lovable/Bubble → Google Gemini Flash
- **Backend**: Lovable Edge Functions → Supabase + Gemini API
- **Onboarding**: Single page → 3-step wizard
- **Team Profiles**: Basic → Comprehensive (Loves/Hates/Tools/Email/Career)
- **Phase Structure**: Static → Dynamic with status tracking
- **Data Storage**: SessionStorage → Supabase database

### 🗑️ Removed

- Lovable/Bubble AI dependency
- Lovable Edge Functions
- SessionStorage-only data persistence
- Single-page onboarding

### 🐛 Fixed

- Data loss on page refresh (now persisted to database)
- No email notifications (now implemented)
- Limited team member information (now comprehensive)
- No phase status tracking (now fully tracked)
- No file upload support (now supported)

### 🔒 Security

- Row Level Security (RLS) on all tables
- User data isolation
- Email validation
- API key protection
- Secure file uploads

### 📝 Documentation

- Comprehensive README.md
- Detailed SETUP.md guide
- Database schema documentation
- API integration examples
- Troubleshooting guide

### 🚀 Performance

- Faster AI responses with Gemini Flash
- Optimized database queries
- Efficient file parsing
- Batch email sending

## [1.0.0] - 2024-11-14

### Initial Release (Lovable-based)

- Basic project analysis
- Simple team profiles
- Phase generation
- Artifact upload (text only)
- AI invites (no email)
- SessionStorage data

---

## [2.1.0] - 2024-11-15

### 🎉 Advanced Features Release

### ✨ Added

#### File Processing
- **PDF Parsing**
  - Integrated pdfjs-dist library
  - Extract text from all pages
  - Page-by-page content display
  - Error handling and fallbacks
- **Image OCR**
  - Integrated Tesseract.js
  - Support for English and Korean
  - Confidence score display
  - Progress tracking
- **Enhanced File Parser**
  - Dynamic imports for better performance
  - Comprehensive error handling
  - File metadata extraction
  - Multiple format support

#### Notion Integration
- **Notion API Client**
  - Full Notion API integration
  - Page content extraction
  - Database query support
  - Rich text parsing
- **Notion Import Panel**
  - UI for API key input
  - Page/Database selector
  - URL-based import
  - Content preview
- **Block Type Support**
  - Headings (H1, H2, H3)
  - Paragraphs and text
  - Lists (bulleted, numbered)
  - Code blocks
  - Quotes and callouts
  - To-do items
  - Dividers

#### Email Service Integration
- **Resend API**
  - Full Resend integration
  - Real email sending
  - Development mode fallback
  - Error handling
- **Enhanced Email System**
  - Production-ready email sending
  - API key configuration
  - Batch sending optimization
  - Email status tracking

#### Real-time Activity Timeline
- **Activity Logging**
  - Comprehensive activity tracking
  - Real-time updates via Supabase
  - Activity type categorization
  - Metadata storage
- **Activity Types**
  - phase_created: New phase added
  - phase_started: Phase begun
  - phase_completed: Phase finished
  - member_added: Team member joined
  - artifact_uploaded: File uploaded
  - invite_sent: Invitation sent
  - phase_refined: Structure improved
- **Timeline UI**
  - Real-time subscription
  - Visual activity indicators
  - Time-relative display (e.g., "2 hours ago")
  - Metadata expansion
  - Color-coded by type

#### Dashboard Enhancements
- **New Panels**
  - Activity Timeline panel
  - Notion Import panel
  - Enhanced layout
- **Improved Integration**
  - Activity logging on all actions
  - Notion content processing
  - Real-time updates
  - Better error feedback

### 🔄 Changed

- **File Upload**: Now supports PDF and images with full parsing
- **Email System**: Upgraded from placeholder to production-ready
- **Dashboard Layout**: Added new panels for advanced features
- **Activity Tracking**: Comprehensive logging of all user actions

### 🚀 Performance

- **Code Splitting**
  - Manual chunks for vendor libraries
  - Separate bundles for React, UI, AI, Notion, PDF, OCR
  - Reduced initial load time
  - Better caching
- **Dynamic Imports**
  - Lazy loading for heavy libraries
  - On-demand PDF/OCR loading
  - Improved startup performance

### 📦 Dependencies Added

- `pdfjs-dist`: PDF parsing
- `tesseract.js`: OCR functionality
- `@notionhq/client`: Notion API
- `resend`: Email service
- `date-fns`: Date formatting

### 📝 Documentation

- New FEATURES.md with comprehensive feature list
- Updated environment variables guide
- Notion integration instructions
- Email service setup guide

## Upcoming Features

### [2.2.0] - Planned

- [ ] Time tracking per phase
- [ ] Team collaboration analytics
- [ ] Phase comparison view
- [ ] Advanced KPI dashboard
- [ ] Slack/Discord notifications
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Export reports (PDF/Excel)

### [2.2.0] - Planned

- [ ] Real-time collaboration
- [ ] Comments and discussions
- [ ] File version control
- [ ] Advanced search
- [ ] Custom phase templates
- [ ] Team performance metrics
- [ ] Integration marketplace
- [ ] API for third-party tools

---

**Legend:**
- ✨ Added: New features
- 🔄 Changed: Changes in existing functionality
- 🗑️ Removed: Removed features
- 🐛 Fixed: Bug fixes
- 🔒 Security: Security improvements
- 📝 Documentation: Documentation changes
- 🚀 Performance: Performance improvements
