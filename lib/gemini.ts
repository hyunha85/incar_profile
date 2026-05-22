import { AgentInfo } from '@/types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

function safe(v: any): string {
  if (v === undefined || v === null || String(v) === 'undefined' || String(v) === 'null') return '';
  return String(v).trim();
}

export async function generateIntroWithGemini(
  agentInfo: AgentInfo,
  requestId?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  // ── 정규화 — 직접 agentInfo.career / agentInfo.region 참조 금지 ──
  const name      = safe(agentInfo.name);
  const position  = safe(agentInfo.position) || safe((agentInfo as any).slogan) || '설계사';
  const company   = safe(agentInfo.company) || '인카금융서비스';
  const region    = safe(agentInfo.branch) || safe((agentInfo as any).region) || '';

  // specialty — 실제 선택값만 (기본 보험 종목 자동 삽입 절대 금지)
  const specialtyArr = Array.isArray(agentInfo.specialty)
    ? agentInfo.specialty.filter(s => s?.trim())
    : [];
  const specialty = specialtyArr.join(', '); // 없으면 빈 문자열

  // careers — 배열 우선, 없으면 구버전 career
  const careersArr = Array.isArray(agentInfo.careers)
    ? agentInfo.careers.filter(c => c?.trim())
    : [];
  const careerStr = safe((agentInfo as any).career);
  const career = careersArr.length > 0
    ? careersArr.join(', ')
    : careerStr || '';

  // requestId — 매 호출마다 다른 문구 보장
  const seed = requestId || Date.now();

  // 값 있는 항목만 프롬프트에 포함 (없는 항목 라인 제거)
  const infoLines = [
    name     && `이름: ${name}`,
    position && `직책: ${position}`,
    company  && `소속: ${company}`,
    region   && `활동지역: ${region}`,
    specialty && `전문분야: ${specialty}`,
    career   && `경력: ${career}`,
  ].filter(Boolean).join('\n');

  console.log('[Gemini] agentInfo 정규화:', { name, position, region, specialty, career, seed });

  const prompt = `당신은 보험 설계사 퍼스널 브랜딩 전문가입니다.
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

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini 응답 없음');
  if (/undefined|null/.test(text)) throw new Error('응답에 undefined/null 포함');

  return text;
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
