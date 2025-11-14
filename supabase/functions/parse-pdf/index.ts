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

    console.log(`Processing PDF: ${file_name}`);

    // Base64를 바이너리로 변환
    const binaryString = atob(file_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // PDF에서 간단한 텍스트 추출 시도
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    
    // PDF 내부의 텍스트 객체 추출
    const textMatches = text.match(/\(([^)]+)\)/g);
    const tjMatches = text.match(/\[([^\]]+)\]/g);
    
    let extractedText = `[PDF 파일: ${file_name}]\n\n`;
    
    if (textMatches && textMatches.length > 0) {
      const texts = textMatches
        .map(match => match.slice(1, -1))
        .filter(t => t.length > 2 && /[\uAC00-\uD7A3a-zA-Z0-9]/.test(t))
        .map(t => t.replace(/\\n/g, '\n').replace(/\\r/g, ''))
        .join(' ');
      
      extractedText += texts;
    }
    
    if (tjMatches && tjMatches.length > 0) {
      const additionalTexts = tjMatches
        .map(match => match.slice(1, -1))
        .filter(t => t.length > 2 && /[\uAC00-\uD7A3a-zA-Z0-9]/.test(t))
        .join(' ');
      
      if (additionalTexts) {
        extractedText += '\n\n' + additionalTexts;
      }
    }

    // 추출된 텍스트가 너무 적으면 안내 메시지 추가
    if (extractedText.length < 100) {
      extractedText += '\n\n[자동 추출이 어려운 PDF 형식입니다. 문서의 주요 내용을 직접 입력해주세요.]';
    }
    
    console.log(`PDF processing completed. Extracted ${extractedText.length} characters`);

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
