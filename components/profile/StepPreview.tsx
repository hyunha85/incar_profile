import { ProfileData } from '@/types';
import { useState } from 'react';
import { useRouter } from 'next/router';

const DEFAULT_INTRO = '고객 상황에 맞는 보험 설계를 통해 신뢰할 수 있는 금융 파트너가 되겠습니다.';

interface Props {
  profileData: ProfileData;
  onBack: () => void;
  isDemo: boolean;
}

export default function StepPreview({ profileData, onBack, isDemo }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ id: string; url: string; warning?: string } | null>(null);
  const [toast, setToast] = useState(false);
  const [saveError, setSaveError] = useState('');

  const agent = profileData.agentInfo;
  const isExpert = profileData.profileType === 'expert';
  const displayIntro = profileData.userIntro || profileData.aiIntro || DEFAULT_INTRO;
  const careers = agent?.careers?.filter(c => c.trim()) || [];

  const handleSave = async () => {
    console.log('[StepPreview] 저장 클릭, isDemo:', isDemo);
    setSaveError('');

    // Demo 모드 — 즉시 모달 표시
    if (isDemo) {
      const demoId = profileData.profileType === 'simple' ? 'demo-002' : 'demo-001';
      setModal({ id: demoId, url: `${window.location.origin}/profile/${demoId}` });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      // res.text()로 안전하게 받아서 파싱
      const rawText = await res.text();
      console.log('[StepPreview] 응답:', res.status, rawText.slice(0, 300));

      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `저장 실패 (${res.status})`);
      }

      if (data.id) {
        // 저장 성공 → 모달 자동 오픈
        setModal({
          id: data.id,
          url: `${window.location.origin}/profile/${data.id}`,
        });
      } else {
        throw new Error('프로필 ID를 받지 못했습니다.');
      }
    } catch (e: any) {
      console.error('[StepPreview] 저장 오류:', e.message);
      setSaveError(e.message || '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!modal) return;
    navigator.clipboard.writeText(modal.url);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div style={{ background: '#f5f7fb', minHeight: 'calc(100dvh - 80px)', paddingBottom: '40px' }}>
      {/* 프로필 카드 */}
      <div style={{ padding: '20px 20px 0' }}>
        {isExpert ? <ExpertCard profileData={profileData} /> : <SimpleCard profileData={profileData} />}
      </div>

      {/* 콘텐츠 순서: 주요경력 → 자기소개 → 추가정보 */}
      {careers.length > 0 && (
        <Section>
          <Label>주요 경력</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {careers.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#1e3a6e', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{c}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <Label>소개</Label>
        <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-line' }}>{displayIntro}</p>
      </Section>

      {(agent?.email || agent?.kakao || agent?.blog || (agent as any)?.instagram || (agent as any)?.youtube) && (
        <Section>
          <Label>추가 정보</Label>
          <SnsInfoSection agent={agent} dark={false} />
        </Section>
      )}

      {/* 저장 버튼 — 전화버튼 없음 */}
      <div style={{ padding: '16px 20px 0' }}>
        {saveError && (
          <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: '#c53030' }}>
            {saveError}
          </div>
        )}
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : isDemo ? 'Demo URL 발급' : '저장 및 URL 발급'}
        </button>
        <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={onBack}>수정하기</button>
      </div>

      {/* 생성 완료 모달 */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 24px 44px', width: '100%', maxWidth: '430px' }}>
            <div style={{ width: '36px', height: '4px', background: '#e2e8f0', borderRadius: '99px', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2540', marginBottom: '6px' }}>프로필 생성 완료</h3>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '18px' }}>프로필 URL이 생성되었습니다.</p>
            {modal?.warning && (
              <p style={{ fontSize: '12px', color: '#d97706', marginBottom: '10px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px' }}>
                ⚠️ {modal.warning}
              </p>
            )}
            <div style={{ background: '#f8faff', border: '1px solid #e2eaf8', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#374151', wordBreak: 'break-all', marginBottom: '20px', lineHeight: 1.5 }}>
              {modal.url}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" onClick={handleCopy} style={{ background: '#1e3a6e' }}>URL 복사</button>
              <button className="btn-secondary" onClick={() => router.push(`/profile/${modal.id}`)}>내 페이지 보기</button>
            </div>
            <button onClick={() => setModal(null)} style={{ display: 'block', width: '100%', marginTop: '14px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', padding: '6px' }}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 복사 Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: '#1a2540', color: 'white', padding: '10px 22px', borderRadius: '99px', fontSize: '14px', fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 200, whiteSpace: 'nowrap', animation: 'fadeUp 0.2s ease' }}>
          URL이 복사되었습니다.
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── 공통 레이아웃 ──
function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ margin: '14px 20px 0', background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>{children}</p>;
}
const rowLink: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#374151', textDecoration: 'none' };

// ── 전문가 카드 (미리보기 + 공개페이지 공통) ──
export function ExpertCard({ profileData }: { profileData: ProfileData }) {
  const agent = profileData.agentInfo;
  const photo = profileData.processedPhotoUrl || profileData.photoUrl;
  const specialtyArr = agent?.specialty?.filter((s: string) => s?.trim()) || [];

  return (
    <div style={{
      background: '#0a1530',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      aspectRatio: '3 / 4',
      minHeight: '420px',
      boxShadow: 'none',
    }}>

      {/* z0: 배경 베이스 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#0e2050' }} />

      {/* z1: 왼쪽 삼각형 — 상단 밝은 블루 → 하단 어두운 네이비 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, #1e4080 0%, #0a1835 100%)',
        clipPath: 'polygon(0 0, 75% 0, 0 50%)',
      }} />

      {/* z2: 인물 사진 */}
      {photo ? (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '6%',
        }}>
          <img
            src={photo}
            alt={agent?.name}
            style={{
              width: '82%', maxHeight: '84%',
              objectFit: 'contain', objectPosition: 'top center',
              display: 'block',
              filter: 'none',
            }}
          />
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 2, opacity: 0.12,
        }}>
          <svg width="110" height="140" viewBox="0 0 80 100" fill="none">
            <circle cx="40" cy="28" r="22" fill="white" />
            <path d="M4 100 C4 65 76 65 76 100" fill="white" />
          </svg>
        </div>
      )}

      {/* z3: 오른쪽 삼각형 — 단색, 배경보다 살짝 밝은 네이비 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        background: '#1a3664',
        clipPath: 'polygon(100% 50%, 100% 100%, 25% 100%)',
      }} />

      {/* z4: 하단 페이드 (자연스럽게 어둡게, 삼각형 아님) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        zIndex: 3,
        background: 'linear-gradient(to top, #060d1e 0%, #060d1e 20%, rgba(6,13,30,0.7) 55%, transparent 100%)',
      }} />

      {/* z5: 좌측 상단 로고 + 지점명 */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 7 }}>
        <img
          src="/images/IncarProfile_logo2.svg"
          alt="INCAR"
          style={{ height: '40px', width: 'auto', display: 'block', marginBottom: '6px' }}
        />
        {agent?.branch && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, margin: 0, letterSpacing: '0.3px' }}>
            {agent.branch}
          </p>
        )}
      </div>

      {/* z6: 우측 하단 이름 + 직책 + 태그 */}
      <div style={{
        position: 'absolute', bottom: '22px', right: '20px',
        zIndex: 8, textAlign: 'right',
      }}>
        <h2 style={{
          color: 'white', fontSize: '32px', fontWeight: 800,
          margin: '0 0 3px', letterSpacing: '3px', lineHeight: 1.1,
        }}>
          {agent?.name}
        </h2>
        {agent?.position && (
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '16px',
            fontWeight: 500, margin: '0 0 10px', letterSpacing: '1px',
          }}>
            {agent.position}
          </p>
        )}
        {specialtyArr.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {specialtyArr.map((s: string) => (
              <span key={s} style={{
                background: 'rgba(255,255,255,0.11)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '11px', fontWeight: 600,
                padding: '4px 10px', borderRadius: '5px',
                border: '1px solid rgba(255,255,255,0.2)',
                letterSpacing: '0.2px',
              }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleCard({ profileData }: { profileData: ProfileData }) {
  const agent = profileData.agentInfo;
  // 지점 · 직책 (회사명 제거)
  const subLine = [agent?.branch, agent?.position].filter(Boolean).join(' · ');
  const specialtyArr = agent?.specialty?.filter((s: string) => s?.trim()) || [];

  return (
    <div style={{ borderRadius: '18px', background: 'white', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {/* 원형 프로필 */}
      <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', background: '#e8edf5', border: '4px solid #1e3a6e', marginBottom: '14px' }}>
        {profileData.photoUrl && <img src={profileData.photoUrl} alt={agent?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      {/* 이름 */}
      <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1a2540', marginBottom: '4px' }}>{agent?.name}</h2>

      {/* 지점 · 직책 */}
      {subLine && (
        <p style={{ color: '#718096', fontSize: '17px', marginBottom: '4px' }}>{subLine}</p>
      )}

      {/* 슬로건 */}
      {agent?.slogan && (
        <p style={{ color: '#3a6aa8', fontSize: '13px', fontStyle: 'italic', marginBottom: '0' }}>"{agent.slogan}"</p>
      )}

      {/* 구분선 */}
      <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', margin: '14px 0 12px' }} />

      {/* 전문분야 태그 — 하단 */}
      {specialtyArr.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {specialtyArr.map((s: string) => (
            <span key={s} style={{ background: '#f0f4fb', color: '#1e3a6e', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '4px' }}>{s}</span>
          ))}
        </div>
      )}

    </div>
  );
}

// ── SNS 추가 정보 공통 렌더러 ──
export function SnsInfoSection({ agent, dark = false }: { agent: any; dark?: boolean }) {
  const items = [
    agent?.email && {
      href: `mailto:${agent.email}`,
      label: agent.email,
      icon: <EmailIcon dark={dark} />,
      external: false,
    },
    agent?.kakao && {
      href: agent.kakao,
      label: '카카오톡 상담',
      icon: <KakaoIcon />,
      external: true,
    },
    agent?.blog && {
      href: agent.blog,
      label: '블로그 보기',
      icon: <NaverIcon />,
      external: true,
    },
    agent?.instagram && {
      href: agent.instagram,
      label: '인스타그램',
      icon: <InstagramIcon />,
      external: true,
    },
    agent?.youtube && {
      href: agent.youtube,
      label: '유튜브',
      icon: <YoutubeIcon />,
      external: true,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; external: boolean }[];

  if (items.length === 0) return null;

  const rowStyle: React.CSSProperties = dark
    ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', textDecoration: 'none' }
    : { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', textDecoration: 'none' };

  return (
    <>
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          style={{
            ...rowStyle,
            borderBottom: !dark && i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.icon}
            <span style={{ fontSize: '14px', color: dark ? 'rgba(255,255,255,0.82)' : '#374151', fontWeight: 500 }}>
              {item.label}
            </span>
          </span>
          {dark ? <ChevronWhiteIcon /> : <ChevronGrayIcon />}
        </a>
      ))}
    </>
  );
}

function iconWrap(bg: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: bg, flexShrink: 0 };
}
function EmailIcon({ dark }: { dark?: boolean }) {
  return (
    <span style={iconWrap(dark ? 'rgba(255,255,255,0.12)' : '#f0f4fb')}>
      <svg width="13" height="10" viewBox="0 0 20 16" fill="none">
        <rect x="1" y="1" width="18" height="14" rx="3" stroke={dark ? 'rgba(255,255,255,0.7)' : '#1e3a6e'} strokeWidth="1.5"/>
        <path d="M1 4l9 6 9-6" stroke={dark ? 'rgba(255,255,255,0.7)' : '#1e3a6e'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  );
}
function KakaoIcon() {
  return <span style={iconWrap('#FEE500')}><svg width="14" height="13" viewBox="0 0 24 22" fill="none"><path d="M12 0C5.373 0 0 4.163 0 9.3c0 3.323 1.99 6.242 5.008 8.006L3.75 22l5.108-2.813C9.906 19.38 10.94 19.5 12 19.5c6.627 0 12-4.163 12-9.3S18.627 0 12 0z" fill="#3A1D1D"/></svg></span>;
}
function NaverIcon() {
  return <span style={iconWrap('#03C75A')}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 3h7.5l5 7.5V3H21v18h-7.5L8.5 13.5V21H3z" fill="white"/></svg></span>;
}
function InstagramIcon() {
  return <span style={iconWrap('linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg></span>;
}
function YoutubeIcon() {
  return <span style={iconWrap('#FF0000')}><svg width="14" height="10" viewBox="0 0 24 17" fill="none"><path d="M23.5 2.7a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7C0 4.6 0 8.5 0 8.5s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 12.4 24 8.5 24 8.5s0-3.9-.5-5.8z" fill="white"/><path d="M9.5 12l6.5-3.5L9.5 5v7z" fill="#FF0000"/></svg></span>;
}
function ChevronWhiteIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function ChevronGrayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>;
}
