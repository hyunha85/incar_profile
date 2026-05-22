import { AgentInfo } from '@/types';

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
  const name = safe(agentInfo.name);
  const position = safe(agentInfo.position) || safe((agentInfo as any).slogan) || '보험설계사';
  const company = safe(agentInfo.company) || '인카금융서비스';
  const region = safe(agentInfo.branch) || safe((agentInfo as any).region) || '';

  const specialtyArr = Array.isArray(agentInfo.specialty)
    ? agentInfo.specialty.filter(s => s?.trim())
    : [];
  const specialty = specialtyArr.join(', ');

  const careersArr = Array.isArray(agentInfo.careers)
    ? agentInfo.careers.filter(c => c?.trim())
    : [];
  const careerStr = safe((agentInfo as any).career);
  const career = careersArr.length > 0 ? careersArr.join(', ') : careerStr || '';

  const infoLines = [
    name && `이름: ${name}`,
    position && `직책: ${position}`,
    company && `소속: ${company}`,
    region && `활동지역: ${region}`,
    specialty && `전문분야: ${specialty}`,
    career && `경력: ${career}`,
  ].filter(Boolean).join('\n');

  return `
당신은 보험설계사 퍼스널 브랜딩 전문 카피라이터입니다.
아래 설계사 정보를 바탕으로 실제 고객에게 보여줄 자기소개 문구를 작성해주세요.

요청번호: ${seed}
요청번호가 달라질 때마다 반드시 다른 첫 문장, 다른 문장 구조, 다른 표현으로 작성하세요.

[설계사 정보]
${infoLines}

[작성 목표]
이 글은 회사 소개가 아니라 보험설계사 본인을 소개하는 글입니다.
고객이 "이 사람에게 상담을 받아도 괜찮겠다"는 신뢰를 느끼도록 작성하세요.

[필수 조건]
- 4~5줄 분량
- 자연스러운 한국어
- 반드시 완성된 문장으로 끝낼 것
- 문장 중간에서 절대 끊기지 않게 작성
- 상품명이나 보험 키워드만 나열하지 말 것
- [설계사 정보]에 없는 보험 종목은 새로 만들지 말 것
- "undefined", "null" 절대 포함 금지
- 따옴표, 제목, 설명, 라벨 없이 본문만 출력
- 각 문장은 줄바꿈으로 구분

[톤앤매너]
- 실제 보험설계사가 고객에게 자신을 소개하는 느낌
- 따뜻하지만 과장되지 않은 어조
- 전문적이지만 딱딱하지 않은 문장
- 가입을 강요하는 광고 문구처럼 쓰지 말 것
- 회사 홍보문처럼 쓰지 말고, 사람 중심으로 쓸 것

[피해야 할 표현]
아래 표현은 너무 흔하므로 그대로 반복하지 마세요.
- 든든한 금융 파트너
- 신뢰를 바탕으로
- 맞춤 솔루션을 제공합니다
- 고객님의 미래를 함께합니다
- 소중한 자산과 삶을 지켜드립니다

[좋은 예시]
보험은 가입보다 관리가 더 중요하다고 생각합니다.
고객님의 현재 상황과 앞으로의 계획을 함께 살피며 꼭 필요한 보장을 제안드리겠습니다.
한 번의 상담으로 끝나지 않고, 오래 믿고 연락할 수 있는 사람이 되겠습니다.
필요한 순간 가장 먼저 떠오르는 설계사가 되겠습니다.

한 번의 계약보다 오래 이어지는 관계를 더 중요하게 생각합니다.
고객님의 생활과 가족의 상황을 충분히 이해한 뒤 현실적인 방향을 제안드리겠습니다.
복잡한 보험을 쉽게 설명하고, 필요한 선택을 차분히 도와드리겠습니다.
오래 믿고 상담할 수 있는 보험설계사가 되겠습니다.

[나쁜 예시]
고객님의 든든한 금융 파트너입니다.
신뢰를 바탕으로 맞춤 솔루션을 제공합니다.
건강 및 암 보험 전문 설계사입니다.

위 나쁜 예시처럼 쓰지 말고, 좋은 예시의 자연스러운 흐름을 참고해 새로운 자기소개 문구만 작성하세요.
`;
}

async function callGemini(model: string, prompt: string, apiKey: string): Promise<string> {
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.05,
        topP: 0.9,
        maxOutputTokens: 360,
      },
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

      if (e.message.includes('503')) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(`모든 모델 실패. 마지막 오류: ${lastError}`);
}

export function getFallbackIntro(agentInfo: AgentInfo): string {
  const specialtyArr = Array.isArray(agentInfo.specialty)
    ? agentInfo.specialty.filter(s => s?.trim())
    : [];
  const specialty = specialtyArr.length > 0 ? specialtyArr.join(' · ') : '보험';

  const careersArr = Array.isArray(agentInfo.careers)
    ? agentInfo.careers.filter(c => c?.trim())
    : [];
  const career = careersArr[0] || safe((agentInfo as any).career) || '';

  return [
    career ? `${career}의 경험을 바탕으로 고객님의 상황을 세심하게 살피겠습니다.` : '',
    `복잡한 ${specialty} 정보를 이해하기 쉽게 안내하고, 꼭 필요한 선택을 도와드리겠습니다.`,
    '한 번의 상담으로 끝나지 않고 오래 믿고 연락할 수 있는 설계사가 되겠습니다.',
  ].filter(Boolean).join('\n');
}
