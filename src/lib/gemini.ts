import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.error('⚠️ Gemini API key is not configured!');
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash"
});

async function callGeminiWithRetry(prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text;
    } catch (error: any) {
      console.error(`Gemini API attempt ${i + 1} failed:`, error);
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        throw new Error('Gemini API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      }
      
      if (error.message?.includes('API key')) {
        throw new Error('Gemini API 키가 유효하지 않습니다. 환경 변수를 확인해주세요.');
      }
      
      if (i === maxRetries - 1) {
        throw new Error(`AI 분석 실패: ${error.message || '알 수 없는 오류'}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('AI 분석에 실패했습니다.');
}

export async function analyzeProject(projectDescription: string, profiles: string) {
  const prompt = `You are an AI project management assistant. Analyze the following project and team profiles to create an optimal phase structure.

PROJECT DESCRIPTION:
${projectDescription}

TEAM PROFILES:
${profiles}

Based on this information, create a detailed project phase structure. For each phase:
1. Identify the phase name and description
2. Recommend team members who are best suited (based on their Loves/Tools/Career)
3. Consider what each member Hates to avoid mismatches

Return a JSON object with this structure:
{
  "project_name": "string",
  "project_summary": "string (1-2 sentences)",
  "phases": [
    {
      "id": "phase-1",
      "name": "Phase Name",
      "description": "Detailed description of what this phase involves",
      "recommended": ["Member Name 1", "Member Name 2"],
      "active": [],
      "milestone": "What should be achieved",
      "deadline": "Suggested timeline (e.g., '2 weeks')",
      "kpis": ["KPI 1", "KPI 2"]
    }
  ]
}

Make sure to:
- Create 4-6 phases that cover the entire project lifecycle
- Match team members to phases based on their skills and preferences
- Avoid assigning members to work they explicitly hate
- Include realistic milestones and KPIs for each phase`;

  const text = await callGeminiWithRetry(prompt);
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse Gemini response:', jsonText);
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }
}

export async function analyzeArtifact(
  profiles: string,
  phaseId: string,
  phaseName: string,
  artifactContent: string
) {
  const prompt = `You are an AI collaboration assistant. Analyze the following work artifact and suggest next steps.

TEAM PROFILES:
${profiles}

CURRENT PHASE: ${phaseName} (${phaseId})

ARTIFACT CONTENT:
${artifactContent}

Based on this artifact:
1. Identify key insights and action items
2. Determine which team members should be involved next
3. Generate personalized invite messages explaining why each member is needed

Return a JSON array of invites:
[
  {
    "target_user": "Member Name",
    "target_email": "email@example.com",
    "invite_message": "Personalized message explaining the task and why they're needed",
    "reason": "Brief explanation of why this member is the best fit"
  }
]

Consider:
- Each member's Loves/Hates/Tools/Career
- The specific needs identified in the artifact
- Avoid inviting members to tasks they explicitly hate`;

  const text = await callGeminiWithRetry(prompt);
  
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse Gemini response:', jsonText);
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }
}

export async function refinePhaseStructure(
  currentProject: any,
  profiles: string,
  refinementRequest: string
) {
  const prompt = `You are an AI project management assistant. Refine the existing phase structure based on the user's request.

CURRENT PROJECT:
${JSON.stringify(currentProject, null, 2)}

TEAM PROFILES:
${profiles}

REFINEMENT REQUEST:
${refinementRequest}

Based on this request, modify the phase structure. You can:
- Add new phases
- Remove phases
- Modify phase descriptions
- Reassign team members
- Adjust milestones and KPIs

Return the complete updated project structure in the same JSON format as the original.`;

  const text = await callGeminiWithRetry(prompt);
  
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse Gemini response:', jsonText);
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }
}
