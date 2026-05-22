import { AgentInfo } from '@/types';

// 우선순위 순 — 첫 번째 실패 시 다음 모델로 자동 fallback
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash-lite',
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function safe(v: any): string {
  if (!v || String(v) === 'undefined' || String(v) === 'null') return '';
  return String(v).trim();
}

function buildPrompt(agentInfo: AgentInfo, seed: number): string {
  const name      = safe(agentInfo.name);
  const position  = safe(agentInfo.position) || safe((agentInfo as any).slogan) || '설계사';
  const company   = safe(agentInfo.company) || '인카금융서비스';
  const region    = safe(agentInfo.branch) || safe((agentInfo as any).region) || '';

  const specialtyArr = Array.isArray(agentInfo.specialty)
    ? agentInfo.specialty.filter(s => s?.trim()) : [];
  const specialty = specialtyArr.join(', ');

  const careersArr = Array.isArray(agentInfo.careers)
    ? agentInfo.careers.filter(c => c?.trim()) : [];
  const careerStr = safe((agentInfo as any).career);
  const career = careersArr.length > 0 ? careersArr.join(', ') : careerStr || '';

  const infoLines = [
    name     && `이름: ${name}`,
    position && `직책: ${position}`,
    company  && `소속: ${company}`,
    region   && `활동지역: ${region}`,
    specialty && `전문분야: ${specialty}`,
    career   && `경력: ${career}`,
  ].filter(Boolean).join('\n');

  return `당신은 보험설계사 퍼스널 브랜딩 전문 카피라이터입니다.
아래 설계사 정보를 바탕으로 자기소개 문구를 작성해주세요.
요청번호: ${seed} (매번 반드시 다른 표현과 구조로 작성할 것)

[설계사 정보]
${infoLines}

[필수 작성 조건]
- 반드시 완성된 문장으로 마무리할 것 (절대 문장 중간에 끊기면 안 됨)
- 4~5줄 분량의 자연스러운 한국어 자기소개
- 보험 상품명, 키워드 단순 나열 절대 금지
- 고객 신뢰 / 맞춤 상담 / 장기적 관계 / 함께하는 파트너 중심으로 작성
- 1인칭 시점, 따뜻하고 신뢰감 있는 어조
- [설계사 정보]에 없는 보험 종목은 절대 언급 금지
- "undefined", "null" 단어 절대 포함 금지
- 문장마다 줄바꿈으로 자연스럽게 구분

[예시 스타일 — 이 형식을 참고하되 내용은 설계사 정보에 맞게 새롭게 작성]
"고객 한 분 한 분의 상황에 맞는 보험 솔루션을 제공하며,
신뢰를 바탕으로 함께하는 금융 파트너가 되겠습니다.
보험은 가입보다 관리가 중요합니다.
항상 고객님 곁에서 든든한 버팀목이 되어드리겠습니다."

위 예시와 다른 새로운 표현으로, 설계사 정보를 살려 완성된 자기소개 문구만 출력하세요.
따옴표, 설명, 라벨, 제목 없이 본문만 출력합니다.`;
}

async function callGemini(model: string, prompt: string, apiKey: string): Promise<string> {
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.95, topP: 0.95, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status} (${model}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`Gemini 응답 없음 (${model})`);
  if (/undefined|null/.test(text)) throw new Error('응답에 undefined/null 포함');

  return text;
}

export async function generateIntroWithGemini(
  agentInfo: AgentInfo,
  requestId?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const seed = requestId || Date.now();
  const prompt = buildPrompt(agentInfo, seed);

  console.log('[Gemini] 시도 모델 순서:', MODELS.join(' → '));

  let lastError = '';
  for (const model of MODELS) {
    try {
      console.log(`[Gemini] ${model} 호출 중...`);
      const text = await callGemini(model, prompt, apiKey);
      console.log(`[Gemini] ${model} 성공`);
      return text;
    } catch (e: any) {
      lastError = e.message;
      console.warn(`[Gemini] ${model} 실패:`, e.message);

      // 503(과부하)이면 1초 대기 후 다음 모델 시도
      if (e.message.includes('503')) {
        await new Promise(r => setTimeout(r, 1000));
      }
      // 404(모델 없음)이면 즉시 다음 모델
      // 그 외도 다음 모델로
    }
  }

  throw new Error(`모든 모델 실패. 마지막 오류: ${lastError}`);
}

export function getFallbackIntro(agentInfo: AgentInfo): string {
  const specialtyArr = Array.isArray(agentInfo.specialty)
    ? agentInfo.specialty.filter(s => s?.trim()) : [];
  const specialty = specialtyArr.length > 0 ? specialtyArr.join(' · ') : '보험';
  const careersArr = Array.isArray(agentInfo.careers)
    ? agentInfo.careers.filter(c => c?.trim()) : [];
  const career = careersArr[0] || safe((agentInfo as any).career) || '';

  return [
    career ? `${career}의 경험을 바탕으로,` : '',
    `고객 한 분 한 분의 상황에 맞는 ${specialty} 솔루션을 제공합니다.`,
    '신뢰와 전문성을 바탕으로 고객의 소중한 자산과 삶을 함께 지켜드리겠습니다.',
  ].filter(Boolean).join('\n');
}
