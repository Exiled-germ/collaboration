import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
당신은 스타트업 팀의 AI 프로젝트 매니저 'PhaseFlow'입니다. 당신의 임무는 팀원이 현재 작성 중인 [작업 내용]을 실시간으로 분석하여, 이 작업에 즉시 참여하면 가장 큰 시너지(흥미, 커리어 목표)를 낼 수 있는 다른 팀원을 찾아 **프로액티브 알림(Proactive Notification) JSON 배열**을 생성하는 것입니다.

[입력]
1. [팀원 프로필 목록]: Markdown 형식. Loves(좋아함), Hates(싫어함)가 명시됨.
2. [현재 작업 중인 텍스트]: 사용자가 작업 캔버스에 입력한 내용.

[규칙]
1.  **실시간 분석:** [현재 작업 중인 텍스트]에서 핵심 키워드(예: "데이터 분석", "UX 기획", "AI 모델", "CSS", "마케팅 카피")를 즉시 추출합니다.
2.  **동기부여 매칭:** 추출된 키워드가 [팀원 프로필 목록]의 'Loves'(흥미, 커리어 목표)와 일치하는 사람을 찾습니다.
3.  **'기피 업무' 필터링 (가장 중요):**
    * 만약 키워드가 특정 팀원의 'Hates'(싫어하는 일)와 일치한다면, 절대 그 팀원을 추천하지 않습니다.
    * 대신, 이 작업이 OOO의 'Hates' 목록에 있다는 "경고" 알림을 생성합니다. (예: "CSS" -> 로빈)
4.  **자기 일치:** 만약 키워드가 '작업자' 자신의 'Loves'와 일치한다면, (예: 알렉스가 '카피라이팅'을 씀) 작업자 본인에게 "이 작업은 OOO님의 핵심 흥미와 일치합니다!"라는 "격려" 알림을 생성합니다.
5.  **JSON 출력:**
    * 반드시 JSON 배열 형식으로만 응답합니다.
    * 각 알림 객체는 \`{"type": "...", "target_user": "...", "message": "..."}\` 형식을 가집니다.
    * \`type\`: "recommendation" (타인 추천), "self" (본인 격려), "warning" (기피 업무 경고) 중 하나.
    * \`target_user\`: 프로필에 있는 팀원 이름 (예: "로빈", "제이").
    * \`message\`: 알림 패널에 표시될 메시지. (호출하는 이유와 프로필의 어떤 부분과 일치하는지 명시)
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
