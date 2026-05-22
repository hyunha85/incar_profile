import type { NextApiRequest, NextApiResponse } from 'next';
import { removeBackground } from '@/lib/removeBg';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { imageBase64, profileType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'imageBase64 is required' });
  }

  // simple 타입은 처리 불필요
  if (profileType === 'simple') {
    return res.status(200).json({ success: true, url: null, skipped: true });
  }

  // Remove.bg API 키 없으면 즉시 폴백
  if (!process.env.REMOVEBG_API_KEY) {
    console.warn('REMOVEBG_API_KEY not set — skipping background removal');
    return res.status(200).json({ success: false, url: null, error: 'API key not configured' });
  }

  try {
    // 1. Remove.bg로 배경 제거
    const processedBase64 = await removeBackground(imageBase64);

    // 2. Supabase Storage 업로드 시도 (Service Role 키가 있을 때만)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, serviceKey);
        const fileName = `processed/${uuidv4()}.png`;
        const buffer = Buffer.from(
          processedBase64.replace(/^data:image\/png;base64,/, ''),
          'base64'
        );

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, buffer, { contentType: 'image/png' });

        if (!uploadError) {
          const { data } = supabase.storage.from('profile-images').getPublicUrl(fileName);
          return res.status(200).json({ success: true, url: data.publicUrl });
        }
        // 업로드 실패 → base64 폴백으로 계속
        console.warn('Supabase upload failed, returning base64:', uploadError.message);
      } catch (uploadErr: any) {
        console.warn('Supabase upload error:', uploadErr.message);
      }
    }

    // 3. Supabase 없거나 실패 → 배경제거된 base64 직접 반환
    return res.status(200).json({ success: true, url: processedBase64 });

  } catch (e: any) {
    console.error('Remove BG error:', e.message);
    return res.status(200).json({ success: false, url: null, error: e.message });
  }
}
