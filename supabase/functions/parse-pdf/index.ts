import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_base64, file_name } = await req.json();
    
    if (!file_base64) {
      return new Response(
        JSON.stringify({ error: "파일 데이터가 필요합니다." }), 
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

    console.log(`Processing PDF: ${file_name}`);

    // Gemini AI에게 PDF 분석 요청
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 PDF 문서의 모든 텍스트 내용을 추출해주세요. 제목, 본문, 표, 리스트 등 모든 텍스트를 포함하되, 원본의 구조와 포맷을 최대한 유지해주세요. 한글과 영어 모두 정확하게 추출해주세요.'
              },
              {
                type: 'file',
                data: file_base64,
                mimeType: 'application/pdf'
              }
            ]
          }
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
    const extractedText = data.choices[0].message.content;
    
    console.log("PDF text extracted successfully");

    return new Response(
      JSON.stringify({ text: extractedText }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error parsing PDF:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "PDF 파싱 중 오류가 발생했습니다." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
