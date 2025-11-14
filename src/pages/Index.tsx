import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Users } from "lucide-react";

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

const DEFAULT_PROJECT = `10대를 타겟으로 하는 MBTI 기반 게이머 매칭 서비스.

[핵심 기능]
- 유저가 MBTI와 선호 게임(리그오브레전드, 발로란트 등)을 입력
- AI가 성격 궁합과 게임 실력을 분석하여 최적의 게임 파트너 매칭
- 매칭 후 디스코드/카카오톡으로 바로 연결

[목표]
- 3개월 내 MAU 10만 달성
- 앱스토어 게임 카테고리 TOP 50 진입
- 10대 사이에서 바이럴 확산`;

const Index = () => {
  const [projectDescription, setProjectDescription] = useState(DEFAULT_PROJECT);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!projectDescription.trim() || !profiles.trim()) {
      toast({
        title: "입력 필요",
        description: "프로젝트 설명과 팀원 프로필을 모두 입력해주세요.",
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
          title: "프로젝트 분석 완료!",
          description: `${data.phases?.length || 0}개의 Phase가 생성되었습니다.`,
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error analyzing project:", error);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-medium)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PhaseFlow
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-2">
            AI가 프로젝트를 분석하여 최적의 Phase와 팀원을 자동 배치합니다
          </p>
          <p className="text-sm text-muted-foreground">
            프로젝트를 설명하면, AI가 성공을 위한 로드맵을 자동으로 설계합니다
          </p>
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
