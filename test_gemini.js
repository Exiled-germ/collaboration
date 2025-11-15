// Gemini API 테스트 스크립트
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCu8T444h9D2GG2ub_zRvv4zwIbPUsT9go";

console.log("🔍 Gemini API 테스트 시작...");
console.log("API Key:", API_KEY.substring(0, 20) + "...");

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function listModels() {
  try {
    console.log("\n📋 사용 가능한 모델 목록 확인 중...");
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ 사용 가능한 모델:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  - ${m.name.replace('models/', '')}`);
        }
      });
    }
  } catch (error) {
    console.error("모델 목록 조회 실패:", error.message);
  }
}

async function testAPI() {
  try {
    console.log("\n📡 API 호출 중...");
    const result = await model.generateContent("Hello, respond with just 'OK' if you can read this.");
    const response = result.response;
    const text = response.text();
    
    console.log("✅ API 호출 성공!");
    console.log("응답:", text);
    console.log("\n✨ Gemini API가 정상적으로 작동합니다.");
  } catch (error) {
    console.error("\n❌ API 호출 실패!");
    console.error("에러 메시지:", error.message);
    
    if (error.message?.includes('quota')) {
      console.error("\n⚠️ 할당량 초과: API 키의 무료 할당량이 소진되었습니다.");
      console.error("해결 방법:");
      console.error("1. Google AI Studio에서 새 API 키 발급");
      console.error("2. 유료 플랜으로 업그레이드");
      console.error("3. 내일까지 대기 (무료 할당량은 매일 리셋됨)");
    } else if (error.message?.includes('API key')) {
      console.error("\n⚠️ API 키 오류: API 키가 유효하지 않거나 권한이 없습니다.");
    } else if (error.message?.includes('429')) {
      console.error("\n⚠️ 요청 제한: 너무 많은 요청을 보냈습니다.");
    } else if (error.message?.includes('404')) {
      console.error("\n⚠️ 모델을 찾을 수 없습니다. 사용 가능한 모델 목록을 확인합니다...");
      await listModels();
    }
  }
}

testAPI();
