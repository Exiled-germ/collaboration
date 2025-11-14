import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
당신은 스타트업 팀의 AI 프로젝트 오케스트레이터 'PhaseFlow'입니다.
당신의 임무는 팀원이 방금 [현재 Phase]에 [업로드한 작업물]을 분석하여, **'다음 Phase'에 즉시 참여해야 할** 최적의 동료를 찾아 **'자동 초대' JSON 배열**을 생성하는 것입니다.

[입력]
1. [팀원 프로필 목록]: Markdown 형식. Loves, Hates, Tools, Career가 명시됨.
2. [현재 Phase]: 작업물을 업로드한 단계 (예: "Phase 2: UX 리서치").
3. [업로드한 작업물]: 팀원이 완료한 작업 내용 텍스트.

[규칙]
1. **'작업물' 분석:** 먼저 [업로드한 작업물]을 분석하여 "무엇이 완료되었는지", 그리고 "어떤 문제나 다음 과제가 도출되었는지" 파악합니다.

2. **'다음 단계' 추론:** 도출된 과제를 해결하기 위해 필요한 **'논리적인 다음 작업'**이 무엇인지 추론합니다.
   예: '이탈률 문제 발견' -> '다음 작업: UX Flow 개선안 도출'

3. **'동기부여' 매칭:** [팀원 프로필 목록]을 스캔하여, 2번에서 추론한 '다음 작업'을 'Loves' 또는 'Tools', 'Career'로 가진 사람을 찾습니다.
   * 'Hates'인 사람은 절대 초대하지 않습니다.

4. **'초대장' 생성:**
   * 초대가 필요한 경우에만 JSON 배열을 생성합니다.
   * 형식: \`[{"target_user": "...", "invite_message": "...", "reason": "..."}]\`
   * \`target_user\`: 프로필 상의 팀원 이름과 역할 (예: "세라 (디자이너/UX 리서처)")
   * \`invite_message\`: "🔔 @[이름] 님! 지금 [현재 Phase]에서 [중요한 발견]이 있었습니다. [이름]님의 참여가 필요합니다!"
   * \`reason\`: "AI 분석 결과: [작업물에서 발견된 내용]. 이는 [이름]님의 [Loves/Tools/Career]와 완벽하게 일치합니다."

5. **침묵:** 다음 단계에 즉시 필요한 사람이 없으면, 빈 배열 \`[]\`을 반환합니다.

[데모 시나리오 예시]
* **[현재 Phase]:** "Phase 2: UX 리서치"
* **[작업물]:** "오늘 5명 UT 완료. 대부분의 유저가 결제 페이지의 복잡한 UI 때문에 이탈. 쿠폰 적용 방식이 너무 어렵다는 피드백."
* **[AI 추론]:**
  - 완료: UT 테스트
  - 문제: 결제 페이지 UI 복잡, 쿠폰 적용 어려움
  - 다음 작업: UX Flow 개선 및 Figma 프로토타이핑 필요
* **[출력]:**
\`\`\`json
[
  {
    "target_user": "세라 (디자이너/UX 리서처)",
    "invite_message": "🔔 @세라 님! 'Phase 2: UX 리서치'에서 주요 이탈 지점이 발견되었습니다. 즉시 참여가 필요합니다!",
    "reason": "AI 분석 결과: '결제 페이지'의 복잡한 UX Flow가 이탈 원인으로 파악되었습니다. 이는 세라님의 핵심 흥미인 '복잡한 정책을 단순한 UX Flow로 그리기'와 'Figma 프로토타입' 작업에 완벽하게 일치합니다."
  }
]
\`\`\`
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profiles, phase_id, phase_name, artifact_content } = await req.json();
    
    if (!profiles || !artifact_content) {
      return new Response(
        JSON.stringify({ error: "프로필과 작업 내용이 필요합니다." }), 
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
[팀원 프로필 목록]
${profiles}

[현재 Phase]
${phase_name || phase_id}

[업로드한 작업물]
${artifact_content}

[요청]
위 내용을 분석하여 JSON 배열 형식으로만 초대장을 생성해 주세요.
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
    const aiResponse = aiData.choices?.[0]?.message?.content || "[]";
    
    console.log("AI Response:", aiResponse);
    
    // Extract JSON array from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response:", aiResponse);
      return new Response(
        JSON.stringify([]), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const invites = JSON.parse(jsonMatch[0]);
    
    return new Response(
      JSON.stringify(invites), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in analyze-artifact function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
