import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectPhases from "@/components/dashboard/ProjectPhases";
import ArtifactUpload from "@/components/dashboard/ArtifactUpload";
import AIInvites from "@/components/dashboard/AIInvites";
import { Sparkles, Users } from "lucide-react";

export interface Phase {
  id: string;
  name: string;
  recommended: string[];
  active: string[];
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

const INITIAL_PHASES: Record<string, Phase> = {
  phase1: { id: "phase1", name: "Phase 1: 문제 정의", recommended: ["이동욱"], active: ["이동욱"] },
  phase2: { id: "phase2", name: "Phase 2: UX 리서치", recommended: ["세라", "이동욱"], active: [] },
  phase3: { id: "phase3", name: "Phase 3: 프로토타입", recommended: ["제이", "로빈", "세라"], active: [] },
  phase4: { id: "phase4", name: "Phase 4: GTM 기획", recommended: ["알렉스", "이동욱"], active: [] }
};

const DEFAULT_PROFILES = `#### [팀원 프로필 목록]

* **이동욱 (CPO/기획):**
    * **Loves:** "유저 인터뷰, 경쟁사 분석, 제품의 'Why'를 정의하는 것, GTM(Go-to-Market) 전략 수립."
    * **Hates:** "이미 정해진 기능의 디테일한 PRD 작성, 픽셀 단위의 UI 검수, 반복적인 프로젝트 관리."
    * **Tools:** "Notion, Figma, Miro, Google Analytics, Mixpanel, Amplitude"
    * **Career:** "전 스타트업에서 0→1 제품 기획 3회 경험. B2C 앱 MAU 10만→50만 성장 리드."

* **알렉스 (마케터):**
    * **Loves:** "그로스 해킹, A/B 테스트 설계, 바이럴 밈(Meme) 기획, 짧고 임팩트 있는 카피라이팅."
    * **Hates:** "장문의 감성적인 블로그 글쓰기, SEO 최적화, 정교한 데이터 분석(SQL)."
    * **Tools:** "Google Ads, Facebook Ads, TikTok Ads, Canva, CapCut"
    * **Career:** "지난 2년간 5개 바이럴 캠페인 기획 (평균 200% 유저 증가)."

* **로빈 (백엔드/AI 개발자):**
    * **Loves:** "새로운 AI/LLM 논문 읽고 적용하기, 복잡한 백엔드 아키텍처 설계, Python/Go, 시스템 최적화."
    * **Hates:** "프론트엔드 작업(CSS, JS) 일절, 단순 CRUD API 개발, 기획이 불명확한 상태에서 개발 시작하기."
    * **Tools:** "Python, Go, PyTorch, FastAPI, Docker, Kubernetes, PostgreSQL"
    * **Career:** "AI 스타트업 3년차. GPT-4 기반 챗봇 시스템 구축 (일 10만 요청 처리)."

* **제이 (프론트엔드 개발자):**
    * **Loves:** "인터랙티브한 UI 구현, CSS 애니메이션, 웹 성능 최적화, React/Vue."
    * **Hates:** "데이터베이스 설계, AI 모델 서빙, 인프라(AWS) 작업."
    * **Tools:** "React, Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP"
    * **Career:** "프론트엔드 5년차. 랜딩 페이지 전환율 30% 개선. React 오픈소스 라이브러리 제작."

* **세라 (디자이너/UX 리서처):**
    * **Loves:** "Figma로 프로토타입 만들기, 유저 사용성 테스트(UT) 진행, 복잡한 정책을 단순한 UX Flow로 그리기."
    * **Hates:** "이미지 보정, 아이콘 제작 등 그래픽 디자인, 개발 중인 화면의 CSS 픽셀 수정 요청."
    * **Tools:** "Figma, Sketch, Miro, Maze, UserTesting, Hotjar"
    * **Career:** "UX 디자이너 4년차. 금융앱 리뉴얼로 이탈률 40% 감소. 50+ 사용성 테스트 진행."`;

const Dashboard = () => {
  const [phases] = useState<Record<string, Phase>>(INITIAL_PHASES);
  const [invites, setInvites] = useState<AIInvite[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleArtifactUpload = async (phaseId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "입력 필요",
        description: "작업 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const phaseName = phases[phaseId]?.name || phaseId;
    
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
          profiles: DEFAULT_PROFILES,
          phase_id: phaseId,
          phase_name: phaseName,
          artifact_content: content,
        },
      });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        setInvites(prev => [...data, ...prev]);
        
        toast({
          title: "분석 완료",
          description: data.length > 0 
            ? `${data.length}개의 자동 초대가 생성되었습니다!`
            : "다음 단계 협업이 필요하지 않습니다.",
        });
      }
    } catch (error) {
      console.error("Error analyzing artifact:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
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
                <p className="text-muted-foreground">Live Dashboard - 실시간 협업 허브</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
              title="팀원 프로필 편집"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">팀원 프로필 편집</span>
            </a>
          </div>
          <p className="text-lg text-foreground font-medium">프로젝트: 게이머 매칭 서비스 MVP</p>
        </div>

        {/* Project Phases */}
        <ProjectPhases phases={Object.values(phases)} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Activity Feed */}
          <ArtifactUpload 
            phases={phases}
            onUpload={handleArtifactUpload}
            feedItems={feedItems}
            isAnalyzing={isAnalyzing}
          />

          {/* AI Invites */}
          <AIInvites invites={invites} isAnalyzing={isAnalyzing} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
