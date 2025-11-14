import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Users, LogOut } from "lucide-react";

const DEFAULT_PROFILES = `#### [Team Member Profiles]

* **David (CPO/Product):**
    * **Loves:** "User interviews, competitive analysis, defining product 'Why', GTM strategy."
    * **Hates:** "Writing detailed PRDs for pre-decided features, pixel-perfect UI reviews, repetitive project management."
    * **Tools:** "Notion, Figma, Miro, Google Analytics, Mixpanel, Amplitude"
    * **Career:** "Led 0→1 product planning 3 times at previous startups. Led B2C app growth from 100K→500K MAU."

* **Alex (Marketer):**
    * **Loves:** "Growth hacking, A/B test design, viral meme planning, short and impactful copywriting."
    * **Hates:** "Writing long emotional blog posts, SEO optimization, detailed data analysis (SQL)."
    * **Tools:** "Google Ads, Facebook Ads, TikTok Ads, Canva, CapCut"
    * **Career:** "Planned 5 viral campaigns over the past 2 years (average 200% user growth)."

* **Robin (Backend/AI Developer):**
    * **Loves:** "Reading and applying new AI/LLM papers, designing complex backend architecture, Python/Go, system optimization."
    * **Hates:** "Frontend work (CSS, JS) at all, simple CRUD API development, starting development with unclear planning."
    * **Tools:** "Python, Go, PyTorch, FastAPI, Docker, Kubernetes, PostgreSQL"
    * **Career:** "3 years at AI startup. Built GPT-4 based chatbot system (handling 100K requests/day)."

* **Jay (Frontend Developer):**
    * **Loves:** "Building interactive UIs, CSS animations, web performance optimization, React/Vue."
    * **Hates:** "Database design, AI model serving, infrastructure (AWS) work."
    * **Tools:** "React, Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP"
    * **Career:** "5 years frontend. Improved landing page conversion by 30%. Created React open-source library."

* **Sarah (Designer/UX Researcher):**
    * **Loves:** "Creating prototypes in Figma, conducting usability tests (UT), turning complex policies into simple UX flows."
    * **Hates:** "Image retouching, icon creation and other graphic design, CSS pixel modification requests during development."
    * **Tools:** "Figma, Sketch, Miro, Maze, UserTesting, Hotjar"
    * **Career:** "4 years UX designer. Reduced churn rate by 40% through financial app redesign. Conducted 50+ usability tests."`;

const DEFAULT_PROJECT = `[Project Name] StorySync

[Project Description] AI-powered web novel writer & webtoon artist matching platform targeting teenagers

[Core Features]
- Story Upload: 'Writer' users input their web novel synopsis (plot, genre, mood).
- Art Upload: 'Artist' users input their art style portfolio (drawing style, preferred genre).
- AI Matching: AI analyzes story mood (e.g., romance fantasy, tragedy) and art style (e.g., shoujo manga style, realistic style) to match optimal collaboration partners.
- Collaboration Canvas: After matching, teams start working together on 'character sheets' in a shared in-app canvas.

[Goals]
- Form 10,000 collaboration teams within 3 months
- Reach TOP 50 in App Store Entertainment category
- Go viral on TikTok/X(Twitter) as 'Webtoon teams matched by AI'`;

const Index = () => {
  const [projectDescription, setProjectDescription] = useState(DEFAULT_PROJECT);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout error:", error);
      }
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!projectDescription.trim() || !profiles.trim()) {
      toast({
        title: "Input required",
        description: "Please enter both project description and team profiles.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-project", {
        body: {
          project_description: projectDescription,
          profiles: profiles,
        },
      });

      if (error) throw error;

      if (data) {
        // Store project data in sessionStorage for Dashboard to use
        sessionStorage.setItem('phaseflow_project', JSON.stringify(data));
        sessionStorage.setItem('phaseflow_profiles', profiles);
        
        toast({
          title: "Project analysis complete!",
          description: `${data.phases?.length || 0} phases generated.`,
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error analyzing project:", error);
      }
      toast({
        title: "Error occurred",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
                <p className="text-muted-foreground">AI-Powered Project Phase Designer</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Description */}
          <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] min-h-[600px]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">프로젝트 설명</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              프로젝트의 목표, 타겟 유저, 핵심 기능을 상세히 설명해주세요.
            </p>
            
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm resize-none border-input focus:ring-2 focus:ring-primary/20"
              placeholder="프로젝트를 설명해주세요..."
            />
          </Card>

          {/* Team Profiles */}
          <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] min-h-[600px]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">팀원 프로필</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              팀원들의 Loves, Hates, Tools, Career 정보를 입력하세요.
            </p>
            
            <Textarea
              value={profiles}
              onChange={(e) => setProfiles(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm resize-none border-input focus:ring-2 focus:ring-accent/20"
              placeholder="팀원 프로필을 입력하세요..."
            />
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white font-semibold px-12 py-6 text-lg shadow-[var(--shadow-medium)]"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
                AI가 프로젝트 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                프로젝트 분석 & Dashboard 생성
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            AI가 프로젝트를 분석하여 Phase 구조를 설계하고 최적의 팀원을 자동 배치합니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
