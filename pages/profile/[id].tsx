import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { supabaseAdmin } from '@/lib/supabase';
import { ProfileData } from '@/types';
import { DEMO_PROFILE, DEMO_SIMPLE_PROFILE } from '@/lib/demoData';
import { ExpertCard, SnsInfoSection } from '@/components/profile/StepPreview';

const DEFAULT_INTRO = '고객 상황에 맞는 보험 설계를 통해 신뢰할 수 있는 금융 파트너가 되겠습니다.';

interface Props { profile: ProfileData | null; }

export default function ProfilePage({ profile }: Props) {
  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'Pretendard, sans-serif' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2540', marginBottom: '8px' }}>프로필을 찾을 수 없습니다</h2>
        <p style={{ color: '#94a3b8' }}>URL을 다시 확인해주세요.</p>
      </div>
    );
  }

  const agent = profile.agentInfo;
  const isExpert = profile.profileType === 'expert';
  const displayIntro = profile.userIntro || profile.aiIntro || DEFAULT_INTRO;
  const careers = agent?.careers?.filter(c => c?.trim()) || [];

  return (
    <>
      <Head>
        <title>{agent?.name} — INCAR PROFILE</title>
        <meta name="description" content={displayIntro.slice(0, 100)} />
        <meta property="og:title" content={`${agent?.name} — 보험 전문가`} />
        <meta property="og:description" content={displayIntro.slice(0, 100)} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="mobile-container" style={{
        background: '#f5f7fb',
        minHeight: '100dvh', paddingBottom: '100px',
      }}>

        {/* ── 전문가형 ── */}
        {isExpert && (
          <div>
            {/* 공통 ExpertCard — 미리보기와 동일 컴포넌트 */}
            <ExpertCard profileData={profile} />

            {/* 콘텐츠: 주요경력 → 소개 → 추가정보 */}
            <div style={{ padding: '16px 16px 0', background: '#f5f7fb' }}>

              {careers.length > 0 && (
                <DarkSection>
                  <DarkLabel>주요 경력</DarkLabel>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {careers.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < careers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <span style={{ color: '#5a87be', fontSize: '16px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>•</span>
                        <span style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, fontWeight: 500 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </DarkSection>
              )}

              <DarkSection>
                <DarkLabel>소개</DarkLabel>
                {/* 인용구 스타일 */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-8px', left: '-4px', color: 'rgba(30,58,110,0.25)', fontSize: '32px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
                  <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.9, paddingLeft: '18px', whiteSpace: 'pre-line' }}>
                    {displayIntro}
                  </p>
                </div>
              </DarkSection>

              {(agent?.email || agent?.kakao || agent?.blog || (agent as any)?.instagram || (agent as any)?.youtube) && (
                <DarkSection>
                  <DarkLabel>추가 정보</DarkLabel>
                  <SnsInfoSection agent={agent} dark={false} />
                </DarkSection>
              )}
            </div>
          </div>
        )}

        {/* ── 간편형 ── */}
        {!isExpert && (
          <div>
            <div style={{ background: 'linear-gradient(180deg, #152a52 0%, #1e3a6e 100%)', padding: '48px 24px 72px' }}>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <img src="/images/IncarLogo.svg" alt="INCAR" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '2.5px solid rgba(255,255,255,0.28)', boxShadow: '0 8px 28px rgba(0,0,0,0.25)' }}>
                  {profile.photoUrl && <img src={profile.photoUrl} alt={agent?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </div>
              <h1 style={{ textAlign: 'center', color: 'white', fontSize: '30px', fontWeight: 700, marginBottom: '4px' }}>{agent?.name}</h1>
              {[agent?.branch, agent?.position].filter(Boolean).length > 0 && (
                <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.75)', fontSize: '17px', marginBottom: '4px' }}>
                  {[agent?.branch, agent?.position].filter(Boolean).join(' · ')}
                </p>
              )}
              {agent?.slogan && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>"{agent.slogan}"</p>}
              {agent?.specialty?.filter((s: string) => s?.trim()).length > 0 && (
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                  {agent?.specialty?.filter((s: string) => s?.trim()).map((s: string) => (
                    <span key={s} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '4px' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 콘텐츠: 주요경력 → 소개 → 추가정보 */}
            <div style={{ marginTop: '-32px', padding: '0 16px' }}>
              {careers.length > 0 && (
                <LightCard>
                  <LightLabel>주요 경력</LightLabel>
                  {careers.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < careers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <span style={{ color: '#1e3a6e', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>•</span>
                      <span style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{c}</span>
                    </div>
                  ))}
                </LightCard>
              )}

              <LightCard>
                <LightLabel>소개</LightLabel>
                <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-line' }}>{displayIntro}</p>
              </LightCard>

              {(agent?.email || agent?.kakao || agent?.blog || (agent as any)?.instagram || (agent as any)?.youtube) && (
                <LightCard>
                  <LightLabel>추가 정보</LightLabel>
                  <SnsInfoSection agent={agent} dark={false} />
                </LightCard>
              )}
            </div>
          </div>
        )}

        {/* fixed 전화버튼 — 공개 페이지 전용 */}
        {agent?.phone && (
          <a href={`tel:${agent.phone}`} style={{
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)', maxWidth: '390px',
            background: '#1e3a6e', color: 'white',
            borderRadius: '14px', padding: '17px',
            textAlign: 'center', fontSize: '16px', fontWeight: 700,
            textDecoration: 'none', display: 'block',
            boxShadow: '0 4px 24px rgba(14,30,60,0.35)', zIndex: 50,
          }}>
            전화 상담  {agent.phone}
          </a>
        )}
      </div>
    </>
  );
}

// ── 전문가형 섹션 헬퍼 ──
function DarkSection({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: '12px', padding: '20px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>{children}</div>;
}
function DarkLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>{children}</p>;
}
const darkRow: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', textDecoration: 'none', color: '#374151', borderBottom: '1px solid #f1f5f9' };

// ── 간편형 섹션 헬퍼 ──
function LightCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>{children}</div>;
}
function LightLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>{children}</p>;
}
const lightRow: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', textDecoration: 'none' };

// ── 아이콘 ──
function KakaoIcon() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: '#FEE500', flexShrink: 0 }}><svg width="14" height="13" viewBox="0 0 24 22" fill="none"><path d="M12 0C5.373 0 0 4.163 0 9.3c0 3.323 1.99 6.242 5.008 8.006L3.75 22l5.108-2.813C9.906 19.38 10.94 19.5 12 19.5c6.627 0 12-4.163 12-9.3S18.627 0 12 0z" fill="#3A1D1D" /></svg></span>;
}
function NaverIcon() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: '#03C75A', flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 3h7.5l5 7.5V3H21v18h-7.5L8.5 13.5V21H3z" fill="white" /></svg></span>;
}
function ChevronWhite() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ChevronGray() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" /></svg>;
}

// ── getServerSideProps ──
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  if (id === 'demo-001') return { props: { profile: DEMO_PROFILE } };
  if (id === 'demo-002') return { props: { profile: DEMO_SIMPLE_PROFILE } };

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error || !data) return { props: { profile: null } };

    const profile: ProfileData = {
      id: data.id,
      profileType: data.profile_type,
      agentInfo: {
        name: data.agent_name,
        company: data.agent_company,
        careers: data.agent_careers || (data.agent_career ? [data.agent_career] : []),
        specialty: data.agent_specialty || [],
        branch: data.agent_branch || data.agent_region || '',
        position: data.agent_position || data.agent_slogan || '설계사',
        phone: data.agent_phone,
        email: data.agent_email,
        kakao: data.agent_kakao || '',
        blog: data.agent_blog || '',
        instagram: data.agent_instagram || '',
        youtube: data.agent_youtube || '',
      },
      photoUrl: data.photo_url,
      processedPhotoUrl: data.processed_photo_url,
      aiIntro: data.ai_intro,
      userIntro: data.user_intro,
      createdAt: data.created_at,
    };
    return { props: { profile } };
  } catch {
    return { props: { profile: null } };
  }
};
