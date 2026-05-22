import type { NextApiRequest, NextApiResponse } from 'next';
import { generateIntroWithGemini, getFallbackIntro } from '@/lib/gemini';
import { AgentInfo } from '@/types';

// Pages Router — dynamic/revalidate는 App Router 전용이므로 제거
// 캐시 방지는 응답 헤더로 처리
export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pages Router 캐시 완전 차단
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { agentInfo, requestId } = req.body as { agentInfo: AgentInfo; requestId?: number };
  if (!agentInfo) {
    return res.status(400).json({ success: false, error: 'agentInfo is required' });
  }

  // GEMINI_API_KEY 존재 여부 Vercel 로그에서 확인 가능
  const hasKey = !!process.env.GEMINI_API_KEY;
  console.log('[generate] GEMINI_API_KEY 존재:', hasKey, '| requestId:', requestId);
  console.log('[generate] agentInfo:', JSON.stringify({
    name: agentInfo.name,
    position: agentInfo.position,
    branch: agentInfo.branch,
    specialty: agentInfo.specialty,
    careers: agentInfo.careers,
  }));

  if (!hasKey) {
    console.error('[generate] GEMINI_API_KEY 없음 — Vercel 환경변수 확인 필요');
    const intro = getFallbackIntro(agentInfo);
    return res.status(200).json({
      intro,
      warning: 'GEMINI_API_KEY가 설정되지 않아 기본 문구를 반환합니다.',
      geminiError: 'GEMINI_API_KEY not set',
      requestId,
    });
  }

  try {
    const aiIntro = await generateIntroWithGemini(agentInfo, requestId);
    console.log('[generate] Gemini 성공 | requestId:', requestId);
    return res.status(200).json({ intro: aiIntro, requestId });

  } catch (e: any) {
    // Gemini 실패 — 에러 원인을 응답에 포함 (클라이언트 콘솔 + Vercel 로그 모두 확인 가능)
    console.error('[generate] Gemini 실패:', e.message);
    const intro = getFallbackIntro(agentInfo);
    return res.status(200).json({
      intro,
      geminiError: e.message,
      requestId,
    });
  }
}
