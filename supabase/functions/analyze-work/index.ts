import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
당신은 스타트업 팀의 AI 프로젝트 매니저 'PhaseFlow'입니다. 당신의 임무는 팀원이 현재 작성 중인 [작업 내용]을 실시간으로 분석하여, 이 작업에 즉시 참여하면 가장 큰 시너지를 낼 수 있는 다른 팀원을 찾아 **프로액티브 알림(Proactive Notification) JSON 배열**을 생성하는 것입니다.

[입력]
1. [팀원 프로필 목록]: Markdown 형식. 각 팀원은 다음 정보를 포함:
   - Loves: 좋아하는 일, 흥미 분야
   - Hates: 싫어하는 일, 기피하는 업무
   - Tools: 사용 가능한 도구, 기술 스택
   - Career: 과거 경험, 작업물, 전문 분야
2. [현재 작업 중인 텍스트]: 사용자가 작업 캔버스에 입력한 내용.

[규칙]
1.  **실시간 분석:** [현재 작업 중인 텍스트]에서 핵심 키워드를 추출합니다.
2.  **종합적 매칭:** 추출된 키워드를 팀원의 Loves, Tools, Career와 종합적으로 비교합니다.
    * Loves: 동기부여와 흥미 일치
    * Tools: 실제 사용 가능한 기술/도구 일치
    * Career: 과거 경험과 전문성 일치
3.  **'기피 업무' 필터링 (가장 중요):**
    * 키워드가 특정 팀원의 'Hates'와 일치하면, 절대 그 팀원을 추천하지 않습니다.
    * 대신, "경고" 알림을 생성합니다.
4.  **자기 일치:** 키워드가 작업자 자신의 Loves/Tools/Career와 일치하면 "격려" 알림을 생성합니다.
5.  **전문성 강조:** 추천 메시지에서 Career나 Tools의 구체적 경험을 언급하여 신뢰성을 높입니다.
    * 예: "알렉스님은 지난 5개의 바이럴 캠페인에서 평균 200% 성장을 달성한 경험이 있습니다."
6.  **JSON 출력:**
    * 반드시 JSON 배열 형식으로만 응답합니다.
    * 각 알림: \`{"type": "recommendation|self|warning", "target_user": "이름", "message": "상세 메시지"}\`
    * 일치하는 항목이 없으면 빈 배열 \`[]\`을 반환합니다.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profiles, work_in_progress } = await req.json();
    
    if (!profiles || !work_in_progress) {
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

[현재 작업 중인 텍스트]
${work_in_progress}

[요청]
위 내용을 분석하여 JSON 배열 형식으로만 알림을 생성해 주세요.
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

    const notifications = JSON.parse(jsonMatch[0]);
    
    return new Response(
      JSON.stringify(notifications), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in analyze-work function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
