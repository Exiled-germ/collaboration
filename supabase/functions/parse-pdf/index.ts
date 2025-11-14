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

    // Base64 디코딩
    const binaryData = Uint8Array.from(atob(file_base64), c => c.charCodeAt(0));
    
    // PDF 텍스트 추출 - 간단한 방법으로 추출
    // PDF는 복잡한 구조이므로, 기본적인 텍스트만 추출
    let textContent = `[PDF 파일: ${file_name}]\n\n`;
    
    // PDF 파일의 경우 기본적인 메타데이터만 추출
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const fullText = decoder.decode(binaryData);
    
    // PDF에서 텍스트 부분 추출 (간단한 패턴 매칭)
    const textMatches = fullText.match(/\(([^)]+)\)/g);
    if (textMatches && textMatches.length > 0) {
      const extractedTexts = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 3 && /[가-힣a-zA-Z]/.test(text))
        .join(' ');
      
      textContent += `추출된 내용:\n${extractedTexts.substring(0, 3000)}`;
    } else {
      textContent += `PDF 파일이 업로드되었습니다. 파일 크기: ${(binaryData.length / 1024).toFixed(2)} KB\n`;
      textContent += `AI가 문서의 존재를 인식하고 분석할 수 있도록 파일명과 메타데이터를 전달합니다.`;
    }

    return new Response(
      JSON.stringify({ text: textContent }),
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
