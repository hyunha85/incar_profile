import type { NextApiRequest, NextApiResponse } from 'next';
import { generateIntroWithGemini, getFallbackIntro } from '@/lib/gemini';
import { AgentInfo } from '@/types';

// Next.js API Route 캐시 완전 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { agentInfo, requestId } = req.body as { agentInfo: AgentInfo; requestId?: number };
  if (!agentInfo) {
    return res.status(400).json({ success: false, error: 'agentInfo is required' });
  }

  // 서버에서 수신한 실제 payload 확인 (배포 후 로그로 확인 가능)
  console.log('[generate] received agentInfo:', JSON.stringify({
    name: agentInfo.name,
    position: agentInfo.position,
    branch: agentInfo.branch,
    specialty: agentInfo.specialty,
    careers: agentInfo.careers,
    career: (agentInfo as any).career,
    region: (agentInfo as any).region,
  }, null, 2));

  let intro = getFallbackIntro(agentInfo);

  try {
    const aiIntro = await generateIntroWithGemini(agentInfo, requestId);
    if (aiIntro) intro = aiIntro;
  } catch (e: any) {
    console.error('[generate] Gemini fallback:', e.message);
  }

  return res.status(200).json({ intro });
}
