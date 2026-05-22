import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

async function uploadToStorage(
  supabase: any,
  base64DataUrl: string,
  folder: string,
  id: string
): Promise<string | null> {
  try {
    // base64 데이터 URL에서 실제 base64 추출
    const matches = base64DataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.warn(`[storage] base64 파싱 실패 - 잘못된 형식`);
      return null;
    }

    const ext    = matches[1] === 'png' ? 'png' : 'jpg';
    const b64    = matches[2];
    const buffer = Buffer.from(b64, 'base64');

    // 경로: 영문/숫자/하이픈/슬래시만 사용, leading slash 없음
    const filePath = `${folder}/${id}.${ext}`;
    console.log(`[storage] 업로드 시도: ${filePath} (${buffer.length} bytes)`);

    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) {
      console.warn(`[storage] 업로드 실패 (${filePath}):`, error.message);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log(`[storage] 업로드 성공: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (e: any) {
    console.warn(`[storage] 예외 발생:`, e.message);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const profileData = req.body;
  if (!profileData) {
    return res.status(400).json({ success: false, error: 'Profile data is required' });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey     = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // URL 끝 슬래시 제거
  const cleanUrl = supabaseUrl.replace(/\/$/, '');

  console.log('[save] Supabase URL (앞 30자):', cleanUrl.slice(0, 30));
  console.log('[save] serviceKey 있음:', !!serviceKey);

  if (!cleanUrl || !(serviceKey || anonKey)) {
    return res.status(500).json({ success: false, error: 'Supabase 환경변수가 없습니다.' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(cleanUrl, serviceKey || anonKey);
  const id = uuidv4();

  console.log('[save] 프로필 id:', id);

  // ── Storage 업로드 (실패해도 null 반환, DB insert는 항상 진행) ──
  let photoUrl: string | null = null;
  let processedPhotoUrl: string | null = null;

  if (profileData.photoUrl?.startsWith('data:')) {
    const result = await uploadToStorage(supabase, profileData.photoUrl, 'originals', id);
    photoUrl = result; // null이어도 괜찮음
  } else if (typeof profileData.photoUrl === 'string' && profileData.photoUrl.startsWith('http')) {
    photoUrl = profileData.photoUrl;
  }

  if (profileData.processedPhotoUrl?.startsWith('data:')) {
    const result = await uploadToStorage(supabase, profileData.processedPhotoUrl, 'processed', id);
    processedPhotoUrl = result; // null이어도 괜찮음
  } else if (typeof profileData.processedPhotoUrl === 'string' && profileData.processedPhotoUrl.startsWith('http')) {
    processedPhotoUrl = profileData.processedPhotoUrl;
  }

  console.log('[save] photoUrl:', photoUrl ? '있음' : 'null');
  console.log('[save] processedPhotoUrl:', processedPhotoUrl ? '있음' : 'null');

  // ── DB insert — Storage 결과와 무관하게 항상 실행 ──
  const { error: dbError } = await supabase.from('profiles').insert({
    id,
    profile_type:        profileData.profileType          || null,
    agent_name:          profileData.agentInfo?.name      || null,
    agent_branch:        profileData.agentInfo?.branch    || null,
    agent_position:      profileData.agentInfo?.position  || null,
    agent_company:       profileData.agentInfo?.company   || '인카금융서비스',
    agent_careers:       Array.isArray(profileData.agentInfo?.careers)
                           ? profileData.agentInfo.careers.filter((c: string) => c?.trim())
                           : [],
    agent_specialty:     Array.isArray(profileData.agentInfo?.specialty)
                           ? profileData.agentInfo.specialty
                           : [],
    agent_phone:         profileData.agentInfo?.phone     || null,
    agent_email:         profileData.agentInfo?.email     || null,
    agent_kakao:         profileData.agentInfo?.kakao     || null,
    agent_blog:          profileData.agentInfo?.blog      || null,
    agent_instagram:     profileData.agentInfo?.instagram || null,
    agent_youtube:       profileData.agentInfo?.youtube   || null,
    photo_url:           photoUrl,
    processed_photo_url: processedPhotoUrl,
    ai_intro:            profileData.aiIntro              || null,
    user_intro:          profileData.userIntro            || null,
    created_at:          new Date().toISOString(),
  });

  if (dbError) {
    console.error('[save] DB insert 실패:', dbError.message, '| code:', dbError.code, '| details:', dbError.details);
    return res.status(500).json({
      success: false,
      error: `프로필 저장 실패: ${dbError.message}`,
      code: dbError.code,
    });
  }

  console.log('[save] 저장 완료:', id);
  return res.status(200).json({ success: true, id });
}
