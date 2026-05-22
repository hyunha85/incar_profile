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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !(serviceKey || anonKey)) {
    console.error('[save] Supabase 환경변수 없음');
    return res.status(500).json({ success: false, error: 'Supabase 환경변수가 설정되지 않았습니다.' });
  }

  console.log('[save] supabaseUrl:', supabaseUrl?.slice(0, 30));

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey || anonKey!);
  const id = uuidv4();

  let photoUrl: string | null = null;
  let processedPhotoUrl: string | null = null;

  // ── Storage 업로드 — 실패해도 절대 throw하지 않음 ──
  if (profileData.photoUrl?.startsWith('data:')) {
    try {
      const base64 = profileData.photoUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const ext    = profileData.photoUrl.includes('data:image/png') ? 'png' : 'jpg';
      const path   = `originals/${id}.${ext}`;

      const { error } = await supabase.storage
        .from('profile-images')
        .upload(path, buffer, { contentType: `image/${ext}`, upsert: true });

      if (error) {
        console.warn('[save] 원본 사진 업로드 실패 (무시):', error.message);
        // 실패해도 계속 진행 — photoUrl은 null 유지
      } else {
        const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
        photoUrl = data.publicUrl;
        console.log('[save] 원본 사진 업로드 성공');
      }
    } catch (e: any) {
      console.warn('[save] 원본 사진 예외 (무시):', e.message);
    }
  } else if (profileData.photoUrl) {
    photoUrl = profileData.photoUrl;
  }

  if (profileData.processedPhotoUrl?.startsWith('data:')) {
    try {
      const base64 = profileData.processedPhotoUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const path   = `processed/${id}.png`;

      const { error } = await supabase.storage
        .from('profile-images')
        .upload(path, buffer, { contentType: 'image/png', upsert: true });

      if (error) {
        console.warn('[save] 누끼 사진 업로드 실패 (무시):', error.message);
      } else {
        const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
        processedPhotoUrl = data.publicUrl;
        console.log('[save] 누끼 사진 업로드 성공');
      }
    } catch (e: any) {
      console.warn('[save] 누끼 사진 예외 (무시):', e.message);
    }
  } else if (profileData.processedPhotoUrl) {
    processedPhotoUrl = profileData.processedPhotoUrl;
  }

  // ── DB insert — 사진 업로드 성공 여부와 무관하게 항상 실행 ──
  console.log('[save] DB insert 시작, id:', id, 'photoUrl:', photoUrl ? '있음' : '없음');

  const { error: dbError } = await supabase.from('profiles').insert({
    id,
    profile_type:        profileData.profileType,
    agent_name:          profileData.agentInfo?.name          || null,
    agent_branch:        profileData.agentInfo?.branch        || null,
    agent_position:      profileData.agentInfo?.position      || null,
    agent_company:       profileData.agentInfo?.company       || '인카금융서비스',
    agent_careers:       profileData.agentInfo?.careers?.filter((c: string) => c?.trim()) || [],
    agent_specialty:     profileData.agentInfo?.specialty     || [],
    agent_phone:         profileData.agentInfo?.phone         || null,
    agent_email:         profileData.agentInfo?.email         || null,
    agent_kakao:         profileData.agentInfo?.kakao         || null,
    agent_blog:          profileData.agentInfo?.blog          || null,
    agent_instagram:     profileData.agentInfo?.instagram     || null,
    agent_youtube:       profileData.agentInfo?.youtube       || null,
    photo_url:           photoUrl,
    processed_photo_url: processedPhotoUrl,
    ai_intro:            profileData.aiIntro                  || null,
    user_intro:          profileData.userIntro                || null,
    created_at:          new Date().toISOString(),
  });

  if (dbError) {
    console.error('[save] DB insert 실패:', dbError.message, '| code:', dbError.code);
    return res.status(500).json({
      success: false,
      error: `프로필 저장 실패: ${dbError.message}`,
    });
  }

  console.log('[save] 저장 완료, id:', id);
  return res.status(200).json({ success: true, id });
}
