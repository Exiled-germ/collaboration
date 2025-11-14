import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProfilePanel from "@/components/ProfilePanel";
import WorkCanvas from "@/components/WorkCanvas";
import NotificationPanel from "@/components/NotificationPanel";
import { Sparkles } from "lucide-react";

const DEFAULT_PROFILES = `#### [팀원 프로필 목록]

* **이동욱 (CPO/기획):**
    * **Loves:** "유저 인터뷰, 경쟁사 분석, 제품의 'Why'를 정의하는 것, GTM(Go-to-Market) 전략 수립."
    * **Hates:** "이미 정해진 기능의 디테일한 PRD 작성, 픽셀 단위의 UI 검수, 반복적인 프로젝트 관리."
    * **Tools:** "Notion, Figma, Miro, Google Analytics, Mixpanel, Amplitude"
    * **Career:** "전 스타트업에서 0→1 제품 기획 3회 경험. B2C 앱 MAU 10만→50만 성장 리드. Y Combinator 데모데이 발표 경험."

* **알렉스 (마케터):**
    * **Loves:** "그로스 해킹, A/B 테스트 설계, 바이럴 밈(Meme) 기획, '어떻게 하면 터질까?' 고민하는 것, 짧고 임팩트 있는 카피라이팅."
    * **Hates:** "장문의 감성적인 블로그 글쓰기, SEO 최적화, 정교한 데이터 분석(SQL)."
    * **Tools:** "Google Ads, Facebook Ads, TikTok Ads, Mailchimp, Braze, Canva, CapCut"
    * **Career:** "지난 2년간 5개 바이럴 캠페인 기획 (평균 200% 유저 증가). 인스타그램 릴스 조회수 500만+ 달성. 틱톡 해시태그 챌린지 운영 경험."

* **로빈 (백엔드/AI 개발자):**
    * **Loves:** "새로운 AI/LLM 논문 읽고 적용하기, 복잡한 백엔드 아키텍처 설계, Python/Go, 시스템 최적화."
    * **Hates:** "프론트엔드 작업(CSS, JS) 일절, 단순 CRUD API 개발, 기획이 불명확한 상태에서 개발 시작하기."
    * **Tools:** "Python, Go, PyTorch, TensorFlow, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, AWS"
    * **Career:** "AI 스타트업 3년차. GPT-4 기반 챗봇 시스템 구축 (일 10만 요청 처리). LangChain으로 RAG 파이프라인 개발. 머신러닝 논문 2편 공저."

* **제이 (프론트엔드 개발자):**
    * **Loves:** "인터랙티브한 UI 구현, CSS 애니메이션, 유저에게 '와!' 소리 듣는 마이크로 인터랙션, 웹 성능 최적화, React/Vue."
    * **Hates:** "데이터베이스 설계, AI 모델 서빙, 인프라(AWS) 작업."
    * **Tools:** "React, Next.js, Vue, TypeScript, Tailwind CSS, Framer Motion, GSAP, Figma, Storybook"
    * **Career:** "프론트엔드 5년차. 여러 스타트업에서 랜딩 페이지 전환율 30% 개선. Awwwards 수상 경력. React 오픈소스 라이브러리 3개 제작 (총 5K+ stars)."

* **세라 (디자이너/UX 리서처):**
    * **Loves:** "Figma로 프로토타입 만들기, 유저 사용성 테스트(UT) 진행, 복잡한 정책을 단순한 UX Flow로 그리기."
    * **Hates:** "이미지 보정, 아이콘 제작 등 그래픽 디자인, 개발 중인 화면의 CSS 픽셀 수정 요청."
    * **Tools:** "Figma, Sketch, Miro, Maze, UserTesting, Hotjar, Adobe XD"
    * **Career:** "UX 디자이너 4년차. 금융앱 리뉴얼로 이탈률 40% 감소. 50+ 사용성 테스트 진행. Nielsen Norman Group UX 인증. 디자인 시스템 구축 경험 2회."`;

const DEFAULT_WORK = `[프로젝트: 10대 타겟 바이럴 마케팅 기획]

1. 목표: 3일 내 앱스토어 100위권 진입
2. 아이디어: '너 T야?' 밈을 활용한 심리테스트
3. 실행 과제:
   - 심리테스트 결과 페이지에 공유를 유도할 수 있는 **재미있는 인터랙티브 짤(GIF) 혹은 CSS 애니메이션**이 필요함.
   - 공유 시 노출될 **짧고 강력한 바이럴 카피라이팅** 문구 확정.
   - AI/LLM을 활용한 **간단한 심리테스트 로직** 개발.`;

interface Notification {
  type: "recommendation" | "self" | "warning";
  target_user: string;
  message: string;
}

const Index = () => {
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [workContent, setWorkContent] = useState(DEFAULT_WORK);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profiles.trim() || !workContent.trim()) {
      toast({
        title: "입력 필요",
        description: "프로필과 작업 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotifications([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-work", {
        body: {
          profiles,
          work_in_progress: workContent,
        },
      });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        setNotifications(data);
        
        if (data.length === 0) {
          toast({
            title: "분석 완료",
            description: "관련된 흥미를 가진 팀원을 찾지 못했습니다.",
          });
        } else {
          toast({
            title: "분석 완료",
            description: `${data.length}개의 협업 추천을 찾았습니다!`,
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing work:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <p className="text-muted-foreground text-lg">
            AI 기반 실시간 협업 캔버스 - 최적의 동료를 자동으로 찾아드립니다
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <ProfilePanel profiles={profiles} setProfiles={setProfiles} />

          {/* Right Panel */}
          <div className="flex flex-col gap-6">
            <WorkCanvas
              workContent={workContent}
              setWorkContent={setWorkContent}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
            <NotificationPanel notifications={notifications} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
