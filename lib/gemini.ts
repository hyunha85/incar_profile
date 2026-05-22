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

  return `당신은 보험 설계사 퍼스널 브랜딩 전문가입니다.
아래 설계사 정보를 바탕으로 자기소개 문구를 작성해주세요.
이전 문구와 다른 표현으로 작성해주세요. 요청번호: ${seed}

[설계사 정보]
${infoLines}

[작성 조건]
- 2~3문장, 문장마다 줄바꿈(\\n) 삽입
- 각 문장 40자 내외
- 전문분야 → 신뢰 → 가치제안 흐름
- 1인칭, 신뢰감 있는 어조
- [설계사 정보]에 없는 보험 종목 언급 금지
- undefined/null 단어 절대 포함 금지
- 전체 100~150자

자기소개 문구만 출력. 따옴표나 부가 설명 없이.`;
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
