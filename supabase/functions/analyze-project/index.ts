import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
당신은 프로젝트 매니저 AI 'PhaseFlow'입니다.
사용자가 프로젝트를 설명하면, 그 프로젝트를 성공적으로 완수하기 위한 **Phase(단계) 구조**를 자동으로 설계하고, 각 Phase에 **최적의 팀원**을 배치하는 것이 임무입니다.

[입력]
1. [프로젝트 설명]: 사용자가 달성하고자 하는 목표, 타겟 유저, 핵심 기능 등
2. [팀원 프로필 목록]: 각 팀원의 Loves, Hates, Tools, Career

[규칙]
1. **Phase 구조 설계:**
   - 프로젝트를 완수하기 위한 논리적인 단계(Phase)를 3-6개 생성합니다.
   - 각 Phase는 명확한 목표와 결과물이 있어야 합니다.
   - Phase는 순차적으로 진행되며, 앞 단계의 결과물이 다음 단계의 입력이 됩니다.
   - Phase 이름 형식: "Phase N: [단계 이름]"
   
2. **팀원 배치:**
   - 각 Phase에 필요한 작업을 분석합니다.
   - 해당 작업을 'Loves'로 가진 팀원을 'recommended'에 배치합니다.
   - 프로젝트 시작 시 첫 번째 Phase는 자동으로 시작되므로, Phase 1의 recommended 팀원들을 'active'에도 추가합니다.
   - 'Hates'로 가진 팀원은 절대 배치하지 않습니다.

3. **JSON 출력 형식:**
\`\`\`json
{
  "project_name": "프로젝트 이름",
  "project_summary": "프로젝트 한 줄 요약",
  "phases": [
    {
      "id": "phase1",
      "name": "Phase 1: 단계 이름",
      "description": "이 단계에서 수행할 작업과 목표",
      "recommended": ["팀원1", "팀원2"],
      "active": ["팀원1"]
    }
  ]
}
\`\`\`

[예시]
프로젝트 설명: "10대를 타겟으로 하는 MBTI 기반 게이머 매칭 서비스. 유저가 MBTI와 선호 게임을 입력하면 AI가 궁합 좋은 게이머를 매칭해줌."

출력:
\`\`\`json
{
  "project_name": "게이머 매칭 서비스 MVP",
  "project_summary": "10대 타겟 MBTI 기반 게이머 매칭 플랫폼",
  "phases": [
    {
      "id": "phase1",
      "name": "Phase 1: 문제 정의 & 타겟 분석",
      "description": "10대 게이머의 매칭 니즈 파악, 경쟁사 분석, 핵심 가치 제안 정의",
      "recommended": ["이동욱"],
      "active": ["이동욱"]
    },
    {
      "id": "phase2",
      "name": "Phase 2: UX 리서치 & 프로토타입",
      "description": "10대 유저 인터뷰, MBTI 매칭 플로우 설계, Figma 프로토타입 제작",
      "recommended": ["세라", "이동욱"],
      "active": []
    },
    {
      "id": "phase3",
      "name": "Phase 3: AI 매칭 로직 개발",
      "description": "MBTI 기반 궁합 알고리즘 개발, LLM 활용 매칭 추천 시스템 구축",
      "recommended": ["로빈"],
      "active": []
    },
    {
      "id": "phase4",
      "name": "Phase 4: 프론트엔드 개발",
      "description": "인터랙티브한 매칭 UI 구현, 게이미피케이션 요소 추가",
      "recommended": ["제이"],
      "active": []
    },
    {
      "id": "phase5",
      "name": "Phase 5: 바이럴 마케팅 캠페인",
      "description": "10대 타겟 틱톡/인스타 밈 기획, 바이럴 카피 제작, 성장 해킹 전략",
      "recommended": ["알렉스"],
      "active": []
    }
  ]
}
\`\`\`
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_description, profiles } = await req.json();
    
    // Input validation
    if (!project_description || !profiles) {
      return new Response(
        JSON.stringify({ error: "프로젝트 설명과 팀원 프로필이 필요합니다." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Length validation to prevent abuse
    if (typeof project_description !== 'string' || project_description.length > 10000) {
      return new Response(
        JSON.stringify({ error: "프로젝트 설명은 10,000자를 초과할 수 없습니다." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (typeof profiles !== 'string' || profiles.length > 10000) {
      return new Response(
        JSON.stringify({ error: "팀원 프로필은 10,000자를 초과할 수 없습니다." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `
[프로젝트 설명]
${project_description}

[팀원 프로필 목록]
${profiles}

[요청]
위 프로젝트를 분석하여 Phase 구조를 설계하고, 각 Phase에 최적의 팀원을 배치한 JSON을 생성해주세요.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log("AI Response:", aiResponse);
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", aiResponse);
      return new Response(
        JSON.stringify({ 
          project_name: "새 프로젝트",
          project_summary: "프로젝트 분석 실패",
          phases: []
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const projectPlan = JSON.parse(jsonMatch[0]);
    
    return new Response(
      JSON.stringify(projectPlan), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in analyze-project function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
