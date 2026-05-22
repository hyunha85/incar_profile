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

  // Supabase 미설정 시 명확한 에러
  if (!supabaseUrl || !(serviceKey || anonKey)) {
    console.error('Supabase env missing');
    return res.status(500).json({ success: false, error: 'Supabase 환경변수가 설정되지 않았습니다.' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  // Service Role 우선 (Storage 업로드 + DB insert 권한 필요)
  const supabase = createClient(supabaseUrl, serviceKey || anonKey!);
  const id = uuidv4();

  let photoUrl: string | null        = null;
  let processedPhotoUrl: string | null = null;

  // ── 원본 사진 Storage 업로드 ──
  if (profileData.photoUrl?.startsWith('data:')) {
    try {
      const base64   = profileData.photoUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer   = Buffer.from(base64, 'base64');
      const ext      = profileData.photoUrl.includes('data:image/png') ? 'png' : 'jpg';
      const fileName = `originals/${id}.${ext}`;

      const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, buffer, { contentType: `image/${ext}`, upsert: true });

      if (error) {
        console.warn('원본 사진 업로드 실패:', error.message);
      } else {
        const { data } = supabase.storage.from('profile-images').getPublicUrl(fileName);
        photoUrl = data.publicUrl;
        console.log('원본 사진 업로드 성공:', photoUrl);
      }
    } catch (e: any) {
      console.warn('원본 사진 처리 오류:', e.message);
    }
  } else if (profileData.photoUrl) {
    // 이미 URL이면 그대로 사용
    photoUrl = profileData.photoUrl;
  }

  // ── 누끼 이미지 Storage 업로드 ──
  if (profileData.processedPhotoUrl?.startsWith('data:')) {
    try {
      const base64   = profileData.processedPhotoUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer   = Buffer.from(base64, 'base64');
      const fileName = `processed/${id}.png`;

      const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

      if (error) {
        console.warn('누끼 사진 업로드 실패:', error.message);
      } else {
        const { data } = supabase.storage.from('profile-images').getPublicUrl(fileName);
        processedPhotoUrl = data.publicUrl;
        console.log('누끼 사진 업로드 성공:', processedPhotoUrl);
      }
    } catch (e: any) {
      console.warn('누끼 사진 처리 오류:', e.message);
    }
  } else if (profileData.processedPhotoUrl) {
    processedPhotoUrl = profileData.processedPhotoUrl;
  }

  // ── DB insert ──
  const insertData = {
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
    agent_kakao:         (profileData.agentInfo as any)?.kakao      || null,
    agent_blog:          (profileData.agentInfo as any)?.blog       || null,
    agent_instagram:     (profileData.agentInfo as any)?.instagram  || null,
    agent_youtube:       (profileData.agentInfo as any)?.youtube    || null,
    photo_url:           photoUrl,
    processed_photo_url: processedPhotoUrl,
    ai_intro:            profileData.aiIntro   || null,
    user_intro:          profileData.userIntro || null,
    created_at:          new Date().toISOString(),
  };

  console.log('[save] DB insert 시작, id:', id);

  const { error: dbError } = await supabase.from('profiles').insert(insertData);

  if (dbError) {
    console.error('[save] DB insert 실패:', dbError.message, dbError.code);
    return res.status(500).json({
      success: false,
      error: `프로필 저장 실패: ${dbError.message}`,
      code: dbError.code,
    });
  }

  console.log('[save] 저장 완료, id:', id);
  return res.status(200).json({
    success: true,
    id,
    url: `/profile/${id}`,
  });
}
