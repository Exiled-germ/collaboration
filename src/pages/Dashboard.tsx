import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectPhases from "@/components/dashboard/ProjectPhases";
import ArtifactUpload from "@/components/dashboard/ArtifactUpload";
import AIInvites from "@/components/dashboard/AIInvites";
import PhaseRefinePanel from "@/components/dashboard/PhaseRefinePanel";
import PhaseDetailDialog from "@/components/dashboard/PhaseDetailDialog";
import WaitlistDialog from "@/components/dashboard/WaitlistDialog";
import { Sparkles, Users, Rocket } from "lucide-react";

export interface Phase {
  id: string;
  name: string;
  description?: string;
  recommended: string[];
  active: string[];
}

export interface ProjectData {
  project_name: string;
  project_summary: string;
  phases: Phase[];
}

export interface AIInvite {
  target_user: string;
  invite_message: string;
  reason: string;
}

export interface FeedItem {
  phase: string;
  content: string;
  timestamp: Date;
}

const DEFAULT_PROFILES = `#### [Team Member Profiles]

* **David (CPO/Product):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "User interviews, competitive analysis, defining product 'Why', GTM strategy."
    * **Hates:** "Writing detailed PRDs for pre-decided features, pixel-perfect UI reviews, repetitive project management."
    * **Tools:** "Notion, Figma, Miro, Google Analytics, Mixpanel, Amplitude"
    * **Career:** "Led 0→1 product planning 3 times at previous startups. Led B2C app growth from 100K→500K MAU."

* **Alex (Marketer):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "Growth hacking, A/B test design, viral meme planning, short and impactful copywriting."
    * **Hates:** "Writing long emotional blog posts, SEO optimization, detailed data analysis (SQL)."
    * **Tools:** "Google Ads, Facebook Ads, TikTok Ads, Canva, CapCut"
    * **Career:** "Planned 5 viral campaigns over the past 2 years (average 200% user growth)."

* **Robin (Backend/AI Developer):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "Reading and applying new AI/LLM papers, designing complex backend architecture, Python/Go, system optimization."
    * **Hates:** "Frontend work (CSS, JS) at all, simple CRUD API development, starting development with unclear planning."
    * **Tools:** "Python, Go, PyTorch, FastAPI, Docker, Kubernetes, PostgreSQL"
    * **Career:** "3 years at AI startup. Built GPT-4 based chatbot system (handling 100K requests/day)."

* **Jay (Frontend Developer):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "Building interactive UIs, CSS animations, web performance optimization, React/Vue."
    * **Hates:** "Database design, AI model serving, infrastructure (AWS) work."
    * **Tools:** "React, Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP"
    * **Career:** "5 years frontend. Improved landing page conversion by 30%. Created React open-source library."

* **Sarah (Designer/UX Researcher):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "Creating prototypes in Figma, conducting usability tests (UT), turning complex policies into simple UX flows."
    * **Hates:** "Image retouching, icon creation and other graphic design, CSS pixel modification requests during development."
    * **Tools:** "Figma, Sketch, Miro, Maze, UserTesting, Hotjar"
    * **Career:** "4 years UX designer. Reduced churn rate by 40% through financial app redesign. Conducted 50+ usability tests."`;

const Dashboard = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [invites, setInvites] = useState<AIInvite[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load project data from sessionStorage on mount
  useEffect(() => {
    const storedProject = sessionStorage.getItem('phaseflow_project');
    
    // Always use the latest DEFAULT_PROFILES with emails
    setProfiles(DEFAULT_PROFILES);
    sessionStorage.setItem('phaseflow_profiles', DEFAULT_PROFILES);
    
    if (storedProject) {
      try {
        const parsed = JSON.parse(storedProject);
        setProjectData(parsed);
      } catch (error) {
        console.error("Error parsing project data:", error);
      }
    }
  }, []);

  const handleArtifactUpload = async (phaseId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Input required",
        description: "Please enter work content.",
        variant: "destructive",
      });
      return;
    }

    if (!projectData) {
      toast({
        title: "No project",
        description: "Please create a project first.",
        variant: "destructive",
      });
      return;
    }

    const phase = projectData.phases.find(p => p.id === phaseId);
    const phaseName = phase?.name || phaseId;
    
    // Add to feed
    setFeedItems(prev => [{
      phase: phaseName,
      content,
      timestamp: new Date()
    }, ...prev]);

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-artifact", {
        body: {
          profiles: profiles,
          phase_id: phaseId,
          phase_name: phaseName,
          artifact_content: content,
        },
      });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        setInvites(prev => [...data, ...prev]);
        
        // Send email invites
        if (data.length > 0) {
          sendEmailInvites(data, phaseName);
        }
        
        toast({
          title: "Analysis complete",
          description: data.length > 0 
            ? `${data.length} AI invite(s) generated and emails sent!`
            : "No next-step collaboration needed.",
        });
      }
    } catch (error) {
      console.error("Error analyzing artifact:", error);
      toast({
        title: "Error occurred",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRefinedProject = (refinedProject: ProjectData) => {
    setProjectData(refinedProject);
    sessionStorage.setItem('phaseflow_project', JSON.stringify(refinedProject));
    
    toast({
      title: "Phase structure updated",
      description: "New phase structure has been applied.",
    });
  };

  const sendEmailInvites = async (invites: AIInvite[], phaseName: string) => {
    // Parse profiles to extract emails
    const emailMap = new Map<string, string>();
    const lines = profiles.split('\n');
    let currentName = '';
    
    for (const line of lines) {
      // Match name patterns like "* **Name (Role):**"
      const nameMatch = line.match(/\*\s*\*\*([^(]+)\s*\(/);
      if (nameMatch) {
        currentName = nameMatch[1].trim();
      }
      
      // Match email patterns like '* **Email:** "email@example.com"'
      const emailMatch = line.match(/\*\s*\*\*Email:\*\*\s*"([^"]+)"/);
      if (emailMatch && currentName) {
        emailMap.set(currentName, emailMatch[1]);
      }
    }
    
    // Send emails for each invite
    for (const invite of invites) {
      const email = emailMap.get(invite.target_user);
      if (email) {
        try {
          await supabase.functions.invoke("send-invite-email", {
            body: {
              recipientEmail: email,
              recipientName: invite.target_user,
              inviteMessage: invite.invite_message,
              reason: invite.reason,
              phaseName: phaseName,
            },
          });
          console.log(`Email sent to ${invite.target_user} at ${email}`);
        } catch (error) {
          console.error(`Failed to send email to ${invite.target_user}:`, error);
        }
      } else {
        console.log(`No email found for ${invite.target_user}`);
      }
    }
  };

  const handlePhaseClick = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsPhaseDialogOpen(true);
  };

  // Convert phases array to Record for ArtifactUpload component
  const phasesRecord: Record<string, Phase> = {};
  projectData?.phases.forEach(phase => {
    phasesRecord[phase.id] = phase;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Waitlist Banner */}
        <div className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-soft)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Like our MVP? Join waitlist for better product!</p>
              <p className="text-xs text-muted-foreground">Be the first to know when we launch new features</p>
            </div>
          </div>
          <button
            onClick={() => setIsWaitlistDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg transition-opacity font-semibold shadow-[var(--shadow-medium)] whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            Join Now
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-medium)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PhaseFlow v2.0
                </h1>
                <p className="text-muted-foreground">Live Dashboard - Real-time Collaboration Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWaitlistDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg transition-opacity shadow-[var(--shadow-medium)]"
                title="Join our waitlist for better product"
              >
                <Rocket className="w-5 h-5" />
                <span className="hidden sm:inline">Join Waitlist</span>
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors border border-border"
                title="Edit project and team info"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Edit Project</span>
              </a>
            </div>
          </div>
          <p className="text-lg text-foreground font-medium">
            {projectData?.project_name || "Please create a project"}
          </p>
          {projectData?.project_summary && (
            <p className="text-sm text-muted-foreground mt-1">{projectData.project_summary}</p>
          )}
        </div>

        {projectData ? (
          <>
            {/* Project Phases */}
            <ProjectPhases phases={projectData.phases} onPhaseClick={handlePhaseClick} />

            {/* Phase Detail Dialog */}
            <PhaseDetailDialog
              phase={selectedPhase}
              isOpen={isPhaseDialogOpen}
              onClose={() => setIsPhaseDialogOpen(false)}
              feedItems={feedItems}
              invites={invites}
            />

            {/* Waitlist Dialog */}
            <WaitlistDialog
              isOpen={isWaitlistDialogOpen}
              onClose={() => setIsWaitlistDialogOpen(false)}
            />

            {/* Phase Refine Panel */}
            <div className="mt-6">
              <PhaseRefinePanel
                currentProject={projectData}
                profiles={profiles}
                onApplyChanges={handleApplyRefinedProject}
                isRefining={isRefining}
                setIsRefining={setIsRefining}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Activity Feed */}
              <ArtifactUpload 
                phases={phasesRecord}
                onUpload={handleArtifactUpload}
                feedItems={feedItems}
                isAnalyzing={isAnalyzing}
              />

              {/* AI Invites */}
              <AIInvites invites={invites} isAnalyzing={isAnalyzing} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Sparkles className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">프로젝트가 없습니다</h3>
            <p className="text-muted-foreground mb-6">먼저 프로젝트를 생성하여 AI가 Phase를 설계하도록 하세요</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              프로젝트 생성하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
