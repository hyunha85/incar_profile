import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const profileData = req.body;
  if (!profileData) {
    return res.status(400).json({ success: false, error: 'Profile data is required' });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const serviceKey  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey     = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !(serviceKey || anonKey)) {
    return res.status(500).json({ success: false, error: 'Supabase 환경변수가 없습니다.' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey || anonKey);
  const id = uuidv4();

  // Storage 없음 — base64 또는 URL 그대로 DB에 저장
  const photoUrl          = profileData.photoUrl          || null;
  const processedPhotoUrl = profileData.processedPhotoUrl || null;

  const { error: dbError } = await supabase.from('profiles').insert({
    id,
    profile_type:        profileData.profileType                                              || null,
    agent_name:          profileData.agentInfo?.name                                         || null,
    agent_branch:        profileData.agentInfo?.branch                                       || null,
    agent_position:      profileData.agentInfo?.position                                     || null,
    agent_company:       profileData.agentInfo?.company                                      || '인카금융서비스',
    agent_careers:       Array.isArray(profileData.agentInfo?.careers)
                           ? profileData.agentInfo.careers.filter((c: string) => c?.trim())
                           : [],
    agent_specialty:     Array.isArray(profileData.agentInfo?.specialty)
                           ? profileData.agentInfo.specialty
                           : [],
    agent_phone:         profileData.agentInfo?.phone                                        || null,
    agent_email:         profileData.agentInfo?.email                                        || null,
    agent_kakao:         profileData.agentInfo?.kakao                                        || null,
    agent_blog:          profileData.agentInfo?.blog                                         || null,
    agent_instagram:     profileData.agentInfo?.instagram                                    || null,
    agent_youtube:       profileData.agentInfo?.youtube                                      || null,
    photo_url:           photoUrl,
    processed_photo_url: processedPhotoUrl,
    ai_intro:            profileData.aiIntro                                                 || null,
    user_intro:          profileData.userIntro                                               || null,
    created_at:          new Date().toISOString(),
  });

  if (dbError) {
    console.error('[save] DB 실패:', dbError.message, dbError.code);
    return res.status(500).json({
      success: false,
      error: `프로필 저장 실패: ${dbError.message}`,
      code: dbError.code,
    });
  }

  return res.status(200).json({ success: true, id });
}
