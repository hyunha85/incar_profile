-- ================================
-- INCAR PROFILE — Supabase 스키마
-- ================================
-- Supabase SQL Editor에서 실행하세요

-- 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('simple', 'expert')),
  
  -- 설계사 기본 정보
  agent_name TEXT NOT NULL,
  agent_company TEXT,
  agent_career TEXT,
  agent_specialty TEXT[] DEFAULT '{}',
  agent_region TEXT,
  agent_slogan TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  
  -- 이미지
  photo_url TEXT,
  processed_photo_url TEXT,
  
  -- AI 생성 콘텐츠
  ai_intro TEXT,
  recommended_questions TEXT[] DEFAULT '{}',
  
  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0
);

-- 조회수 인덱스
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용 (공유 URL용)
CREATE POLICY "Public read" ON profiles
  FOR SELECT USING (true);

-- 서비스 역할만 쓰기 허용
CREATE POLICY "Service role write" ON profiles
  FOR INSERT WITH CHECK (true);

-- Storage 버킷 생성 (Supabase 대시보드에서 수동으로 만들거나 아래 SQL 실행)
-- Storage > New bucket > "profile-images" > Public bucket 체크
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Storage 공개 읽기 정책
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images');

-- ================================
-- 스키마 업데이트 (v2)
-- careers 배열, userIntro, kakao, blog 컬럼 추가
-- 기존 DB가 있다면 아래 ALTER 실행
-- ================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS agent_careers TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS agent_kakao TEXT,
  ADD COLUMN IF NOT EXISTS agent_blog TEXT,
  ADD COLUMN IF NOT EXISTS user_intro TEXT;

-- 기존 agent_career 값을 agent_careers 배열 첫 번째 항목으로 마이그레이션
UPDATE profiles
SET agent_careers = ARRAY[agent_career]
WHERE agent_career IS NOT NULL AND agent_career != ''
  AND (agent_careers IS NULL OR agent_careers = '{}');

-- ================================
-- 스키마 업데이트 (v3)
-- branch(지점명), position(직책) 컬럼 추가
-- ================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS agent_branch TEXT,
  ADD COLUMN IF NOT EXISTS agent_position TEXT;

-- 기존 데이터 마이그레이션 (region → branch, slogan → position)
UPDATE profiles
SET agent_branch = agent_region
WHERE agent_branch IS NULL AND agent_region IS NOT NULL;

UPDATE profiles
SET agent_position = COALESCE(agent_slogan, '설계사')
WHERE agent_position IS NULL;
