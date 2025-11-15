export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  loves: string[];
  hates: string[];
  tools: string[];
  career: string;
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  recommended: string[];
  active: string[];
  milestone?: string;
  deadline?: string;
  kpis?: string[];
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
}

export interface ProjectData {
  id?: string;
  project_name: string;
  project_summary: string;
  company_description?: string;
  phases: Phase[];
  created_at?: string;
  updated_at?: string;
}

export interface AIInvite {
  id?: string;
  target_user: string;
  target_email?: string;
  invite_message: string;
  reason: string;
  phase_id: string;
  phase_name: string;
  status: 'pending' | 'accepted' | 'declined';
  sent_at?: Date;
  responded_at?: Date;
}

export interface FeedItem {
  id?: string;
  phase: string;
  phase_id: string;
  content: string;
  uploaded_by?: string;
  timestamp: Date;
  artifact_type?: 'text' | 'pdf' | 'image' | 'notion';
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}
