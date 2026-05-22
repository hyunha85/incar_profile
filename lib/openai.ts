import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentInfo } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export async function generateAIIntro(agentInfo: AgentInfo): Promise<string> {
  const prompt = `다음 보험 설계사 정보를 바탕으로 150자 내외의 전문적이고 신뢰감 있는 자기소개문을 작성해주세요.
  
이름: ${agentInfo.name}
경력: ${agentInfo.career}
전문분야: ${agentInfo.specialty.join(', ')}
활동지역: ${agentInfo.region}
슬로건: ${agentInfo.slogan}

조건:
- 1인칭 시점으로 작성
- 전문성과 신뢰감 강조
- 따뜻하고 친근한 톤
- 150자 내외 (최대 200자)
- 마침표로 끝내기`;

  const result = await model.generateContent(prompt);
  return result.response.text() || '';
}

export async function generateRecommendedQuestions(agentInfo: AgentInfo): Promise<string[]> {
  const prompt = `보험 설계사 ${agentInfo.name}님의 전문분야(${agentInfo.specialty.join(', ')})를 고려하여, 
고객이 상담을 신청할 때 자주 물어볼 법한 현실적인 질문 3가지를 생성해주세요.

조건:
- 고객 입장에서 작성
- 구체적이고 실용적인 질문
- 각 질문은 한 문장으로
- JSON 배열 형식으로만 응답: ["질문1", "질문2", "질문3"]`;

  const result = await model.generateContent(prompt);
  const content = result.response.text() || '[]';

  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      '보험 관련 질문이 있어요.',
      '상담 가능한 시간이 언제인가요?',
      '어떤 보험이 저에게 맞을까요?',
    ];
  }
}