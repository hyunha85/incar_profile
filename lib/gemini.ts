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
당신은 금융 전문가 퍼스널 브랜딩 프로필 작성 전문가입니다.
아래 설계사 정보를 바탕으로 고객에게 공개되는 프로필 페이지용 자기소개를 작성하세요.

요청번호: ${seed}
요청번호가 달라질 때마다 반드시 다른 첫 문장, 다른 문장 구조, 다른 표현으로 작성하세요.

[설계사 정보]
${infoLines}

[작성 목표]
고객이 이 프로필을 보고 "상담을 받을 만한 전문가"라고 느끼도록 작성합니다.
이 글은 광고가 아니라 보험설계사 본인의 전문성과 관점을 보여주는 소개입니다.

[필수 구성 흐름]
전문분야 또는 일하는 방식 → 경력 기반 역량 → 고객을 대하는 가치관 → 신뢰 메시지
(순서는 유연하게 조정 가능, 흐름이 자연스러우면 됨)

[형식 조건]
- 4~5문장, 반드시 각 문장 사이에 실제 줄바꿈(개행문자)을 넣을 것
- 문장을 한 줄로 이어서 쓰지 말 것. 반드시 엔터로 구분
- 180~220자 수준
- 반드시 완성된 마지막 문장으로 끝낼 것 (절대 중간에 끊기지 않도록)
- 따옴표, 제목, 라벨, 설명 없이 본문만 출력
- [설계사 정보]에 없는 보험 종목 임의 추가 금지
- "undefined", "null" 포함 금지

[톤]
- 전문적이고 신뢰감 있는 어조
- 과도한 감성 표현 금지
- 담백하고 명확한 문체

[절대 사용 금지 표현]
- "보험은 어렵습니다" / "쉽게 설명해드립니다"
- "최고" / "최선" / "완벽"
- "든든한 파트너" / "소중한 자산을 지켜드립니다"
- "맞춤 솔루션" / "고객님의 미래를 함께합니다"
- 보험 가입 유도 문구
- 회사 홍보 문구

[참고 예시 — 이 스타일을 참고하되 그대로 쓰지 말 것]
고객의 상황에 맞는 금융 설계를 중요하게 생각합니다.
보험을 단순한 상품이 아닌 삶의 계획과 연결된 금융 솔루션으로 바라봅니다.
10년 이상의 현장 경험을 바탕으로 필요한 보장이 무엇인지 함께 살피겠습니다.
오래 믿고 연락할 수 있는 설계사가 되겠습니다.

위 예시를 참고하되, 반드시 새로운 표현과 구조로 작성하세요.
본문만 출력하세요.
`;
}

async function callGemini(model: string, prompt: string, apiKey: string): Promise<string> {
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

  // gemini-2.5 시리즈만 thinkingConfig 지원
  const is25 = model.startsWith('gemini-2.5');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        topP: 0.9,
        maxOutputTokens: 1024,
        ...(is25 ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status} (${model}): ${errText}`);
  }

  const data = await res.json();

  const candidate = data?.candidates?.[0];

  const finishReason = candidate?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn(`[Gemini] (${model}) finishReason=MAX_TOKENS — 응답이 토큰 한도로 잘렸을 수 있음`);
  }

  const parts = candidate?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map((p: any) => p?.text ?? '').join('').trim()
    : (parts?.[0]?.text ?? '').trim();

  console.log(`[Gemini] (${model}) 응답 길이: ${text?.length ?? 0}자 | finishReason: ${finishReason}`);

  if (!text) throw new Error(`Gemini 응답 없음 (${model})`);
  if (/undefined|null/.test(text)) throw new Error('응답에 undefined/null 포함');

  const normalized = text
    .replace(/\.\s{1,2}(?=[가-힣])/g, '.\n')
    .trim();

  console.log(`[Gemini] (${model}) 최종 출력:\n${normalized}`);

  return normalized;
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
