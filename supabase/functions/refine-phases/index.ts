import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
당신은 스타트업 프로젝트의 Phase 구조를 최적화하는 AI 전문가입니다.

[입력]
1. [현재 프로젝트 구조]: 프로젝트 이름, 요약, 기존 Phase 목록
2. [팀원 프로필]: 각 팀원의 Loves, Hates, Tools, Career
3. [사용자 요구사항]: 사용자가 원하는 Phase 구조 수정 내용

[규칙]
1. **사용자 요구사항 우선**: 사용자의 요청을 최우선으로 반영합니다.
2. **팀원 역량 고려**: 각 Phase에 적합한 팀원을 recommended 리스트에 포함합니다.
3. **논리적 순서**: Phase는 프로젝트 진행의 논리적 흐름을 따라야 합니다.
4. **구체적 설명**: 각 Phase의 description은 구체적이고 실행 가능해야 합니다.
5. **현실적 목표**: 프로젝트의 최종 목표와 타임라인을 고려합니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요:
\`\`\`json
{
  "project_name": "프로젝트 이름",
  "project_summary": "프로젝트 요약",
  "phases": [
    {
      "id": "phase1",
      "name": "Phase 이름",
      "description": "Phase 설명",
      "recommended": ["팀원1", "팀원2"],
      "active": []
    }
  ]
}
\`\`\`

[예시]
사용자 요구사항: "Phase 3와 4를 합치고, 마케팅 단계를 더 세분화해주세요"
→ AI는 기존 Phase 3, 4를 하나로 통합하고, 마케팅 Phase를 여러 단계로 나눕니다.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { current_project, profiles, user_request } = await req.json();
    
    // Input validation
    if (!current_project || !user_request) {
      return new Response(
        JSON.stringify({ error: "현재 프로젝트 정보와 요구사항이 필요합니다." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Length validation to prevent abuse
    if (typeof profiles !== 'string' || profiles.length > 10000) {
      return new Response(
        JSON.stringify({ error: "팀원 프로필은 10,000자를 초과할 수 없습니다." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (typeof user_request !== 'string' || user_request.length > 5000) {
      return new Response(
        JSON.stringify({ error: "요구사항은 5,000자를 초과할 수 없습니다." }), 
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
[현재 프로젝트 구조]
프로젝트 이름: ${current_project.project_name}
프로젝트 요약: ${current_project.project_summary}

기존 Phases:
${current_project.phases.map((phase: any, idx: number) => `
${idx + 1}. ${phase.name}
   설명: ${phase.description || '없음'}
   추천 팀원: ${phase.recommended.join(', ')}
`).join('\n')}

[팀원 프로필]
${profiles}

[사용자 요구사항]
${user_request}

[요청]
위 요구사항을 반영하여 개선된 프로젝트 구조를 JSON 형식으로 생성해주세요.
`;

    console.log("Sending request to AI gateway...");
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청 한도 초과. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧 부족. Lovable AI 크레딧을 충전해주세요." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Extract JSON from markdown code blocks if present
    let jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/);
    }
    
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
    const refinedProject = JSON.parse(jsonString.trim());

    return new Response(
      JSON.stringify({ refined_project: refinedProject }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in refine-phases:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Phase 구조 개선 중 오류가 발생했습니다." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
